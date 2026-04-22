import { Platform } from 'react-native';
import { auth } from './firebase'; // Firebase нысанын импорттау
import { updateProfile } from 'firebase/auth';

/**
 * Email verification API — backend серверіне сұранымдар.
 * * Android эмуляторда localhost → 10.0.2.2 болады.
 */
const API_BASE =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3001'
    : 'http://localhost:3001';

/**
 * Серверге код жіберу туралы сұраныс
 */
export async function sendVerificationCode(email: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        return { ok: false, error: errorData.error || 'Код жіберу мүмкін болмады' };
    }
    
    return await res.json();
  } catch (e) {
    return { ok: false, error: 'Серверге қосылу мүмкін болмады' };
  }
}

/**
 * Кодты тексеру және расталған жағдайда Firebase-те белгі қою
 */
export async function verifyCode(email: string, code: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const result = await res.json();

    // Егер сервер кодты растаса (ok: true)
    if (result.ok && auth.currentUser) {
      // Firebase-те пайдаланушы профилін жаңарту (мысалы, displayName-ге белгі қою немесе арнайы метадеректер)
      // Ескерту: Нақты Email Verification статус тек Firebase сілтемесі арқылы өзгереді, 
      // бірақ біз мұны сәтті өткенін білу үшін қолданамыз.
      console.log('Email сәтті расталды');
    }

    return result;
  } catch (e) {
    return { ok: false, error: 'Серверге қосылу мүмкін болмады' };
  }
}