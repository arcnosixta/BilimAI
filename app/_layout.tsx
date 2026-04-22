import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { UserProvider, useUser } from '../src/hooks/useUser';
import { useStudyTimer } from '../src/hooks/useStudyTimer';

function Router() {
  const { user, loading } = useUser();
  useStudyTimer();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const first = segments[0];
    const inOnboarding = first === 'onboarding';
    const inAdmin = first === 'admin';
    if (!user && !inOnboarding && !inAdmin) {
      router.replace('/onboarding');
    } else if (user && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D0B2E' }}>
        <ActivityIndicator color="#6C63FF" size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D0B2E' } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="admin" />
      <Stack.Screen
        name="practice/[subject]"
        options={{ headerShown: true, title: '', headerStyle: { backgroundColor: '#0D0B2E' }, headerTintColor: '#FFF' }}
      />
      <Stack.Screen
        name="practice/quiz"
        options={{ headerShown: true, title: 'Тест', headerStyle: { backgroundColor: '#0D0B2E' }, headerTintColor: '#FFF' }}
      />
      <Stack.Screen
        name="curator"
        options={{ headerShown: true, title: 'AI Куратор', headerStyle: { backgroundColor: '#0D0B2E' }, headerTintColor: '#FFF' }}
      />
      <Stack.Screen
        name="leaderboard"
        options={{ headerShown: true, title: 'Рейтинг', headerStyle: { backgroundColor: '#0D0B2E' }, headerTintColor: '#FFF' }}
      />
      <Stack.Screen
        name="proforientation"
        options={{ headerShown: true, title: 'Кәсіби бағдар', headerStyle: { backgroundColor: '#0D0B2E' }, headerTintColor: '#FFF' }}
      />
      <Stack.Screen
        name="planner"
        options={{ headerShown: true, title: 'Жоспар', headerStyle: { backgroundColor: '#0D0B2E' }, headerTintColor: '#FFF' }}
      />
      <Stack.Screen
        name="ubt-exam"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="profile-edit"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Router />
      </SafeAreaProvider>
    </UserProvider>
  );
}
