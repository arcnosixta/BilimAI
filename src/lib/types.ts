export type Grade = 9 | 10 | 11;

export type SpecialtyKey =
  | 'medicine'
  | 'it'
  | 'economics'
  | 'law'
  | 'pedagogy'
  | 'engineering'
  | 'business'
  | 'ecology'
  | 'agriculture'
  | 'arts'
  | 'international';

export type SubjectKey =
  | 'math_literacy'
  | 'reading_literacy'
  | 'kz_history'
  | 'math'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'geography'
  | 'world_history'
  | 'informatics'
  | 'english'
  | 'kz_lang'
  | 'kz_lit'
  | 'law_basics'
  | 'german'
  | 'french'
  | 'russian_lang';

export type UserLevel = 'Іздеуші' | 'Білгір' | 'Шебер';

export interface User {
  id?: string;
  name: string;
  email?: string;
  grade: Grade;
  specialty: SpecialtyKey;
  electives: SubjectKey[];
  targetScore: number;
  currentScore: number;
  ubtDate: string; // YYYY-MM-DD
  points: number;
  level: UserLevel;
  avatarEmoji: string;
  createdAt: string;
}

export interface Question {
  id: string;
  subject: SubjectKey;
  chapter: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DailyTask {
  id: string;
  title: string;
  subject?: SubjectKey;
  type: 'theory' | 'practice';
  duration: number; // minutes
  done: boolean;
  date: string; // YYYY-MM-DD
}

export interface PracticeStat {
  subject: SubjectKey;
  correct: number;
  wrong: number;
}

export interface Activity {
  date: string; // YYYY-MM-DD
  minutes: number;
}

export interface TestSession {
  id: string;
  date: string;
  score: number;
  total: number;
  type: 'practice' | 'full';
  duration: number; // seconds
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  subject?: SubjectKey;
  type: 'theory' | 'practice';
  duration: number;
  date: string;
  completed: boolean;
}

export interface Specialty {
  key: SpecialtyKey;
  name: string;
  emoji: string;
  mandatory: SubjectKey[];
  minScore: number;
  universities: string[];
}
