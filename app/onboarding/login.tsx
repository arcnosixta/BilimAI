import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AppBackground } from '../../src/components/AppBackground';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useUser } from '../../src/hooks/useUser';
import { loginUser } from '../../src/lib/auth';

export default function Login() {
  const router = useRouter();
  const { reload } = useUser();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ЖАҢАРТЫЛҒАН ЛОГИН ФУНКЦИЯСЫ
  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Барлық өрістерді толтырыңыз');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // lib/auth.ts-тегі жаңа loginUser енді email мен password қабылдайды
      const result = await loginUser(email.trim(), password.trim());
      
      if (!result.ok) {
        setError(result.error ?? 'Кіру кезінде қате');
        setLoading(false);
        return;
      }

      // Пайдаланушы деректерін жаңарту және басты бетке өту
      await reload();
      router.replace('/(tabs)');
    } catch (e) {
      setError('Күтпеген қате орын алды');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (field: string) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 15 : 12,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: focusedField === field ? '#6C63FF' : 'rgba(255,255,255,0.1)',
  });

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo */}
            <Animated.View
              entering={FadeIn.duration(700)}
              style={{ alignItems: 'center', marginBottom: 36 }}
            >
              <View style={{ width: 88, height: 88, borderRadius: 24, overflow: 'hidden', marginBottom: 16 }}>
                <LinearGradient
                  colors={['rgba(108,99,255,0.25)', 'rgba(108,99,255,0.08)']}
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                >
                  <Text style={{ fontSize: 44 }}>🧠</Text>
                </LinearGradient>
              </View>
              <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#FFF' }}>
                Bilim<Text style={{ color: '#6C63FF' }}>AI</Text>
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 6 }}>
                ҰБТ-ға дайындалудың ең жақсы жолы
              </Text>
            </Animated.View>

            {/* Title */}
            <Animated.Text
              entering={FadeInDown.delay(150).duration(500)}
              style={{ fontSize: 26, fontWeight: 'bold', color: '#FFF', marginBottom: 24 }}
            >
              Қош келдіңіз! 👋
            </Animated.Text>

            {/* Glass card */}
            <Animated.View
              entering={FadeInDown.delay(250).duration(600).springify()}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 24,
                padding: 24,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
              }}
            >
              {/* Email */}
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6, marginLeft: 4 }}>
                Электрондық пошта
              </Text>
              <View style={inputStyle('email')}>
                <Text style={{ fontSize: 16, marginRight: 12, opacity: 0.5 }}>✉️</Text>
                <TextInput
                  value={email}
                  onChangeText={(text) => { setEmail(text); setError(''); }}
                  placeholder="example@mail.com"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  style={{ flex: 1, color: '#FFF', fontSize: 16 }}
                />
              </View>

              {/* Password */}
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6, marginLeft: 4 }}>
                Құпия сөз
              </Text>
              <View style={inputStyle('password')}>
                <Text style={{ fontSize: 16, marginRight: 12, opacity: 0.5 }}>🔒</Text>
                <TextInput
                  value={password}
                  onChangeText={(text) => { setPassword(text); setError(''); }}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  style={{ flex: 1, color: '#FFF', fontSize: 16 }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={{ fontSize: 16, opacity: 0.5 }}>{showPassword ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>

              {/* Forgot password */}
              <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 20 }}>
                <Text style={{ color: '#6C63FF', fontSize: 13 }}>Құпия сөзді ұмыттыңыз ба?</Text>
              </TouchableOpacity>

              {/* Login button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={!email.trim() || !password.trim() || loading}
              >
                <LinearGradient
                  colors={['#6C63FF', '#5046E5']}
                  style={{
                    borderRadius: 16,
                    paddingVertical: 16,
                    alignItems: 'center',
                    opacity: !email.trim() || !password.trim() || loading ? 0.5 : 1,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 17 }}>Кіру</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {error ? (
                <Text style={{ color: '#EF4444', textAlign: 'center', marginTop: 12, fontSize: 14 }}>
                  {error}
                </Text>
              ) : null}
            </Animated.View>

            {/* Footer Divider & Social (Опционально) */}
            <Animated.View entering={FadeIn.delay(500).duration(500)} style={{ alignItems: 'center', marginTop: 30 }}>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                  Аккаунт алу үшін әкімшіге жүгініңіз
                </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppBackground>
  );
}