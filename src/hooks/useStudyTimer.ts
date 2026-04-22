import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { storage } from '../lib/storage';
import { syncActivityToSupabase } from '../lib/auth';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Automatically tracks time spent in the app.
 * Saves elapsed minutes to storage.activity every SAVE_INTERVAL ms
 * and when the app goes to background.
 */
export function useStudyTimer() {
  const startRef = useRef(Date.now());
  const savedRef = useRef(0); // minutes already saved this session

  async function flushMinutes() {
    const now = Date.now();
    const elapsed = Math.floor((now - startRef.current) / 60000);
    const delta = elapsed - savedRef.current;
    if (delta <= 0) return;

    savedRef.current = elapsed;

    const td = todayStr();
    const activity = await storage.getActivity();
    const idx = activity.findIndex((a) => a.date === td);
    if (idx >= 0) {
      activity[idx].minutes += delta;
    } else {
      activity.push({ date: td, minutes: delta });
    }
    // Keep last 90 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const filtered = activity.filter((a) => a.date >= cutoffStr);
    await storage.setActivity(filtered);

    // Sync to Supabase
    const user = await storage.getUser();
    if (user?.email) {
      const todayActivity = filtered.find((a) => a.date === td);
      if (todayActivity) {
        syncActivityToSupabase(user.email, td, todayActivity.minutes).catch(() => {});
      }
    }
  }

  useEffect(() => {
    startRef.current = Date.now();
    savedRef.current = 0;

    // Save every 1 minute
    const interval = setInterval(flushMinutes, 60000);

    // Save when app goes to background
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        flushMinutes();
      }
      if (state === 'active') {
        // Reset timer on return to foreground
        startRef.current = Date.now();
        savedRef.current = 0;
      }
    });

    return () => {
      flushMinutes();
      clearInterval(interval);
      sub.remove();
    };
  }, []);
}
