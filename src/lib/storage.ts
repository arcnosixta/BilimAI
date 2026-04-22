import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity, DailyTask, PracticeStat, StudyPlan, TestSession, User } from './types';

const K = {
  user: 'ubt:user',
  tasks: 'ubt:tasks',
  stats: 'ubt:stats',
  activity: 'ubt:activity',
  tests: 'ubt:tests',
  plans: 'ubt:plans',
};

async function get<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function set<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getUser: () => get<User | null>(K.user, null),
  setUser: (u: User) => set(K.user, u),
  clearUser: () => AsyncStorage.removeItem(K.user),

  getTasks: () => get<DailyTask[]>(K.tasks, []),
  setTasks: (t: DailyTask[]) => set(K.tasks, t),

  getStats: () => get<PracticeStat[]>(K.stats, []),
  setStats: (s: PracticeStat[]) => set(K.stats, s),

  getActivity: () => get<Activity[]>(K.activity, []),
  setActivity: (a: Activity[]) => set(K.activity, a),

  getTestSessions: () => get<TestSession[]>(K.tests, []),
  setTestSessions: (t: TestSession[]) => set(K.tests, t),

  getPlans: () => get<StudyPlan[]>(K.plans, []),
  setPlans: (p: StudyPlan[]) => set(K.plans, p),

  clear: async () => {
    await AsyncStorage.multiRemove(Object.values(K));
  },
};
