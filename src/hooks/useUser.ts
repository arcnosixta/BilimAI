import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { storage } from '../lib/storage';
import { User } from '../lib/types';
// Supabase орнына Firebase синхронизациясын қолданамыз
import { syncUserToSupabase } from '../lib/auth'; 
import React from 'react';

interface UserCtx {
  user: User | null;
  loading: boolean;
  reload: () => Promise<void>;
  save: (u: User) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<UserCtx>({
  user: null,
  loading: true,
  reload: async () => {},
  save: async () => {},
  logout: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const u = await storage.getUser();
    setUser(u);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = useCallback(async (u: User) => {
    // 1. Алдымен локалды сақтаймыз (жылдам болу үшін)
    await storage.setUser(u);
    setUser(u);
    
    // 2. Фондық режимде Firebase Firestore-мен синхрондау
    // (Біз бұны алдыңғы қадамда Firebase-ке лайықтап жазғанбыз)
    syncUserToSupabase(u).catch((err) => {
      console.warn('Firebase sync failed in background:', err);
    });
  }, []);

  const logout = useCallback(async () => {
    // Пайдаланушы шыққанда локалды деректі тазалаймыз
    await storage.clearUser();
    setUser(null);
  }, []);

  return React.createElement(
    Ctx.Provider,
    { value: { user, loading, reload, save, logout } },
    children
  );
}

export function useUser() {
  return useContext(Ctx);
}