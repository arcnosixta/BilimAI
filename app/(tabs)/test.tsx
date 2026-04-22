import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { AppBackground } from '../../src/components/AppBackground';
import { Card, GradientButton, SectionTitle } from '../../src/components/ui';
import { storage } from '../../src/lib/storage';
import { TestSession } from '../../src/lib/types';

export default function UBTTest() {
  const router = useRouter();
  const [history, setHistory] = useState<TestSession[]>([]);

  useFocusEffect(
    useCallback(() => {
      storage.getTestSessions().then(setHistory);
    }, [])
  );

  const bestScore = history.length > 0
    ? Math.max(...history.map((h) => h.score))
    : 0;

  const avgScore = history.length > 0
    ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length)
    : 0;

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 20 }}>
            Тест
          </Text>

          {/* Start Test CTA */}
          <LinearGradient
            colors={['#6C63FF', '#5046E5']}
            style={{ borderRadius: 24, padding: 24, marginBottom: 16, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 56, marginBottom: 12 }}>🎯</Text>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 6 }}>
              Толық ҰБТ тесті
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 20 }}>
              120 сұрақ · 240 минут · Нақты ҰБТ форматы
            </Text>
            <View style={{ width: '100%' }}>
              <GradientButton title="Тестті бастау 🚀" onPress={() => router.push('/ubt-exam')} />
            </View>
          </LinearGradient>

          {/* Stats row */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <Card style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Үздік балл</Text>
              <Text style={{ color: '#F59E0B', fontSize: 28, fontWeight: 'bold', marginTop: 4 }}>
                {bestScore}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>/ 140</Text>
            </Card>
            <Card style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Орташа балл</Text>
              <Text style={{ color: '#6C63FF', fontSize: 28, fontWeight: 'bold', marginTop: 4 }}>
                {avgScore}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>/ 140</Text>
            </Card>
            <Card style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Тест саны</Text>
              <Text style={{ color: '#22C55E', fontSize: 28, fontWeight: 'bold', marginTop: 4 }}>
                {history.length}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>рет</Text>
            </Card>
          </View>

          {/* Info */}
          <Card className="mb-4">
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>📋</Text>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Тест форматы</Text>
            </View>
            <View style={{ gap: 6 }}>
              {[
                '📐 Математикалық сауаттылық — 10 сұрақ',
                '📖 Оқу сауаттылығы — 10 сұрақ',
                '🏛️ Қазақстан тарихы — 20 сұрақ',
                '📚 Таңдау пәні 1 — 40 сұрақ',
                '📚 Таңдау пәні 2 — 40 сұрақ',
              ].map((line) => (
                <Text key={line} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 20 }}>
                  {line}
                </Text>
              ))}
            </View>
          </Card>

          {/* Weekly free test */}
          <Card className="mb-4" style={{ borderColor: '#F59E0B', borderWidth: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>🎁</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#F59E0B', fontWeight: 'bold' }}>Аптаның тегін тесті</Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>
                  Әр апта сайын 1 рет толық тест тегін
                </Text>
              </View>
            </View>
          </Card>

          {/* History */}
          <SectionTitle>Тарих</SectionTitle>
          {history.length === 0 ? (
            <Card>
              <Text style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                Әлі тест тапсырмадыңыз. Бірінші тестіңізді бастаңыз!
              </Text>
            </Card>
          ) : (
            history
              .slice()
              .reverse()
              .slice(0, 10)
              .map((s) => (
                <Card key={s.id} className="mb-2">
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor:
                          s.score >= 100 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>
                        {s.score >= 100 ? '✅' : '📝'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#FFF', fontWeight: '600' }}>
                        {s.score} / 140
                      </Text>
                      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                        {new Date(s.date).toLocaleDateString('kk-KZ')} · {Math.round(s.duration / 60)} мин
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: s.score >= 100 ? '#22C55E' : '#EF4444',
                        fontWeight: 'bold',
                      }}
                    >
                      {Math.round((s.score / 140) * 100)}%
                    </Text>
                  </View>
                </Card>
              ))
          )}
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}
