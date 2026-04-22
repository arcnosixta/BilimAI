import { ScrollView, View, Text, TouchableOpacity, Switch, Alert, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import { AppBackground } from '../../src/components/AppBackground';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Card, PrimaryButton, SectionTitle } from '../../src/components/ui';
import { useUser } from '../../src/hooks/useUser';
import { SPECIALTIES, SUBJECT_EMOJI, SUBJECT_NAMES } from '../../src/data/specialties';
import { getLevelByPoints } from '../../src/lib/ubt';

const AVATARS = ['🧑‍🎓', '👨‍💻', '👩‍🔬', '👨‍⚕️', '👩‍🏫', '🧑‍💼', '🦸', '🧙', '🧑‍🚀', '👸', '🤴', '🧛'];

export default function Profile() {
  const { user, save, logout, loading } = useUser();   // loading-ті қостым
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState(false);
  const [notif, setNotif] = useState(true);
  const [sound, setSound] = useState(true);
  const [focusKey, setFocusKey] = useState(0);

  // user өзгерген кезде editName-ді жаңарту
  useEffect(() => {
    if (user?.name) {
      setEditName(user.name);
    }
  }, [user?.name]);

  useFocusEffect(
    useCallback(() => {
      setFocusKey((k) => k + 1);
    }, [])
  );

  // Егер user жүктеліп жатса немесе жоқ болса
  if (loading) {
    return (
      <AppBackground>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#FFF', fontSize: 18 }}>Профиль жүктелуде...</Text>
        </SafeAreaView>
      </AppBackground>
    );
  }

  if (!user) {
    return (
      <AppBackground>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#EF4444', fontSize: 18 }}>Пайдаланушы табылмады</Text>
        </SafeAreaView>
      </AppBackground>
    );
  }

  // Қауіпсіздік үшін default мәндер қойдық
  const specialty = SPECIALTIES.find((s) => s.key === user.specialty) || SPECIALTIES[0];
  const level = getLevelByPoints(user.points || 0);

  async function saveName() {
    if (!editName.trim()) return;
    await save({ ...user, name: editName.trim() });
    setEdit(false);
  }

  async function selectAvatar(emoji: string) {
    await save({ ...user, avatarEmoji: emoji });
    setEditAvatar(false);
  }

  async function handleLogout() {
    if (Platform.OS === 'web') {
      if (window.confirm('Барлық мәлімет өшіріледі. Жалғастырасың ба?')) {
        await logout();
        router.replace('/onboarding');
      }
    } else {
      Alert.alert('Шығу', 'Барлық мәлімет өшіріледі. Жалғастырасың ба?', [
        { text: 'Жоқ', style: 'cancel' },
        {
          text: 'Иә',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/onboarding');
          },
        },
      ]);
    }
  }

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView key={focusKey} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Animated.Text
            entering={FadeIn.duration(500)}
            style={{ fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 20 }}
          >
            Профиль
          </Animated.Text>

          {/* Avatar & Info */}
          <Animated.View entering={FadeInDown.delay(80).duration(500).springify()}>
            <Card className="mb-4" style={{ alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setEditAvatar(!editAvatar)}>
                <View
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 45,
                    backgroundColor: 'rgba(108,99,255,0.2)',
                    borderWidth: 2,
                    borderColor: '#6C63FF',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 40 }}>{user.avatarEmoji || '🧑‍🎓'}</Text>
                </View>
              </TouchableOpacity>

              {editAvatar && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12 }}>
                  {AVATARS.map((a) => (
                    <TouchableOpacity key={a} onPress={() => selectAvatar(a)} style={{ padding: 6 }}>
                      <Text style={{ fontSize: 28 }}>{a}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {edit ? (
                <View style={{ width: '100%' }}>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    style={{
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.2)',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      marginBottom: 8,
                      textAlign: 'center',
                      color: '#FFF',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                    }}
                  />
                  <PrimaryButton title="Сақтау" onPress={saveName} />
                </View>
              ) : (
                <>
                  <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFF' }}>{user.name || 'Аты жоқ'}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                    {user.grade || '?'} - сынып · {specialty.emoji} {specialty.name}
                  </Text>
                  <View
                    style={{
                      backgroundColor: 'rgba(245,158,11,0.15)',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      marginTop: 8,
                    }}
                  >
                    <Text style={{ color: '#F59E0B', fontWeight: '600', fontSize: 12 }}>
                      🏅 {level}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => { setEdit(true); setEditName(user.name || ''); }} style={{ marginTop: 10 }}>
                    <Text style={{ color: '#6C63FF', fontWeight: '600' }}>Өзгерту</Text>
                  </TouchableOpacity>
                </>
              )}
            </Card>
          </Animated.View>

          {/* Stats row */}
          <Animated.View
            entering={FadeInDown.delay(160).duration(500).springify()}
            style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}
          >
            <Card style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Ұпай</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#6C63FF', marginTop: 4 }}>{user.points || 0}</Text>
            </Card>
            <Card style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Мақсат балл</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#F59E0B', marginTop: 4 }}>{user.targetScore || 0}</Text>
            </Card>
          </Animated.View>

          {/* Subjects */}
          <Animated.View entering={FadeInDown.delay(240).duration(500).springify()}>
            <SectionTitle>Таңдау пәндері</SectionTitle>
            <Card className="mb-4">
              {[...new Set([...(specialty.mandatory || []), ...(user.electives || [])])].map((e) => (
                <View key={e} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>{SUBJECT_EMOJI[e] || '📚'}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.9)' }}>{SUBJECT_NAMES[e] || e}</Text>
                </View>
              ))}
            </Card>
          </Animated.View>

          {/* Баптаулар және басқа бөлімдер сол қалпында қалдырдың */}
          {/* ... (қалған код өзгермеді) */}

          <Animated.View entering={FadeInDown.delay(320).duration(500).springify()}>
            <SectionTitle>Баптаулар</SectionTitle>
            <Card className="mb-2">
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Хабарландырулар</Text>
                <Switch value={notif} onValueChange={setNotif} trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#6C63FF' }} />
              </View>
            </Card>
            <Card className="mb-4">
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Дыбыс</Text>
                <Switch value={sound} onValueChange={setSound} trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#6C63FF' }} />
              </View>
            </Card>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(500).springify()}
            style={{ gap: 8 }}
          >
            <TouchableOpacity onPress={() => router.push('/profile-edit')}>
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, marginRight: 12 }}>✏️</Text>
                  <Text style={{ flex: 1, color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Профильді өңдеу</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.4)' }}>›</Text>
                </View>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout}>
              <Card>
                <Text style={{ color: '#EF4444', textAlign: 'center', fontWeight: '600' }}>Шығу</Text>
              </Card>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}