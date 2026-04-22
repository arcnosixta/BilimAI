import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { AppBackground } from '../../src/components/AppBackground';
import { Card } from '../../src/components/ui';
import { SUBJECT_EMOJI, SUBJECT_NAMES } from '../../src/data/specialties';
import { SubjectKey } from '../../src/lib/types';
import { chaptersForSubject, questionsForSubject } from '../../src/data/questions';

export default function SubjectScreen() {
  const { subject } = useLocalSearchParams<{ subject: SubjectKey }>();
  const router = useRouter();
  const chapters = chaptersForSubject(subject);
  const total = questionsForSubject(subject).length;

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: SUBJECT_NAMES[subject],
            headerStyle: { backgroundColor: '#0D0B2E' },
            headerTintColor: '#FFF',
          }}
        />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 56, marginBottom: 8 }}>{SUBJECT_EMOJI[subject]}</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF' }}>
              {SUBJECT_NAMES[subject]}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{total} сұрақ</Text>
          </View>

          {chapters.length === 0 ? (
            <Card>
              <Text style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                Бұл пәнге сұрақтар жақында қосылады.
              </Text>
            </Card>
          ) : (
            chapters.map((ch) => (
              <TouchableOpacity
                key={ch}
                onPress={() =>
                  router.push({
                    pathname: '/practice/quiz',
                    params: { subject, chapter: ch },
                  })
                }
              >
                <Card className="mb-3">
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: 'rgba(108,99,255,0.15)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Text style={{ color: '#6C63FF', fontWeight: 'bold' }}>📖</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '600', color: '#FFF' }}>{ch}</Text>
                      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                        {questionsForSubject(subject).filter((q) => q.chapter === ch).length} сұрақ
                      </Text>
                    </View>
                    <Text style={{ color: 'rgba(255,255,255,0.4)' }}>›</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}
