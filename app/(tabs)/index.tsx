import { ScrollView, View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { AppBackground } from '../../src/components/AppBackground';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useUser } from '../../src/hooks/useUser';
import { daysUntilUbt, today, dailyMotivation, getLevelByPoints, getGrantChance, getUbtDate } from '../../src/lib/ubt';
import { getGrantThreshold } from '../../src/data/specialties';
import { storage } from '../../src/lib/storage';
import { StudyPlan } from '../../src/lib/types';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function ScoreRing({ score, total }: { score: number; total: number }) {
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / total, 1);

  const animatedOffset = useSharedValue(circumference);

  useEffect(() => {
    animatedOffset.value = withTiming(circumference * (1 - progress), {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, circumference]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: animatedOffset.value,
  }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F59E0B"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Animated.View entering={FadeIn.delay(600).duration(400)} style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#FFF' }}>{score}</Text>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>/{total}</Text>
      </Animated.View>
    </View>
  );
}

const UBT_MONTHS = [
  { label: 'Қаңтар', month: 0 },
  { label: 'Ақпан', month: 1 },
  { label: 'Наурыз', month: 2 },
  { label: 'Сәуір', month: 3 },
  { label: 'Мамыр', month: 4 },
  { label: 'Маусым', month: 5 },
  { label: 'Шілде', month: 6 },
  { label: 'Тамыз', month: 7 },
  { label: 'Қыркүйек', month: 8 },
  { label: 'Қазан', month: 9 },
  { label: 'Қараша', month: 10 },
  { label: 'Желтоқсан', month: 11 },
];

