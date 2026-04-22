import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AppBackground } from '../src/components/AppBackground';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { storage } from '../src/lib/storage';
import { StudyPlan } from '../src/lib/types';
import { today, formatTime } from '../src/lib/ubt';

type Mode = 'day' | 'week' | 'month';

const KZ_DAYS = ['Жк', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб'];
const KZ_MONTHS = [
  'Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым',
  'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан',
];

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function getWeekDates(base: Date): Date[] {
  const day = base.getDay();
  const mon = addDays(base, -(day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}

function getMonthDates(base: Date): Date[] {
  const y = base.getFullYear();
  const m = base.getMonth();
  const count = new Date(y, m + 1, 0).getDate();
  return Array.from({ length: count }, (_, i) => new Date(y, m, i + 1));
}

export default function Planner() {
  const [mode, setMode] = useState<Mode>('week');
  const [selectedDate, setSelectedDate] = useState(today());
  const [baseDate, setBaseDate] = useState(new Date());
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('30');
  const [planType, setPlanType] = useState<'practice' | 'theory'>('practice');

  // Timer state
  const [timerPlanId, setTimerPlanId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useFocusEffect(
    useCallback(() => {
      storage.getPlans().then(setPlans);
    }, [])
  );

  // Timer countdown
  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((s) => {
          if (s <= 1) {
            setTimerRunning(false);
            if (Platform.OS !== 'web') Vibration.vibrate(500);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  // Filter plans by selected date or range
  const filteredPlans =
    mode === 'day'
      ? plans.filter((p) => p.date === selectedDate)
      : mode === 'week'
        ? (() => {
            const week = getWeekDates(baseDate).map(dateStr);
            return plans.filter((p) => week.includes(p.date));
          })()
        : (() => {
            const y = baseDate.getFullYear();
            const m = baseDate.getMonth();
            const prefix = `${y}-${String(m + 1).padStart(2, '0')}`;
            return plans.filter((p) => p.date.startsWith(prefix));
          })();

  const datePlans = plans.filter((p) => p.date === selectedDate);
  const doneCount = datePlans.filter((p) => p.completed).length;

  async function addPlanItem() {
    if (!title.trim()) return;
    const plan: StudyPlan = {
      id: Date.now().toString(),
      title: title.trim(),
      type: planType,
      duration: parseInt(duration) || 30,
      date: selectedDate,
      completed: false,
    };
    const updated = [...plans, plan];
    setPlans(updated);
    await storage.setPlans(updated);
    setTitle('');
    setShowAdd(false);
  }

  async function togglePlan(id: string) {
    const updated = plans.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p));
    setPlans(updated);
    await storage.setPlans(updated);
  }

  async function removePlan(id: string) {
    if (Platform.OS === 'web') {
      if (!window.confirm('Тапсырманы жою?')) return;
    } else {
      await new Promise<void>((resolve) => {
        Alert.alert('Жою', 'Тапсырманы жою?', [
          { text: 'Жоқ', style: 'cancel', onPress: () => resolve() },
          {
            text: 'Иә',
            style: 'destructive',
            onPress: () => {
              const updated = plans.filter((p) => p.id !== id);
              setPlans(updated);
              storage.setPlans(updated);
              resolve();
            },
          },
        ]);
      });
      return;
    }
    const updated = plans.filter((p) => p.id !== id);
    setPlans(updated);
    await storage.setPlans(updated);
  }

  function startTimer(planId: string, minutes: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerPlanId(planId);
    setTimerSeconds(minutes * 60);
    setTimerRunning(true);
  }

  function toggleTimer() {
    setTimerRunning((r) => !r);
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerPlanId(null);
    setTimerSeconds(0);
    setTimerRunning(false);
  }

  function navigateDate(dir: number) {
    const next = new Date(baseDate);
    if (mode === 'day') next.setDate(next.getDate() + dir);
    else if (mode === 'week') next.setDate(next.getDate() + dir * 7);
    else next.setMonth(next.getMonth() + dir);
    setBaseDate(next);
    setSelectedDate(dateStr(next));
  }

  // Stats
  const totalMinutes = filteredPlans.reduce((a, p) => a + p.duration, 0);
  const completedCount = filteredPlans.filter((p) => p.completed).length;

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {/* Mode switcher */}
          <Animated.View
            entering={FadeIn.duration(400)}
            style={{
              flexDirection: 'row',
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 999,
              padding: 4,
              marginBottom: 16,
            }}
          >
            {(['day', 'week', 'month'] as Mode[]).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => {
                  setMode(m);
                  setBaseDate(new Date());
                  setSelectedDate(today());
                }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 999,
                  alignItems: 'center',
                  backgroundColor: mode === m ? '#6C63FF' : 'transparent',
                }}
              >
                <Text
                  style={{
                    color: mode === m ? '#FFF' : 'rgba(255,255,255,0.5)',
                    fontWeight: mode === m ? '700' : '400',
                    fontSize: 15,
                  }}
                >
                  {m === 'day' ? 'Күн' : m === 'week' ? 'Апта' : 'Ай'}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Date navigation */}
          <Animated.View
            entering={FadeInDown.delay(80).duration(400).springify()}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <TouchableOpacity onPress={() => navigateDate(-1)} style={{ padding: 8 }}>
              <Text style={{ color: '#6C63FF', fontSize: 22, fontWeight: 'bold' }}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setBaseDate(new Date()); setSelectedDate(today()); }}
            >
              <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '600' }}>
                {mode === 'day'
                  ? (() => {
                      const d = new Date(selectedDate);
                      return `${d.getDate()} ${KZ_MONTHS[d.getMonth()]}`;
                    })()
                  : mode === 'week'
                    ? (() => {
                        const wk = getWeekDates(baseDate);
                        return `${wk[0].getDate()} – ${wk[6].getDate()} ${KZ_MONTHS[wk[6].getMonth()]}`;
                      })()
                    : `${KZ_MONTHS[baseDate.getMonth()]} ${baseDate.getFullYear()}`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigateDate(1)} style={{ padding: 8 }}>
              <Text style={{ color: '#6C63FF', fontSize: 22, fontWeight: 'bold' }}>›</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Week strip (shown for week/month) */}
          {mode === 'week' && (
            <Animated.View
              entering={FadeInDown.delay(120).duration(400).springify()}
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}
            >
              {getWeekDates(baseDate).map((d) => {
                const ds = dateStr(d);
                const active = ds === selectedDate;
                const isToday = ds === today();
                const hasPlan = plans.some((p) => p.date === ds);
                return (
                  <TouchableOpacity
                    key={ds}
                    onPress={() => setSelectedDate(ds)}
                    style={{
                      flex: 1,
                      marginHorizontal: 2,
                      paddingVertical: 10,
                      borderRadius: 14,
                      alignItems: 'center',
                      backgroundColor: active
                        ? '#6C63FF'
                        : isToday
                          ? 'rgba(108,99,255,0.15)'
                          : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color: active ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {KZ_DAYS[d.getDay()]}
                    </Text>
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: 'bold',
                        color: active ? '#FFF' : 'rgba(255,255,255,0.8)',
                      }}
                    >
                      {d.getDate()}
                    </Text>
                    {hasPlan && (
                      <View
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: active ? '#FFF' : '#F59E0B',
                          marginTop: 3,
                        }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          )}

          {/* Month grid */}
          {mode === 'month' && (
            <Animated.View
              entering={FadeInDown.delay(120).duration(400).springify()}
              style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 4 }}
            >
              {getMonthDates(baseDate).map((d) => {
                const ds = dateStr(d);
                const active = ds === selectedDate;
                const isToday = ds === today();
                const hasPlan = plans.some((p) => p.date === ds);
                return (
                  <TouchableOpacity
                    key={ds}
                    onPress={() => setSelectedDate(ds)}
                    style={{
                      width: '13%',
                      paddingVertical: 8,
                      borderRadius: 10,
                      alignItems: 'center',
                      backgroundColor: active
                        ? '#6C63FF'
                        : isToday
                          ? 'rgba(108,99,255,0.15)'
                          : 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: active || isToday ? '700' : '400',
                        color: active ? '#FFF' : 'rgba(255,255,255,0.7)',
                      }}
                    >
                      {d.getDate()}
                    </Text>
                    {hasPlan && (
                      <View
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: active ? '#FFF' : '#F59E0B',
                          marginTop: 2,
                        }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          )}

          {/* Stats row */}
          <Animated.View
            entering={FadeInDown.delay(160).duration(400).springify()}
            style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 14,
                padding: 14,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <Text style={{ color: '#6C63FF', fontSize: 24, fontWeight: 'bold' }}>
                {completedCount}/{filteredPlans.length}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
                орындалды
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 14,
                padding: 14,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <Text style={{ color: '#F59E0B', fontSize: 24, fontWeight: 'bold' }}>
                {totalMinutes}м
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
                жоспарланған
              </Text>
            </View>
          </Animated.View>

          {/* Active timer */}
          {timerPlanId && (
            <Animated.View entering={FadeIn.duration(300)}>
              <LinearGradient
                colors={timerRunning ? ['#22C55E', '#16A34A'] : ['#6C63FF', '#5046E5']}
                style={{
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 14,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 }}>
                  {plans.find((p) => p.id === timerPlanId)?.title}
                </Text>
                <Text style={{ color: '#FFF', fontSize: 48, fontWeight: 'bold', fontVariant: ['tabular-nums'] }}>
                  {formatTime(timerSeconds)}
                </Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                  <TouchableOpacity
                    onPress={toggleTimer}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: 14,
                      paddingVertical: 10,
                      paddingHorizontal: 24,
                    }}
                  >
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 15 }}>
                      {timerRunning ? '⏸ Тоқтату' : '▶ Жалғастыру'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={stopTimer}
                    style={{
                      backgroundColor: 'rgba(239,68,68,0.3)',
                      borderRadius: 14,
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                    }}
                  >
                    <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 15 }}>✕</Text>
                  </TouchableOpacity>
                </View>
                {timerSeconds === 0 && (
                  <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginTop: 8 }}>
                    Уақыт бітті! 🎉
                  </Text>
                )}
              </LinearGradient>
            </Animated.View>
          )}

          {/* Add button + header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFF' }}>
              {selectedDate === today() ? 'Бүгінгі тапсырмалар' : `${new Date(selectedDate).getDate()} ${KZ_MONTHS[new Date(selectedDate).getMonth()]}`}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View
                style={{
                  backgroundColor: 'rgba(108,99,255,0.15)',
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ color: '#6C63FF', fontSize: 13, fontWeight: '600' }}>
                  {doneCount}/{datePlans.length}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAdd(!showAdd)}>
                <View
                  style={{
                    backgroundColor: showAdd ? 'rgba(239,68,68,0.2)' : 'rgba(108,99,255,0.2)',
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{
                      color: showAdd ? '#EF4444' : '#6C63FF',
                      fontSize: 13,
                      fontWeight: '600',
                    }}
                  >
                    {showAdd ? '✕ Жабу' : '+ Қосу'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Add form */}
          {showAdd && (
            <Animated.View
              entering={FadeInDown.duration(300)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: 'rgba(108,99,255,0.2)',
              }}
            >
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Тапсырма атауы..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  color: '#FFF',
                  fontSize: 15,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              />

              {/* Type selector */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                {([['practice', '📝 Практика'], ['theory', '📖 Теория']] as const).map(
                  ([t, label]) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setPlanType(t)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 12,
                        alignItems: 'center',
                        backgroundColor:
                          planType === t ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.04)',
                        borderWidth: 1,
                        borderColor:
                          planType === t ? '#6C63FF' : 'rgba(255,255,255,0.08)',
                      }}
                    >
                      <Text
                        style={{
                          color: planType === t ? '#6C63FF' : 'rgba(255,255,255,0.5)',
                          fontWeight: '600',
                          fontSize: 13,
                        }}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>

              {/* Duration + quick picks */}
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 6 }}>
                Уақыт (минут)
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
                {[15, 30, 45, 60, 90, 120].map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setDuration(String(m))}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 10,
                      alignItems: 'center',
                      backgroundColor:
                        duration === String(m)
                          ? 'rgba(108,99,255,0.15)'
                          : 'rgba(255,255,255,0.04)',
                      borderWidth: 1,
                      borderColor:
                        duration === String(m) ? '#6C63FF' : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <Text
                      style={{
                        color:
                          duration === String(m) ? '#6C63FF' : 'rgba(255,255,255,0.5)',
                        fontWeight: '600',
                        fontSize: 13,
                      }}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={addPlanItem}
                disabled={!title.trim()}
                style={{ opacity: title.trim() ? 1 : 0.4 }}
              >
                <LinearGradient
                  colors={['#6C63FF', '#5046E5']}
                  style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
                >
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 15 }}>
                    Тапсырма қосу
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Plan items */}
          {datePlans.length === 0 ? (
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: 24,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <Text style={{ fontSize: 32, marginBottom: 8 }}>📋</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center' }}>
                Бұл күнге тапсырма жоқ.{'\n'}"+ Қосу" батырмасын басыңыз
              </Text>
            </View>
          ) : (
            datePlans.map((p, idx) => {
              const isTimerActive = timerPlanId === p.id;
              return (
                <Animated.View
                  key={p.id}
                  entering={FadeInDown.delay(idx * 50).duration(350).springify()}
                >
                  <View
                    style={{
                      backgroundColor: isTimerActive
                        ? 'rgba(34,197,94,0.08)'
                        : 'rgba(255,255,255,0.06)',
                      borderRadius: 16,
                      padding: 14,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: isTimerActive
                        ? 'rgba(34,197,94,0.2)'
                        : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {/* Checkbox */}
                      <TouchableOpacity onPress={() => togglePlan(p.id)} style={{ marginRight: 12 }}>
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: p.completed ? '#22C55E' : 'rgba(255,255,255,0.25)',
                            backgroundColor: p.completed ? '#22C55E' : 'transparent',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          {p.completed && (
                            <Text style={{ color: '#FFF', fontSize: 11 }}>✓</Text>
                          )}
                        </View>
                      </TouchableOpacity>

                      {/* Title + meta */}
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: p.completed
                              ? 'rgba(255,255,255,0.35)'
                              : '#FFF',
                            fontWeight: '500',
                            fontSize: 15,
                            textDecorationLine: p.completed ? 'line-through' : 'none',
                          }}
                        >
                          {p.title}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                            {p.type === 'theory' ? '📖' : '📝'} {p.duration} мин
                          </Text>
                        </View>
                      </View>

                      {/* Timer button */}
                      {!p.completed && (
                        <TouchableOpacity
                          onPress={() => {
                            if (isTimerActive) {
                              toggleTimer();
                            } else {
                              startTimer(p.id, p.duration);
                            }
                          }}
                          style={{
                            backgroundColor: isTimerActive
                              ? 'rgba(34,197,94,0.2)'
                              : 'rgba(108,99,255,0.15)',
                            borderRadius: 12,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                          }}
                        >
                          <Text
                            style={{
                              color: isTimerActive ? '#22C55E' : '#6C63FF',
                              fontWeight: '600',
                              fontSize: 13,
                            }}
                          >
                            {isTimerActive
                              ? (timerRunning ? '⏸' : '▶')
                              : '⏱ Бастау'}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Delete */}
                      <TouchableOpacity
                        onPress={() => removePlan(p.id)}
                        style={{ marginLeft: 8, padding: 4 }}
                      >
                        <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 16 }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}
