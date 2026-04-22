import { Question, SubjectKey } from '../lib/types';

// Seed questions — admin can add more later.
export const QUESTIONS: Question[] = [
  {
    id: 'kzh_1',
    subject: 'kz_history',
    chapter: 'Ежелгі Қазақстан',
    text: 'Сақ тайпалары қай ғасырда өмір сүрді?',
    options: ['б.з.б. VIII–III ғғ.', 'б.з. V–X ғғ.', 'XIII ғ.', 'XVIII ғ.'],
    correctIndex: 0,
    explanation: 'Сақтар б.з.б. VIII–III ғасырларда қазіргі Қазақстан аумағын мекендеген.',
  },
  {
    id: 'math_1',
    subject: 'math',
    chapter: 'Алгебра',
    text: '2x + 6 = 14 теңдеуінің түбірі?',
    options: ['2', '4', '6', '8'],
    correctIndex: 1,
    explanation: '2x = 8 ⇒ x = 4.',
  },
  {
    id: 'phys_1',
    subject: 'physics',
    chapter: 'Механика',
    text: 'Еркін түсу үдеуі (жерде) шамамен:',
    options: ['5,8 м/с²', '9,8 м/с²', '12 м/с²', '15 м/с²'],
    correctIndex: 1,
    explanation: 'g ≈ 9,8 м/с².',
  },
];

export function questionsForSubject(s: SubjectKey): Question[] {
  return QUESTIONS.filter((q) => q.subject === s);
}

export function chaptersForSubject(s: SubjectKey): string[] {
  return Array.from(new Set(questionsForSubject(s).map((q) => q.chapter)));
}