export default function Home() {
  const router = useRouter();
  const { user, save } = useUser();
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [minutes, setMinutes] = useState(0);
  const [score, setScore] = useState(0);
  const [focusKey, setFocusKey] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickYear, setPickYear] = useState(new Date().getFullYear());
  const [pickMonth, setPickMonth] = useState(4);
  const [pickDay, setPickDay] = useState(10);
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [scoreInput, setScoreInput] = useState('');

  useFocusEffect(
    useCallback(() => {
      setFocusKey((k) => k + 1);
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const td = today();

        const act = await storage.getActivity();
        setMinutes(act.find((a) => a.date === td)?.minutes ?? 0);

        // Ағымдағы балл: user-ден оқу (қолмен енгізілген немесе stats-тан есептелген)
        const u = await storage.getUser();
        if (u && u.currentScore > 0) {
          setScore(u.currentScore);
        } else {
          const stats = await storage.getStats();
          const total = stats.reduce((a, b) => a + b.correct + b.wrong, 0);
          const correct = stats.reduce((a, b) => a + b.correct, 0);
          setScore(total === 0 ? 0 : Math.round((correct / total) * 140));
        }

        // Жоспар тапсырмаларын жүктеу
        setPlans(await storage.getPlans());
      })();
    }, [])
  );

  const todayPlans = plans.filter((p) => p.date === today());
  const planDoneCount = todayPlans.filter((p) => p.completed).length;

  const level = getLevelByPoints(user?.points ?? 0);
  const grantThreshold = getGrantThreshold(user?.specialty ?? 'it');
  const grantChance = getGrantChance(score, grantThreshold);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const studyTimeText = hours > 0 ? `${hours} сағ ${mins} мин` : `${mins} мин`;

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView key={focusKey} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {/* Greeting + Badge */}
          <Animated.View
            entering={FadeInDown.duration(500).springify()}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}
          >
            <View>
              <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#FFF', lineHeight: 34 }}>
                Сәлем,{'\n'}{user?.name ?? 'Оқушы'}! 👋
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/leaderboard')}
              style={{
                backgroundColor: 'rgba(245,158,11,0.12)',
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: 'rgba(245,158,11,0.25)',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: 13 }}>{level}</Text>
              <Text style={{ fontSize: 16, marginTop: 2 }}>⭐</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* UBT Countdown */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(500).springify()}
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 20,
              padding: 20,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <TouchableOpacity onPress={() => {
              const ubt = getUbtDate(user?.ubtDate || undefined);
              setPickYear(ubt.getFullYear());
              setPickMonth(ubt.getMonth());
              setPickDay(ubt.getDate());
              setShowDatePicker(true);
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 52, fontWeight: 'bold', color: '#FFF' }}>
                  {daysUntilUbt(user?.ubtDate || undefined)}
                </Text>
                <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', marginLeft: 8, marginBottom: 10 }}>
                  күн қалды
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>ҰБТ-ға дейін</Text>
                <Text style={{ color: '#6C63FF', fontSize: 13, marginLeft: 8 }}>📅 Күнді өзгерту</Text>
              </View>
            </TouchableOpacity>
            {/* Gold progress bar */}
            <View
              style={{
                height: 6,
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 3,
                marginTop: 14,
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: '100%',
                  borderRadius: 3,
                  width: `${Math.min(100, Math.max(5, 100 - (daysUntilUbt(user?.ubtDate || undefined) / 365) * 100))}%`,
                }}
              />
            </View>
          </Animated.View>

          {/* Score + Grant side by side */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(500).springify()}
            style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}
          >
            {/* Score Ring Card */}
            <TouchableOpacity
              onPress={() => {
                setScoreInput(String(score));
                setShowScoreInput(true);
              }}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                alignItems: 'center',
              }}
            >
              <ScoreRing score={score} total={140} />
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 8 }}>
                Ағымдағы ұпай
              </Text>
              <Text style={{ color: '#6C63FF', fontSize: 11, marginTop: 4 }}>Өзгерту</Text>
            </TouchableOpacity>

            {/* Grant Chance Card */}
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 28, marginBottom: 8, opacity: 0.8 }}>🎓</Text>
              <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#FFF' }}>{grantChance}%</Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>
                Грант мүмкіндігі
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>
                мин. {grantThreshold} балл
              </Text>
            </View>
          </Animated.View>

          {/* Study time today */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500).springify()}
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding: 16,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: 'rgba(245,158,11,0.15)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 14,
              }}
            >
              <Text style={{ fontSize: 20 }}>🕐</Text>
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>
              Бүгінгі оқу:{' '}
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{studyTimeText}</Text>
            </Text>
          </Animated.View>

          {/* Motivation */}
          {(() => {
            const m = dailyMotivation();
            return (
              <Animated.View entering={FadeInDown.delay(400).duration(500).springify()} style={{ marginBottom: 14 }}>
                <View
                  style={{
                    backgroundColor: 'rgba(108,99,255,0.08)',
                    borderRadius: 20,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: 'rgba(108,99,255,0.15)',
                  }}
                >
                  <Text style={{ fontSize: 32, marginBottom: 10 }}>{m.emoji}</Text>
                  <Text style={{ color: '#FFF', fontSize: 16, lineHeight: 24, fontWeight: '600', marginBottom: m.author ? 8 : 0 }}>
                    "{m.text}"
                  </Text>
                  {m.author !== '' && (
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>— {m.author}</Text>
                  )}
                </View>
              </Animated.View>
            );
          })()}

          {/* Study Plan — compact */}
          <Animated.View entering={FadeInDown.delay(500).duration(500).springify()} style={{ marginBottom: 14 }}>
            <TouchableOpacity onPress={() => router.push('/planner')}>
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: todayPlans.length > 0 ? 10 : 0 }}>
                  <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#FFF' }}>Бүгінгі жоспар</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {todayPlans.length > 0 && (
                      <View style={{ backgroundColor: 'rgba(108,99,255,0.15)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ color: '#6C63FF', fontSize: 13, fontWeight: '600' }}>
                          {planDoneCount}/{todayPlans.length}
                        </Text>
                      </View>
                    )}
                    <Text style={{ color: '#6C63FF', fontSize: 13 }}>Толық жоспар ›</Text>
                  </View>
                </View>

                {todayPlans.length > 0 && (
                  <>
                    <View
                      style={{
                        height: 5,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        borderRadius: 3,
                        marginBottom: 10,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          height: '100%',
                          backgroundColor: '#22C55E',
                          borderRadius: 3,
                          width: `${todayPlans.length > 0 ? (planDoneCount / todayPlans.length) * 100 : 0}%`,
                        }}
                      />
                    </View>
                    {todayPlans.slice(0, 4).map((p, i) => (
                      <View
                        key={p.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 7,
                          borderTopWidth: i > 0 ? 1 : 0,
                          borderTopColor: 'rgba(255,255,255,0.06)',
                        }}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            marginRight: 10,
                            borderWidth: 2,
                            borderColor: p.completed ? '#22C55E' : 'rgba(255,255,255,0.2)',
                            backgroundColor: p.completed ? '#22C55E' : 'transparent',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          {p.completed && <Text style={{ color: '#FFF', fontSize: 9 }}>✓</Text>}
                        </View>
                        <Text
                          style={{
                            flex: 1,
                            color: p.completed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
                            textDecorationLine: p.completed ? 'line-through' : 'none',
                            fontSize: 14,
                          }}
                          numberOfLines={1}
                        >
                          {p.title}
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{p.duration}м</Text>
                      </View>
                    ))}
                    {todayPlans.length > 4 && (
                      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 6, textAlign: 'center' }}>
                        +{todayPlans.length - 4} тапсырма...
                      </Text>
                    )}
                  </>
                )}

                {todayPlans.length === 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <Text style={{ fontSize: 28, marginRight: 12 }}>📋</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                      Тапсырма қосу үшін басыңыз
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Quick actions */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(500).springify()}
            style={{ flexDirection: 'row', gap: 12 }}
          >
            <TouchableOpacity onPress={() => router.push('/proforientation')} style={{ flex: 1 }}>
              <LinearGradient
                colors={['#FF8C00', '#FF6B35']}
                style={{ borderRadius: 16, padding: 16, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 24, marginBottom: 4 }}>🎯</Text>
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>Кәсіби бағдар</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/leaderboard')} style={{ flex: 1 }}>
              <LinearGradient
                colors={['#3B82F6', '#6C63FF']}
                style={{ borderRadius: 16, padding: 16, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 24, marginBottom: 4 }}>🏆</Text>
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>Рейтинг</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {/* Score Input Modal */}
        <Modal visible={showScoreInput} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}>
            <View style={{
              backgroundColor: '#1A0B3E',
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 8 }}>
                Ағымдағы балл
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 20 }}>
                Соңғы тест нәтижеңізді енгізіңіз (0-140)
              </Text>

              <TextInput
                value={scoreInput}
                onChangeText={(t) => {
                  const num = t.replace(/[^0-9]/g, '');
                  if (num === '' || parseInt(num) <= 140) setScoreInput(num);
                }}
                keyboardType="numeric"
                maxLength={3}
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.2)"
                style={{
                  width: 140,
                  fontSize: 48,
                  fontWeight: 'bold',
                  color: '#FFF',
                  textAlign: 'center',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderRadius: 20,
                  paddingVertical: 16,
                  borderWidth: 2,
                  borderColor: '#6C63FF',
                  marginBottom: 8,
                }}
              />
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 20 }}>/ 140</Text>

              {/* Quick select */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                {[60, 80, 100, 110, 120, 130].map((v) => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => setScoreInput(String(v))}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      backgroundColor: scoreInput === String(v) ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.06)',
                      borderWidth: 1,
                      borderColor: scoreInput === String(v) ? '#6C63FF' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <Text style={{ color: scoreInput === String(v) ? '#6C63FF' : 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
                      {v}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Buttons */}
              <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                <TouchableOpacity
                  onPress={() => setShowScoreInput(false)}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 14,
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>Болдырмау</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    const val = Math.min(140, Math.max(0, parseInt(scoreInput) || 0));
                    setScore(val);
                    if (user) {
                      await save({ ...user, currentScore: val });
                    }
                    setShowScoreInput(false);
                  }}
                  style={{ flex: 1 }}
                >
                  <LinearGradient
                    colors={['#6C63FF', '#5046E5']}
                    style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Сақтау</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Date Picker Modal */}
        <Modal visible={showDatePicker} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}>
            <View style={{
              backgroundColor: '#1A0B3E',
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.15)',
            }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 20, textAlign: 'center' }}>
                ҰБТ күнін таңдаңыз
              </Text>

              {/* Year */}
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8, marginLeft: 4 }}>Жыл</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                {[new Date().getFullYear(), new Date().getFullYear() + 1].map((y) => (
                  <TouchableOpacity
                    key={y}
                    onPress={() => setPickYear(y)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 14,
                      alignItems: 'center',
                      backgroundColor: pickYear === y ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.06)',
                      borderWidth: 1.5,
                      borderColor: pickYear === y ? '#6C63FF' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <Text style={{ color: pickYear === y ? '#6C63FF' : 'rgba(255,255,255,0.6)', fontWeight: 'bold', fontSize: 18 }}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Month */}
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8, marginLeft: 4 }}>Ай</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {UBT_MONTHS.map((m) => (
                  <TouchableOpacity
                    key={m.month}
                    onPress={() => setPickMonth(m.month)}
                    style={{
                      width: '30%',
                      paddingVertical: 10,
                      borderRadius: 12,
                      alignItems: 'center',
                      backgroundColor: pickMonth === m.month ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.06)',
                      borderWidth: 1.5,
                      borderColor: pickMonth === m.month ? '#6C63FF' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <Text style={{ color: pickMonth === m.month ? '#6C63FF' : 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' }}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Day */}
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8, marginLeft: 4 }}>Күн</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {Array.from({ length: new Date(pickYear, pickMonth + 1, 0).getDate() }, (_, i) => i + 1).map((d) => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setPickDay(d)}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: pickDay === d ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.06)',
                        borderWidth: 1.5,
                        borderColor: pickDay === d ? '#6C63FF' : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <Text style={{ color: pickDay === d ? '#6C63FF' : 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Buttons */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 14,
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>Болдырмау</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    const dateStr = `${pickYear}-${String(pickMonth + 1).padStart(2, '0')}-${String(pickDay).padStart(2, '0')}`;
                    if (user) {
                      await save({ ...user, ubtDate: dateStr });
                    }
                    setShowDatePicker(false);
                  }}
                  style={{ flex: 1 }}
                >
                  <LinearGradient
                    colors={['#6C63FF', '#5046E5']}
                    style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Сақтау</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </AppBackground>
  );
}
