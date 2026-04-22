import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { AppBackground } from '../../src/components/AppBackground';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Card, SectionTitle } from '../../src/components/ui';
import { storage } from '../../src/lib/storage';
import { Activity, PracticeStat } from '../../src/lib/types';
import { lastNDates } from '../../src/lib/ubt';
import { SUBJECT_EMOJI, SUBJECT_NAMES } from '../../src/data/specialties';

export default function Progress() {
  const router = useRouter();
  const [stats, setStats] = useState<PracticeStat[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [focusKey, setFocusKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setFocusKey((k) => k + 1);
      (async () => {
        setStats(await storage.getStats());
        setActivity(await storage.getActivity());
      })();
    }, [])
  );

  const days = lastNDates(7);
  const maxMinutes = Math.max(60, ...activity.map((a) => a.minutes));

  const totalCorrect = stats.reduce((a, b) => a + b.correct, 0);
  const totalAnswered = stats.reduce((a, b) => a + b.correct + b.wrong, 0);
  const readiness = totalAnswered === 0 ? 0 : Math.round((totalCorrect / totalAnswered) * 100);
  const predictedScore = Math.round((readiness / 100) * 140);

  // Strong / Weak topics
  const sorted = [...stats].sort((a, b) => {
    const pa = a.correct + a.wrong === 0 ? 0 : a.correct / (a.correct + a.wrong);
    const pb = b.correct + b.wrong === 0 ? 0 : b.correct / (b.correct + b.wrong);
    return pb - pa;
  });
  const strong = sorted.slice(0, 3);
  const weak = sorted.slice(-3).reverse();

  // Streak
  const streak = days.filter((d) => activity.some((a) => a.date === d && a.minutes > 0)).length;

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView key={focusKey} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Animated.View
            entering={FadeIn.duration(500)}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}
          >
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FFF' }}>Прогресс</Text>
            <TouchableOpacity onPress={() => router.push('/leaderboard')}>
              <View style={{ backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ color: '#F59E0B', fontWeight: '600', fontSize: 12 }}>🏆 Рейтинг</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Readiness */}
          <Animated.View entering={FadeInDown.delay(80).duration(500).springify()}>
          <Card className="mb-4">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Дайындық деңгейі</Text>
                <Text style={{ fontSize: 42, fontWeight: 'bold', color: '#6C63FF', marginTop: 4 }}>
                  {readiness}%
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Белсенділік</Text>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#F59E0B', marginTop: 4 }}>
                  {streak}/7 🔥
                </Text>
              </View>
            </View>
            <View
              style={{
                height: 8,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 4,
                marginTop: 16,
                overflow: 'hidden',
              }}
            >
              <View
                style={{ height: '100%', backgroundColor: '#6C63FF', borderRadius: 4, width: `${readiness}%` }}
              />
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 8 }}>
              Аптаға өзгеріс: +0%
            </Text>
          </Card>
          </Animated.View>

          {/* Activity bars */}
          <Animated.View entering={FadeInDown.delay(160).duration(500).springify()}>
          <Card className="mb-4">
            <SectionTitle>Соңғы 7 күн</SectionTitle>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120 }}>
              {days.map((d) => {
                const min = activity.find((a) => a.date === d)?.minutes ?? 0;
                const h = Math.max(4, (min / maxMinutes) * 100);
                const dt = new Date(d);
                const isToday = d === days[days.length - 1];
                return (
                  <View key={d} style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginBottom: 4 }}>
                      {min > 0 ? `${min}м` : ''}
                    </Text>
                    <LinearGradient
                      colors={isToday ? ['#FF8C00', '#FF6B35'] : ['#6C63FF', '#5046E5']}
                      style={{
                        width: 20,
                        borderTopLeftRadius: 6,
                        borderTopRightRadius: 6,
                        height: `${h}%`,
                      }}
                    />
                    <Text style={{ fontSize: 11, color: isToday ? '#FF8C00' : 'rgba(255,255,255,0.4)', marginTop: 4, fontWeight: isToday ? '600' : '400' }}>
                      {['Жк', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб'][dt.getDay()]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
          </Animated.View>

          {/* AI Prediction */}
          <Animated.View entering={FadeInDown.delay(240).duration(500).springify()}>
          <LinearGradient
            colors={['#3B82F6', '#6C63FF']}
            style={{ borderRadius: 16, padding: 20, marginBottom: 16 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>🤖</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>AI болжамы</Text>
            </View>
            <Text style={{ color: '#FFF', fontSize: 36, fontWeight: 'bold' }}>
              {predictedScore} / 140
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>
              Қазіргі қарқынмен жалғасқанда
            </Text>
          </LinearGradient>
          </Animated.View>

          {/* Strong / Weak */}
          {stats.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(320).duration(500).springify()}
              style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}
            >
              <Card style={{ flex: 1 }}>
                <Text style={{ color: '#22C55E', fontWeight: 'bold', fontSize: 13, marginBottom: 8 }}>
                  💪 Күшті тақырыптар
                </Text>
                {strong.map((s) => (
                  <Text key={s.subject} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 }}>
                    {SUBJECT_EMOJI[s.subject]} {SUBJECT_NAMES[s.subject]}
                  </Text>
                ))}
              </Card>
              <Card style={{ flex: 1 }}>
                <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 13, marginBottom: 8 }}>
                  📌 Жақсарту керек
                </Text>
                {weak.map((s) => (
                  <Text key={s.subject} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 }}>
                    {SUBJECT_EMOJI[s.subject]} {SUBJECT_NAMES[s.subject]}
                  </Text>
                ))}
              </Card>
            </Animated.View>
          )}

          {/* Subject breakdown */}
          <SectionTitle>Пәндер бойынша</SectionTitle>
          {stats.length === 0 ? (
            <Card>
              <Text style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                Практикадан өткен сайын дерегің көрінеді
              </Text>
            </Card>
          ) : (
            stats.map((s, idx) => {
              const total = s.correct + s.wrong;
              const pct = total === 0 ? 0 : Math.round((s.correct / total) * 100);
              return (
                <Animated.View
                  key={s.subject}
                  entering={FadeInDown.delay(400 + idx * 60).duration(450).springify()}
                >
                <Card className="mb-2">
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 20, marginRight: 8 }}>{SUBJECT_EMOJI[s.subject]}</Text>
                    <Text style={{ flex: 1, fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>
                      {SUBJECT_NAMES[s.subject]}
                    </Text>
                    <Text style={{ color: pct >= 70 ? '#22C55E' : pct >= 40 ? '#F59E0B' : '#EF4444', fontWeight: 'bold' }}>
                      {pct}%
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 6,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        height: '100%',
                        backgroundColor: pct >= 70 ? '#22C55E' : pct >= 40 ? '#F59E0B' : '#EF4444',
                        borderRadius: 3,
                        width: `${pct}%`,
                      }}
                    />
                  </View>
                  <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 }}>
                    {s.correct} дұрыс / {s.wrong} қате
                  </Text>
                </Card>
                </Animated.View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}
