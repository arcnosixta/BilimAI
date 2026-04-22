import { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AppBackground } from '../src/components/AppBackground';
import { Card, GradientButton } from '../src/components/ui';
import { QUESTIONS } from '../src/data/questions';
import { SUBJECT_EMOJI, SUBJECT_NAMES } from '../src/data/specialties';
import { storage } from '../src/lib/storage';
import { useUser } from '../src/hooks/useUser';
import { formatTime } from '../src/lib/ubt';
import { Question, SubjectKey, TestSession } from '../src/lib/types';

const TOTAL_QUESTIONS = 120;
const EXAM_DURATION_SEC = 240 * 60; // 4 сағат

interface Section {
  key: string;
  subject: SubjectKey;
  name: string;
  emoji: string;
  count: number;
}

function buildSections(electives: SubjectKey[]): Section[] {
  const e1 = electives[0];
  const e2 = electives[1];
  return [
    { key: 'math_literacy', subject: 'math_literacy', name: SUBJECT_NAMES.math_literacy, emoji: SUBJECT_EMOJI.math_literacy, count: 10 },
    { key: 'reading_literacy', subject: 'reading_literacy', name: SUBJECT_NAMES.reading_literacy, emoji: SUBJECT_EMOJI.reading_literacy, count: 10 },
    { key: 'kz_history', subject: 'kz_history', name: SUBJECT_NAMES.kz_history, emoji: SUBJECT_EMOJI.kz_history, count: 20 },
    { key: 'elective1', subject: e1 ?? 'math', name: SUBJECT_NAMES[e1 ?? 'math'], emoji: SUBJECT_EMOJI[e1 ?? 'math'], count: 40 },
    { key: 'elective2', subject: e2 ?? 'physics', name: SUBJECT_NAMES[e2 ?? 'physics'], emoji: SUBJECT_EMOJI[e2 ?? 'physics'], count: 40 },
  ];
}

function generateExam(sections: Section[]): Question[] {
  if (QUESTIONS.length === 0) return [];
  const exam: Question[] = [];
  let counter = 0;
  for (const sec of sections) {
    const pool = QUESTIONS.filter((q) => q.subject === sec.subject);
    const src = pool.length > 0 ? pool : QUESTIONS;
    for (let i = 0; i < sec.count; i++) {
      exam.push({ ...src[i % src.length], id: `exam_${counter}`, subject: sec.subject });
      counter++;
    }
  }
  return exam;
}

function getSectionIndex(sections: Section[], idx: number): number {
  let acc = 0;
  for (let i = 0; i < sections.length; i++) {
    acc += sections[i].count;
    if (idx < acc) return i;
  }
  return sections.length - 1;
}

function sectionStart(sections: Section[], secIdx: number): number {
  let acc = 0;
  for (let i = 0; i < secIdx; i++) acc += sections[i].count;
  return acc;
}

