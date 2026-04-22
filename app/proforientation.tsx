import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { AppBackground } from '../src/components/AppBackground';
import { Card, SectionTitle } from '../src/components/ui';
import {
  SPECIALTIES,
  SUBJECT_COMBOS,
  UBT_SCHEDULE,
  UBT_FORMAT,
  SUBJECT_EMOJI,
  SUBJECT_NAMES,
} from '../src/data/specialties';
import { useUser } from '../src/hooks/useUser';

export default function Proforientation() {
  const { user } = useUser();
  const [expandedCombo, setExpandedCombo] = useState<string | null>(null);

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {/* ====== ҰБТ КЕСТЕСІ ====== */}
          <SectionTitle>📅 ҰБТ 2026 кестесі</SectionTitle>
          <Card style={{ marginBottom: 20 }}>
            {UBT_SCHEDULE.map((item, i) => (
              <View
                key={item.period}
                style={{
                  paddingVertical: 12,
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: 'rgba(255,255,255,0.06)',
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 15, marginBottom: 4 }}>
                  {item.period}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                  🗓 {item.dateRange}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>
                  Тіркелу: {item.registration}
                </Text>
                {item.note && (
                  <View
                    style={{
                      backgroundColor: 'rgba(245,158,11,0.12)',
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      marginTop: 6,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text style={{ color: '#F59E0B', fontSize: 11 }}>⭐ {item.note}</Text>
                  </View>
                )}
              </View>
            ))}
          </Card>

          {/* ====== ТЕСТ ФОРМАТЫ ====== */}
          <SectionTitle>📝 ҰБТ тест форматы</SectionTitle>
          <Card style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FFF' }}>{UBT_FORMAT.totalQuestions}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>сұрақ</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#F59E0B' }}>{UBT_FORMAT.totalPoints}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>балл</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#6C63FF' }}>
                  {Math.floor(UBT_FORMAT.durationMinutes / 60)}с {UBT_FORMAT.durationMinutes % 60}м
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>уақыт</Text>
              </View>
            </View>

            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8 }}>Міндетті бөлім (50 балл)</Text>
            <View style={{ marginBottom: 12 }}>
              <Row label="Мат. сауаттылық" value="15 сұрақ → 15 балл" />
              <Row label="Оқу сауаттылығы" value="15 сұрақ → 15 балл" />
              <Row label="ҚР тарихы" value="20 сұрақ → 20 балл" />
            </View>

            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8 }}>Бейіндік бөлім (90 балл)</Text>
            <View>
              <Row label="1-ші пән" value="30 + 15 контекст → 45 балл" />
              <Row label="2-ші пән" value="30 + 15 контекст → 45 балл" />
            </View>
          </Card>

          {/* ====== ПӘН КОМБИНАЦИЯЛАРЫ ====== */}
          <SectionTitle>🔗 Бейіндік пән комбинациялары</SectionTitle>
          <Text style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 14, fontSize: 13 }}>
            13 ресми комбинация — ЖОО-ға түсу үшін
          </Text>
          {SUBJECT_COMBOS.map((combo) => {
            const isOpen = expandedCombo === combo.id;
            const preview = combo.directions.slice(0, 3);
            const rest = combo.directions.length - 3;
            return (
              <TouchableOpacity
                key={combo.id}
                activeOpacity={0.8}
                onPress={() => setExpandedCombo(isOpen ? null : combo.id)}
              >
                <Card style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View
                      style={{
                        backgroundColor: 'rgba(108,99,255,0.15)',
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        marginRight: 10,
                      }}
                    >
                      <Text style={{ color: '#6C63FF', fontSize: 12, fontWeight: '600' }}>{combo.id}</Text>
                    </View>
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14, flex: 1 }}>{combo.name}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                      {combo.directions.length} бағыт {isOpen ? '▲' : '▼'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    {combo.subjects.map((s) => (
                      <View
                        key={s}
                        style={{
                          backgroundColor: 'rgba(108,99,255,0.1)',
                          borderRadius: 10,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          marginRight: 8,
                        }}
                      >
                        <Text style={{ color: '#A5A0FF', fontSize: 12 }}>
                          {SUBJECT_EMOJI[s]} {SUBJECT_NAMES[s]}
                        </Text>
                      </View>
                    ))}
                  </View>
                  {(isOpen ? combo.directions : preview).map((d) => (
                    <View
                      key={d}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        marginBottom: 4,
                      }}
                    >
                      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{d}</Text>
                    </View>
                  ))}
                  {!isOpen && rest > 0 && (
                    <Text style={{ color: '#6C63FF', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                      +{rest} мамандық көру ›
                    </Text>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })}

          {/* ====== МАМАНДЫҚ ====== */}
          <View style={{ marginTop: 8 }} />
          <SectionTitle>🎯 Сенің мамандығың мен грант шегі</SectionTitle>
          <Text style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 14, fontSize: 13 }}>
            Қажетті пәндер мен ең төменгі балл
          </Text>

          {(() => {
            const sp = SPECIALTIES.find((s) => s.key === user?.specialty);
            if (!sp) {
              return (
                <Card>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                    Мамандық таңдалмаған. Профильден өңдеңіз.
                  </Text>
                </Card>
              );
            }
            return (
              <Card style={{ marginBottom: 12, borderColor: '#6C63FF', borderWidth: 1.5 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 36, marginRight: 12 }}>{sp.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFF' }}>{sp.name}</Text>
                    <Text style={{ color: '#F59E0B', fontSize: 13, marginTop: 2 }}>
                      Мин. {sp.minScore} балл
                    </Text>
                  </View>
                </View>

                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8 }}>
                  Міндетті бейіндік пәндер
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
                  {sp.mandatory.map((s) => (
                    <View
                      key={s}
                      style={{
                        backgroundColor: 'rgba(108,99,255,0.15)',
                        borderRadius: 10,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        marginRight: 8,
                        marginBottom: 6,
                      }}
                    >
                      <Text style={{ color: '#A5A0FF', fontSize: 12 }}>
                        {SUBJECT_EMOJI[s]} {SUBJECT_NAMES[s]}
                      </Text>
                    </View>
                  ))}
                </View>

                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8 }}>
                  Ұсынылатын университеттер
                </Text>
                {sp.universities.map((uni) => (
                  <View key={uni} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#6C63FF', marginRight: 10 }} />
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{uni}</Text>
                  </View>
                ))}
              </Card>
            );
          })()}
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{label}</Text>
      <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}
