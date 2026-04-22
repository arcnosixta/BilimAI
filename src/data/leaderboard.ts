import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import { SpecialtyKey, User } from '../lib/types';

/**
 * Статикалық деректер (Firebase-тен дерек келгенше немесе қате болса көрсетіледі)
 */
export const INITIAL_LEADERBOARD = [
  { name: 'Айгерім Қ.', grade: 11, specialty: 'medicine' as SpecialtyKey, points: 2840 },
  { name: 'Данияр Е.', grade: 11, specialty: 'it' as SpecialtyKey, points: 2710 },
  { name: 'Мадина Т.', grade: 11, specialty: 'economics' as SpecialtyKey, points: 2590 },
];

/**
 * Firebase-тен ең көп ұпай жинаған 20 пайдаланушыны алу
 */
export async function fetchLeaderboard(): Promise<any[]> {
  try {
    // 'users' коллекциясынан points бойынша кему ретімен (desc) алу
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('points', 'desc'), limit(20));
    
    const querySnapshot = await getDocs(q);
    const leaderboardData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return leaderboardData;
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return INITIAL_LEADERBOARD; // Қате болса, статикалық деректі қайтарады
  }
}