export default function UBTExam() {
  const router = useRouter();
  const { user, save } = useUser();
  const sections = useMemo(() => buildSections(user?.electives ?? []), [user]);
  const [questions] = useState(() => generateExam(sections));
  const [started, setStarted] = useState(false);
  const [startSection, setStartSection] = useState(0);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(TOTAL_QUESTIONS).fill(null));
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SEC);
  const [showResult, setShowResult] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    if (!started) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimeUp(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started]);

  useEffect(() => {
    if (timeUp) finishExam();
  }, [timeUp]);

  if (questions.length === 0) {
    return (
      <AppBackground>
        <Stack.Screen options={{ headerShown: true, title: 'ҰБТ Тест', headerStyle: { backgroundColor: '#0D0B2E' }, headerTintColor: '#FFF' }} />
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 56, marginBottom: 16 }}>📝</Text>
          <Text style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontSize: 16 }}>
            Сұрақтар әлі қосылмаған. Жақында қосылады.
          </Text>
        </SafeAreaView>
      </AppBackground>
    );
  }

  // Дайындық экраны
  if (!started) {
    return (
      <AppBackground>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: '#FFF', fontSize: 20 }}>←</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFF', marginLeft: 16 }}>Тестке дайындық</Text>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            <LinearGradient
              colors={['#6C63FF', '#5046E5']}
              style={{ borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 20 }}
            >
              <Text style={{ fontSize: 56, marginBottom: 10 }}>🎯</Text>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 6 }}>
                Толық ҰБТ тесті
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: 13 }}>
                120 сұрақ · 140 балл · 4 сағат
              </Text>
            </LinearGradient>

            <Card style={{ marginBottom: 14 }}>
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 15, marginBottom: 4 }}>
                📋 Қай пәннен бастайсың?
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 10 }}>
                Кез келген бөлімнен бастауға болады — барлығын жауаптау қажет
              </Text>
              {sections.map((s, i) => {
                const sel = startSection === i;
                return (
                  <TouchableOpacity
                    key={s.key}
                    onPress={() => setStartSection(i)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 10,
                      paddingHorizontal: 10,
                      marginVertical: 3,
                      borderRadius: 12,
                      backgroundColor: sel ? 'rgba(108,99,255,0.15)' : 'transparent',
                      borderWidth: 1.5,
                      borderColor: sel ? '#6C63FF' : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <Text style={{ fontSize: 20, marginRight: 12 }}>{s.emoji}</Text>
                    <Text style={{ color: sel ? '#FFF' : 'rgba(255,255,255,0.85)', fontSize: 14, flex: 1, fontWeight: sel ? '600' : '400' }}>
                      {s.name}
                    </Text>
                    <View
                      style={{
                        backgroundColor: sel ? 'rgba(108,99,255,0.3)' : 'rgba(108,99,255,0.1)',
                        borderRadius: 10,
                        paddingHorizontal: 10,
                        paddingVertical: 3,
                        marginRight: 10,
                      }}
                    >
                      <Text style={{ color: sel ? '#FFF' : '#A5A0FF', fontSize: 12, fontWeight: '600' }}>
                        {s.count} сұрақ
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        borderWidth: 2,
                        borderColor: sel ? '#6C63FF' : 'rgba(255,255,255,0.2)',
                        backgroundColor: sel ? '#6C63FF' : 'transparent',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {sel && <Text style={{ color: '#FFF', fontSize: 11 }}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </Card>

            <Card style={{ marginBottom: 20 }}>
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 15, marginBottom: 10 }}>
                ⚠️ Ескерту
              </Text>
              {[
                'Тест басталған соң 4 сағат уақыт беріледі',
                'Уақыт автоматты есептеледі — кідіртуге болмайды',
                'Пәндер бөлек көрсетіледі, алдыңғы бөлімге қайта оралуға болады',
                'Аяқтаған соң автоматты тексеріледі',
              ].map((t) => (
                <View key={t} style={{ flexDirection: 'row', marginBottom: 6 }}>
                  <Text style={{ color: '#F59E0B', marginRight: 8 }}>•</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, flex: 1, lineHeight: 19 }}>
                    {t}
                  </Text>
                </View>
              ))}
            </Card>

            <GradientButton
              title={`${sections[startSection].emoji} ${sections[startSection].name}-нан бастау 🚀`}
              onPress={() => {
                setIdx(sectionStart(sections, startSection));
                setStarted(true);
              }}
            />
          </ScrollView>
        </SafeAreaView>
      </AppBackground>
    );
  }

  async function finishExam() {
    clearInterval(timerRef.current);
    const correct = answers.filter((a, i) => a === questions[i].correctIndex).length;
    const score = Math.round((correct / TOTAL_QUESTIONS) * 140);

    const session: TestSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      score,
      total: TOTAL_QUESTIONS,
      type: 'full',
      duration: EXAM_DURATION_SEC - timeLeft,
    };

    const sessions = await storage.getTestSessions();
    await storage.setTestSessions([...sessions, session]);

    if (user) {
      const allScores = [...sessions.map((s) => s.score), score];
      const bestScore = Math.max(...allScores);
      await save({
        ...user,
        points: user.points + correct * 5,
        currentScore: bestScore,
      });
    }

    setShowResult(true);
  }

  function confirmFinish() {
    const answered = answers.filter((a) => a !== null).length;
    if (Platform.OS === 'web') {
      if (window.confirm(`${answered}/${TOTAL_QUESTIONS} сұраққа жауап бердіңіз. Аяқтау?`)) {
        finishExam();
      }
      return;
    }
    Alert.alert(
      'Тестті аяқтау',
      `${answered}/${TOTAL_QUESTIONS} сұраққа жауап бердіңіз. Аяқтау?`,
      [
        { text: 'Жоқ', style: 'cancel' },
        { text: 'Аяқтау', onPress: finishExam },
      ]
    );
  }

  if (showResult) {
    const correct = answers.filter((a, i) => a === questions[i].correctIndex).length;
    const score = Math.round((correct / TOTAL_QUESTIONS) * 140);
    const perSection = sections.map((sec, i) => {
      const start = sectionStart(sections, i);
      const secCorrect = answers
        .slice(start, start + sec.count)
        .filter((a, j) => a === questions[start + j].correctIndex).length;
      return { ...sec, correct: secCorrect };
    });

    return (
      <AppBackground>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 72, marginBottom: 12 }}>{score >= 100 ? '🎉' : '💪'}</Text>
              <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#FFF' }}>
                {score >= 100 ? 'Жарайсың!' : 'Жалғастыр!'}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 20,
                padding: 24,
                alignItems: 'center',
                marginBottom: 16,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.12)',
              }}
            >
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Сенің баллың</Text>
              <Text style={{ fontSize: 56, fontWeight: 'bold', color: score >= 100 ? '#22C55E' : '#F59E0B', marginVertical: 8 }}>
                {score}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>/ 140</Text>
              <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', width: '100%', marginVertical: 16 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#22C55E', fontSize: 22, fontWeight: 'bold' }}>{correct}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Дұрыс</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#EF4444', fontSize: 22, fontWeight: 'bold' }}>{TOTAL_QUESTIONS - correct}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Қате</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#6C63FF', fontSize: 22, fontWeight: 'bold' }}>
                    {formatTime(EXAM_DURATION_SEC - timeLeft)}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Уақыт</Text>
                </View>
              </View>
            </View>

            <Card style={{ marginBottom: 20 }}>
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14, marginBottom: 10 }}>
                📊 Пәндер бойынша нәтиже
              </Text>
              {perSection.map((s, i) => (
                <View
                  key={s.key}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 8,
                    borderTopWidth: i > 0 ? 1 : 0,
                    borderTopColor: 'rgba(255,255,255,0.06)',
                  }}
                >
                  <Text style={{ fontSize: 18, marginRight: 10 }}>{s.emoji}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, flex: 1 }}>{s.name}</Text>
                  <Text style={{ color: '#6C63FF', fontSize: 13, fontWeight: '600' }}>
                    {s.correct}/{s.count}
                  </Text>
                </View>
              ))}
            </Card>

            <GradientButton title="Басты бетке" onPress={() => router.replace('/(tabs)')} />
          </ScrollView>
        </SafeAreaView>
      </AppBackground>
    );
  }

  const q = questions[idx];
  const picked = answers[idx];
  const answered = answers.filter((a) => a !== null).length;
  const curSecIdx = getSectionIndex(sections, idx);
  const curSec = sections[curSecIdx];
  const secStart = sectionStart(sections, curSecIdx);
  const posInSection = idx - secStart + 1;

  return (
    <AppBackground>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={confirmFinish}>
            <Text style={{ color: '#EF4444', fontWeight: '600' }}>Аяқтау</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: timeLeft < 600 ? '#EF4444' : '#FFF', fontSize: 20, fontWeight: 'bold' }}>
              {formatTime(timeLeft)}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>қалды</Text>
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
            {answered}/{TOTAL_QUESTIONS}
          </Text>
        </View>

        {/* Section header */}
        <View style={{ paddingHorizontal: 20, marginBottom: 6 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(108,99,255,0.12)',
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: 'rgba(108,99,255,0.25)',
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 10 }}>{curSec.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>
                {curSec.name}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 1 }}>
                Бөлім {curSecIdx + 1}/{sections.length} · {posInSection}/{curSec.count}
              </Text>
            </View>
          </View>
        </View>

        {/* Section progress — per section bar */}
        <View style={{ paddingHorizontal: 20, marginBottom: 8, flexDirection: 'row', gap: 4 }}>
          {sections.map((s, i) => {
            const isCur = i === curSecIdx;
            const isDone = i < curSecIdx;
            return (
              <View
                key={s.key}
                style={{
                  flex: s.count,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: isDone ? '#22C55E' : isCur ? '#6C63FF' : 'rgba(255,255,255,0.12)',
                  opacity: isCur ? 1 : 0.7,
                }}
              />
            );
          })}
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
            Сұрақ {idx + 1} / {TOTAL_QUESTIONS}
          </Text>
          <Card className="mb-4">
            <Text style={{ fontSize: 16, color: '#FFF', lineHeight: 24 }}>{q.text}</Text>
          </Card>

          {q.options.map((opt, i) => {
            const sel = picked === i;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  const newAns = [...answers];
                  newAns[idx] = i;
                  setAnswers(newAns);
                }}
                style={{
                  backgroundColor: sel ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.08)',
                  borderWidth: 1,
                  borderColor: sel ? '#6C63FF' : 'rgba(255,255,255,0.12)',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      borderWidth: 2,
                      borderColor: sel ? '#6C63FF' : 'rgba(255,255,255,0.3)',
                      backgroundColor: sel ? '#6C63FF' : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    {sel && <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
                  </View>
                  <Text style={{ color: '#FFF', flex: 1 }}>{opt}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Navigation */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 12, gap: 12 }}>
          <TouchableOpacity
            disabled={idx === 0}
            onPress={() => setIdx(idx - 1)}
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.08)',
              opacity: idx === 0 ? 0.3 : 1,
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>← Алдыңғы</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (idx === TOTAL_QUESTIONS - 1) confirmFinish();
              else setIdx(idx + 1);
            }}
          >
            <LinearGradient
              colors={['#6C63FF', '#5046E5']}
              style={{ paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14, alignItems: 'center' }}
            >
              <Text style={{ color: '#FFF', fontWeight: '600' }}>
                {idx === TOTAL_QUESTIONS - 1 ? 'Аяқтау' : 'Келесі →'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}
