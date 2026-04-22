import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AppBackground } from '../src/components/AppBackground';
import { Card } from '../src/components/ui';
import { LEADERBOARD } from '../src/data/leaderboard';
import { SPECIALTIES } from '../src/data/specialties';
import { useUser } from '../src/hooks/useUser';

export default function Leaderboard() {
  const { user } = useUser();
  const list = [...LEADERBOARD].sort((a, b) => b.points - a.points);

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
            Аптаның үздік 10 оқушысы
          </Text>

          {/* Top 3 podium */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginBottom: 24, gap: 12 }}>
            {[1, 0, 2].map((rank) => {
              const r = list[rank];
              if (!r) return null;
              const sp = SPECIALTIES.find((s) => s.key === r.specialty)!;
              const isCenter = rank === 0;
              const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : '🥉';
              return (
                <View key={r.name} style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: isCenter ? 32 : 24, marginBottom: 6 }}>{medal}</Text>
                  <View
                    style={{
                      width: isCenter ? 60 : 48,
                      height: isCenter ? 60 : 48,
                      borderRadius: isCenter ? 30 : 24,
                      backgroundColor: 'rgba(108,99,255,0.2)',
                      borderWidth: 2,
                      borderColor: rank === 0 ? '#F59E0B' : rank === 1 ? '#C0C0C0' : '#CD7F32',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ fontSize: isCenter ? 24 : 18 }}>{sp.emoji}</Text>
                  </View>
                  <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13, textAlign: 'center' }}>{r.name}</Text>
                  <Text style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: 15, marginTop: 2 }}>{r.points}</Text>
                </View>
              );
            })}
          </View>

          {/* Rest */}
          {list.slice(3).map((row, i) => {
            const sp = SPECIALTIES.find((s) => s.key === row.specialty)!;
            return (
              <Card key={row.name} className="mb-2">
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 'bold', fontSize: 13 }}>{i + 4}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontWeight: '600', color: '#FFF' }}>{row.name}</Text>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                      {row.grade}-сынып · {sp.emoji} {sp.name}
                    </Text>
                  </View>
                  <Text style={{ color: '#6C63FF', fontWeight: 'bold' }}>{row.points}</Text>
                </View>
              </Card>
            );
          })}

          {/* Current user */}
          {user && (
            <LinearGradient
              colors={['#6C63FF', '#5046E5']}
              style={{ borderRadius: 16, padding: 16, marginTop: 16 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>{user.avatarEmoji || '🧑‍🎓'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: '#FFF' }}>{user.name} (сен)</Text>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{user.grade}-сынып</Text>
                </View>
                <Text style={{ fontWeight: 'bold', color: '#FFF', fontSize: 18 }}>{user.points}</Text>
              </View>
            </LinearGradient>
          )}
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}
