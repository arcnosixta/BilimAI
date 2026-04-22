import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { AppBackground } from '../../src/components/AppBackground';
import { Card, PrimaryButton } from '../../src/components/ui';
import { QUESTIONS } from '../../src/data/questions';
import { SubjectKey } from '../../src/lib/types';
import { storage } from '../../src/lib/storage';
import { useUser } from '../../src/hooks/useUser';
import { today } from '../../src/lib/ubt';

export default function Quiz() {
  const router = useRouter();
  const { subject, chapter } = useLocalSearchParams<{
    subject: SubjectKey;
    chapter: string;
  }>();
  const { user, save } = useUser();

  const questions = useMemo(
    () => QUESTIONS.filter((q) => q.subject === subject && q.chapter === chapter),
    [subject, chapter]
  );

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [done, setDone] = useState(false);

  if (questions.length === 0) {
    return (
      <AppBackground>
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
            Сұрақтар әлі қосылмаған
          </Text>
        </SafeAreaView>
      </AppBackground>
    );
  }

  const q = questions[idx];

  async function next() {
    if (picked === null) return;
    const isCorrect = picked === q.correctIndex;
    const newCorrect = correctCount + (isCorrect ? 1 : 0);
    const newWrong = wrongCount + (isCorrect ? 0 : 1);
    setCorrectCount(newCorrect);
    setWrongCount(newWrong);

    if (idx + 1 >= questions.length) {
      const stats = await storage.getStats();
      const existing = stats.find((s) => s.subject === subject);
      if (existing) {
        existing.correct += newCorrect;
        existing.wrong += newWrong;
      } else {
        stats.push({ subject, correct: newCorrect, wrong: newWrong });
      }
      await storage.setStats(stats);

      const act = await storage.getActivity();
      const td = today();
      const e = act.find((a) => a.date === td);
      if (e) e.minutes += questions.length * 2;
      else act.push({ date: td, minutes: questions.length * 2 });
      await storage.setActivity(act);

      if (user) await save({ ...user, points: user.points + newCorrect * 10 });

      setDone(true);
    } else {
      setIdx(idx + 1);
      setPicked(null);
    }
  }

  if (done) {
    return (
      <AppBackground>
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🎉</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 8 }}>
              Жарайсың!
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
              {correctCount} / {questions.length} дұрыс жауап
            </Text>
            <View style={{ width: '100%' }}>
              <PrimaryButton title="Артқа қайту" onPress={() => router.back()} />
            </View>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  const answered = picked !== null;

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
            Сұрақ {idx + 1} / {questions.length}
          </Text>
          <View
            style={{
              height: 8,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 4,
              marginBottom: 20,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                backgroundColor: '#6C63FF',
                borderRadius: 4,
                width: `${((idx + 1) / questions.length) * 100}%`,
              }}
            />
          </View>

          <Card className="mb-4">
            <Text style={{ fontSize: 17, color: '#FFF', lineHeight: 24 }}>{q.text}</Text>
          </Card>

          {q.options.map((opt, i) => {
            let bg = 'rgba(255,255,255,0.08)';
            let borderColor = 'rgba(255,255,255,0.12)';
            if (answered) {
              if (i === q.correctIndex) {
                bg = 'rgba(34,197,94,0.15)';
                borderColor = '#22C55E';
              } else if (i === picked) {
                bg = 'rgba(239,68,68,0.15)';
                borderColor = '#EF4444';
              }
            } else if (picked === i) {
              borderColor = '#6C63FF';
            }
            return (
              <TouchableOpacity
                key={i}
                disabled={answered}
                onPress={() => setPicked(i)}
                style={{
                  backgroundColor: bg,
                  borderWidth: 1,
                  borderColor,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: '#FFF' }}>{opt}</Text>
              </TouchableOpacity>
            );
          })}

          {answered && (
            <Card className="mt-3" style={{ backgroundColor: 'rgba(108,99,255,0.1)' }}>
              <Text style={{ color: '#6C63FF', fontWeight: 'bold', marginBottom: 4 }}>
                Түсіндірме
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>{q.explanation}</Text>
            </Card>
          )}
        </ScrollView>

        <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          <PrimaryButton
            disabled={!answered}
            title={idx + 1 >= questions.length ? 'Аяқтау' : 'Келесі'}
            onPress={next}
          />
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}
