import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { AppBackground } from '../../src/components/AppBackground';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useUser } from '../../src/hooks/useUser';
import {
  CORE_SUBJECTS,
  SPECIALTIES,
  SUBJECT_EMOJI,
  SUBJECT_NAMES,
} from '../../src/data/specialties';
import { SubjectKey } from '../../src/lib/types';
import { questionsForSubject } from '../../src/data/questions';

export default function Practice() {
  const { user } = useUser();
  const router = useRouter();
  const [focusKey, setFocusKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setFocusKey((k) => k + 1);
    }, [])
  );

  if (!user) return null;

  // Пайдаланушы тіркелу кезінде таңдаған пәндері (комбинация)
  // Егер electives бос болса — specialty-ден алу (fallback)
  const sp = SPECIALTIES.find((s) => s.key === user.specialty);
  const rawElectives = user.electives.length > 0 ? user.electives : (sp?.mandatory ?? []);
  const chosenSubjects: SubjectKey[] = rawElectives.filter(
    (s) => !CORE_SUBJECTS.includes(s),
  );

  const SubjectCard = ({
    subject,
    index,
    accent,
  }: {
    subject: SubjectKey;
    index: number;
    accent?: string;
  }) => {
    const count = questionsForSubject(subject).length;
    return (
      <Animated.View entering={FadeInDown.delay(80 + index * 50).duration(400).springify()}>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/practice/[subject]', params: { subject } })}
          activeOpacity={0.7}
        >
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding: 14,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: accent ? accent + '25' : 'rgba(255,255,255,0.08)',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: accent ? accent + '15' : 'rgba(255,255,255,0.06)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Text style={{ fontSize: 24 }}>{SUBJECT_EMOJI[subject]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFF' }}>
                {SUBJECT_NAMES[subject]}
              </Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                {count > 0 ? `${count} сұрақ` : 'Жақында қосылады'}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: count > 0 ? (accent ? accent + '20' : 'rgba(108,99,255,0.15)') : 'rgba(255,255,255,0.06)',
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: count > 0 ? (accent || '#6C63FF') : 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '600' }}>
                {count > 0 ? 'Бастау ›' : 'Жақында'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const SectionHeader = ({
    title,
    subtitle,
    emoji,
    index,
  }: {
    title: string;
    subtitle: string;
    emoji: string;
    index: number;
  }) => (
    <Animated.View
      entering={FadeInDown.delay(60 + index * 40).duration(400).springify()}
      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: index > 0 ? 20 : 0 }}
    >
      <Text style={{ fontSize: 22, marginRight: 8 }}>{emoji}</Text>
      <View>
        <Text style={{ fontSize: 17, fontWeight: '700', color: '#FFF' }}>{title}</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{subtitle}</Text>
      </View>
    </Animated.View>
  );

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView key={focusKey} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Animated.Text
            entering={FadeIn.duration(500)}
            style={{ fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 20 }}
          >
            Практика
          </Animated.Text>

          {/* Міндетті пәндер — негізгі */}
          <SectionHeader
            title="Міндетті пәндер"
            subtitle="Барлық мамандыққа ортақ"
            emoji="📋"
            index={0}
          />
          {CORE_SUBJECTS.map((s, i) => (
            <SubjectCard key={s} subject={s} index={i} accent="#6C63FF" />
          ))}

          {/* Таңдау пәндері */}
          <SectionHeader
            title="Таңдау пәндері"
            subtitle="Сенің таңдауың"
            emoji="📝"
            index={1}
          />
          {chosenSubjects.map((s, i) => (
            <SubjectCard key={s} subject={s} index={CORE_SUBJECTS.length + i} accent="#F59E0B" />
          ))}
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}
