import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Сервер прокси — ключ хранится на сервере, не в клиенте
const SERVER_URL = 'http://localhost:3001';

export async function askCurator(
  messages: { role: 'user' | 'assistant'; text: string }[],
  userEmail?: string
): Promise<string> {
  try {
    const res = await fetch(`${SERVER_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Server Error:', res.status, data);
      if (res.status === 429) {
        return 'Сервер қазір бос емес. 10-15 секундтан кейін қайталаңыз 🔄';
      }
      return `Қате: ${data?.error ?? 'белгісіз'}`;
    }

    const finalResult = data.text || 'Жауап алынбады.';

    // БОЛАШАҚТА: Чат тарихын Firestore-ға сақтау логикасы
    if (userEmail && finalResult !== 'Жауап алынбады.') {
      saveChatToFirestore(userEmail, messages[messages.length - 1].text, finalResult);
    }

    return finalResult;
  } catch (e: any) {
    return `Серверге қосылу мүмкін емес. Сервер іске қосылғанын тексеріңіз.`;
  }
}

/**
 * Чат хабарламаларын Firestore-ға сақтау функциясы
 */
async function saveChatToFirestore(email: string, question: string, answer: string) {
  try {
    await addDoc(collection(db, 'chat_history'), {
      user_email: email,
      question,
      answer,
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.error("Chat сақтау қатесі:", e);
  }
}
