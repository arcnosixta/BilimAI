import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { User } from './types';
import { storage } from './storage';

/**
 * ТІРКЕЛУ — Firebase Auth-та аккаунт ашады және Firestore-ға деректерді сақтайды.
 */
export async function registerUser(user: User, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!user.email || !password) return { ok: false, error: 'Email мен құпия сөз қажет' };

    // 1. Firebase Auth-та қолданушыны тіркеу
    const userCredential = await createUserWithEmailAndPassword(auth, user.email, password);
    const firebaseUser = userCredential.user;

    // Ескі тест нәтижелері болса, ұпайларды есептеу
    const existingSessions = await storage.getTestSessions();
    if (existingSessions.length > 0) {
      user.currentScore = Math.max(...existingSessions.map((s) => s.score));
      user.points = existingSessions.reduce((sum, s) => {
        const correct = Math.round((s.score / 140) * 120);
        return sum + correct * 5;
      }, 0);
    }

    // 2. Firestore-ға арналған деректер құрылымы
    const userData = {
      uid: firebaseUser.uid, // Auth ID-сімен сәйкестендіру
      email: user.email,
      name: user.name,
      grade: user.grade,
      specialty: user.specialty,
      electives: user.electives,
      target_score: user.targetScore,
      current_score: user.currentScore,
      ubt_date: user.ubtDate || null,
      points: user.points,
      level: user.level,
      avatar_emoji: user.avatarEmoji,
      created_at: serverTimestamp()
    };

    // 3. Firestore-ға жазу (құжат ID-сі ретінде UID қолданамыз)
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    // 4. Локалды сақтау
    await storage.setUser({ ...user, id: firebaseUser.uid });
    
    return { ok: true };
  } catch (e: any) {
    let message = 'Тіркелу кезінде қате шықты';
    if (e.code === 'auth/email-already-in-use') message = 'Бұл пошта бұрыннан тіркелген';
    if (e.code === 'auth/weak-password') message = 'Құпия сөз тым әлсіз (кемінде 6 символ)';
    
    console.error('Firebase register error:', e?.message);
    return { ok: false, error: message };
  }
}

/**
 * ЛОГИН — Email және Құпия сөз арқылы кіру
 */
export async function loginUser(email: string, password: string): Promise<{ ok: boolean; user?: User; error?: string }> {
  try {
    // 1. Firebase Auth арқылы тексеру
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // 2. Firestore-дан пайдаланушы деректерін алу
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { ok: false, error: 'Пайдаланушы деректері табылмады' };
    }

    const data = userSnap.data();
    const user: User = {
      id: firebaseUser.uid,
      name: data.name,
      email: data.email,
      grade: data.grade,
      specialty: data.specialty,
      electives: data.electives ?? [],
      targetScore: data.target_score ?? 100,
      currentScore: data.current_score ?? 0,
      ubtDate: data.ubt_date ?? '',
      points: data.points ?? 0,
      level: data.level ?? 'Іздеуші',
      avatarEmoji: data.avatar_emoji ?? '🧑‍🎓',
      createdAt: data.created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    };

    // 3. Локалды жадқа сақтау
    await storage.setUser(user);
    return { ok: true, user };
  } catch (e: any) {
    let message = 'Кіру кезінде қате шықты';
    if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
      message = 'Пошта немесе құпия сөз қате';
    }
    return { ok: false, error: message };
  }
}

/**
 * СИНХРОНДАУ — Пайдаланушы профиліндегі өзгерістерді Firebase-ке жіберу
 */
export async function syncUserToSupabase(user: User): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      name: user.name,
      grade: user.grade,
      specialty: user.specialty,
      electives: user.electives,
      target_score: user.targetScore,
      current_score: user.currentScore,
      ubt_date: user.ubtDate || null,
      points: user.points,
      level: user.level,
      avatar_emoji: user.avatarEmoji,
    });
  } catch (e: any) {
    console.warn('Firebase sync error:', e?.message);
  }
}

/**
 * БЕЛСЕНДІЛІК — Оқу уақытын Firebase-ке сақтау
 */
export async function syncActivityToSupabase(email: string, date: string, minutes: number): Promise<void> {
  if (!email) return;

  try {
    const activityId = `${email}_${date}`;
    const activityRef = doc(db, 'activity', activityId);
    
    await setDoc(activityRef, {
      user_email: email,
      date: date,
      minutes: minutes,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (e: any) {
    console.warn('Firebase activity sync error:', e?.message);
  }
}