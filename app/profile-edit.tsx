import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AppBackground } from '../src/components/AppBackground';
import { SPECIALTIES, SUBJECT_COMBOS, SUBJECT_EMOJI, SUBJECT_NAMES } from '../src/data/specialties';
import { Grade, SpecialtyKey, SubjectKey } from '../src/lib/types';
import { useUser } from '../src/hooks/useUser';

const SCORES = [60, 70, 80, 90, 100, 110, 120, 130, 140];

export default function ProfileEdit() {
  const router = useRouter();
  const { user, save } = useUser();

  const initialCombo = user
    ? SUBJECT_COMBOS.find(
        (c) => c.subjects[0] === user.electives[0] && c.subjects[1] === user.electives[1]
      )?.id ?? null
    : null;

  const [name, setName] = useState(user?.name ?? '');
  const [grade, setGrade] = useState<Grade>((user?.grade ?? 11) as Grade);
  const [comboId, setComboId] = useState<string | null>(initialCombo);
  const [targetScore, setTargetScore] = useState(user?.targetScore ?? 100);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const combo = comboId ? SUBJECT_COMBOS.find((c) => c.id === comboId) : null;

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    let specialty: SpecialtyKey = user.specialty;
    let electives: SubjectKey[] = user.electives;
    if (combo) {
      electives = [...combo.subjects];
      const match = SPECIALTIES.find(
        (sp) => sp.mandatory[0] === combo.subjects[0] && sp.mandatory[1] === combo.subjects[1]
      );
      specialty = match?.key ?? user.specialty;
    }
    await save({
      ...user,
      name: name.trim() || user.name,
      grade,
      specialty,
      electives,
      targetScore,
    });
    setSaving(false);
    router.back();
  }

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 8,
            }}
          >
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
              <Text style={{ color: '#FFF', fontSize: 20 }}>←</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF' }}>Профильді өңдеу</Text>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Name */}
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6, marginLeft: 4 }}>
              Аты-жөні
            </Text>
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 15,
                marginBottom: 18,
                borderWidth: 1.5,
                borderColor: 'rgba(255,255,255,0.1)',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, marginRight: 12, opacity: 0.5 }}>👤</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Аты-жөніңіз"
                placeholderTextColor="rgba(255,255,255,0.25)"
                style={{ flex: 1, color: '#FFF', fontSize: 16 }}
              />
            </View>

            {/* Grade */}
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 10, marginLeft: 4 }}>
              Сынып
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 18 }}>
              {([9, 10, 11] as Grade[]).map((g) => {
                const sel = grade === g;
                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGrade(g)}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 14,
                      alignItems: 'center',
                      backgroundColor: sel ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.06)',
                      borderWidth: 1.5,
                      borderColor: sel ? '#6C63FF' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: sel ? '#6C63FF' : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {g}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: sel ? 'rgba(108,99,255,0.8)' : 'rgba(255,255,255,0.3)',
                        marginTop: 2,
                      }}
                    >
                      сынып
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Subject combo */}
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 10, marginLeft: 4 }}>
              Таңдау пәндері
            </Text>
            <View style={{ gap: 10, marginBottom: 18 }}>
              {SUBJECT_COMBOS.map((c) => {
                const sel = comboId === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setComboId(c.id)}
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: sel ? 'rgba(108,99,255,0.12)' : 'rgba(255,255,255,0.05)',
                      borderRadius: 14,
                      padding: 14,
                      borderWidth: 1.5,
                      borderColor: sel ? '#6C63FF' : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <View
                        style={{
                          backgroundColor: sel ? 'rgba(108,99,255,0.25)' : 'rgba(255,255,255,0.08)',
                          borderRadius: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          marginRight: 10,
                        }}
                      >
                        <Text style={{ color: sel ? '#6C63FF' : 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600' }}>
                          {c.id}
                        </Text>
                      </View>
                      <Text
                        style={{ color: sel ? '#FFF' : 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 14, flex: 1 }}
                      >
                        {c.name}
                      </Text>
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
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {c.subjects.map((s) => (
                        <View
                          key={s}
                          style={{
                            backgroundColor: sel ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.06)',
                            borderRadius: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                          }}
                        >
                          <Text style={{ color: sel ? '#A5A0FF' : 'rgba(255,255,255,0.5)', fontSize: 11 }}>
                            {SUBJECT_EMOJI[s]} {SUBJECT_NAMES[s]}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Target score */}
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 10, marginLeft: 4 }}>
              Мақсат балл
            </Text>
            <View style={{ alignItems: 'center', marginBottom: 14 }}>
              <View
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 55,
                  borderWidth: 4,
                  borderColor: '#6C63FF',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(108,99,255,0.1)',
                }}
              >
                <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#FFF' }}>{targetScore}</Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>/ 140</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              {SCORES.map((s) => {
                const sel = targetScore === s;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setTargetScore(s)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      backgroundColor: sel ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.06)',
                      borderWidth: 1.5,
                      borderColor: sel ? '#6C63FF' : 'rgba(255,255,255,0.08)',
                      minWidth: 56,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: sel ? '#6C63FF' : 'rgba(255,255,255,0.6)',
                        fontWeight: '700',
                        fontSize: 15,
                      }}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Save button */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving || name.trim().length < 2}
              style={{ opacity: saving || name.trim().length < 2 ? 0.4 : 1 }}
            >
              <LinearGradient
                colors={['#22C55E', '#16A34A']}
                style={{ borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 17 }}>
                  {saving ? 'Сақталуда...' : 'Сақтау'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppBackground>
  );
}
