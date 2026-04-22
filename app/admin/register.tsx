import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AppBackground } from '../../src/components/AppBackground';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { SPECIALTIES, SUBJECT_COMBOS, SUBJECT_EMOJI, SUBJECT_NAMES } from '../../src/data/specialties';
import { Grade, SpecialtyKey, SubjectKey, User } from '../../src/lib/types';
import { registerUser } from '../../src/lib/auth';
import { storage } from '../../src/lib/storage';
import { sendVerificationCode, verifyCode } from '../../src/lib/emailVerification';

const STEPS = ['info', 'subjects', 'target'] as const;
type Step = (typeof STEPS)[number];

export default function Register() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Step
  const [step, setStep] = useState<Step>('info');
  const stepIndex = STEPS.indexOf(step);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [specialty, setSpecialty] = useState<SpecialtyKey | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<SubjectKey[]>([]);
  const [targetScore, setTargetScore] = useState(100);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Email verification
  const [emailVerified, setEmailVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // 60 секунд қайта жіберу таймері
  const timerActive = resendTimer > 0;
  useEffect(() => {
    if (!timerActive) return;
    const id = setInterval(() => {
      setResendTimer((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [timerActive]);

  // Email өзгерсе — верификацияны қайта бастау
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    if (codeSent || emailVerified) {
      setCodeSent(false);
      setEmailVerified(false);
      setVerificationCode('');
      setCodeError('');
    }
  }, [codeSent, emailVerified]);

  async function handleSendCode() {
    if (!email.trim() || !email.includes('@')) {
      setCodeError('Email дұрыс форматта емес');
      return;
    }
    setSendingCode(true);
    setCodeError('');
    const result = await sendVerificationCode(email.trim());
    setSendingCode(false);
    if (result.ok) {
      setCodeSent(true);
      setResendTimer(60);
    } else {
      setCodeError(result.error ?? 'Код жіберу кезінде қате болды');
    }
  }

  async function handleVerifyCode() {
    if (verificationCode.length !== 6) {
      setCodeError('6 таңбалы код енгізіңіз');
      return;
    }
    setVerifyingCode(true);
    setCodeError('');
    const result = await verifyCode(email.trim(), verificationCode);
    setVerifyingCode(false);
    if (result.ok) {
      setEmailVerified(true);
      setCodeError('');
    } else {
      setCodeError(result.error ?? 'Код дұрыс емес');
    }
  }

  // Auto-set specialty from combo subjects
  function autoSetSpecialty(comboSubjects: [SubjectKey, SubjectKey]) {
    const match = SPECIALTIES.find(
      (sp) => sp.mandatory[0] === comboSubjects[0] && sp.mandatory[1] === comboSubjects[1]
    );
    setSpecialty(match?.key ?? 'it');
  }

  const emailProvided = email.trim().length > 0;
  const canNext =
    step === 'info'
      ? name.trim().length >= 2 && grade !== null && (!emailProvided || emailVerified)
      : step === 'subjects'
        ? selectedCombo !== null && selectedDirection !== null
        : true;

  function goNext() {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  }

  function goBack() {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
    else router.back();
  }

  async function handleRegister() {
    setSubmitError('');
    setSubmitting(true);
    const user: User = {
      name: name.trim(),
      email: email.trim() || undefined,
      grade: grade!,
      specialty: specialty!,
      electives: subjects.slice(0, 2),
      targetScore,
      currentScore: 0,
      ubtDate: '',
      points: 0,
      level: 'Іздеуші',
      avatarEmoji: '🧑‍🎓',
      createdAt: new Date().toISOString(),
    };
    const result = await registerUser(user);
    if (!result.ok) {
      setSubmitting(false);
      setSubmitError(result.error ?? 'Тіркелу кезінде қате болды');
      return;
    }
    // Админ режим — жаңа юзер жасалды, бірақ админді сол юзер ретінде кіргізбеу үшін
    // локалды сақталған user-ды тазалаймыз
    await storage.clearUser();
    setSubmitting(false);
    setSubmitSuccess(true);
  }

  const inputStyle = (field: string) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: focusedField === field ? '#6C63FF' : 'rgba(255,255,255,0.1)',
  });

  const SCORES = [60, 70, 80, 90, 100, 110, 120, 130, 140];

  if (submitSuccess) {
    return (
      <AppBackground>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }} edges={['top', 'bottom']}>
          <Text style={{ fontSize: 64, marginBottom: 20 }}>✅</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 10, textAlign: 'center' }}>
            Юзер сәтті тіркелді
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 32, textAlign: 'center' }}>
            {name} — {email || 'email жоқ'}
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/admin/register')}
            style={{ marginBottom: 12, width: '100%' }}
          >
            <LinearGradient
              colors={['#6C63FF', '#5046E5']}
              style={{ borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Тағы бір юзер тіркеу</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace('/onboarding/login')}
            style={{ paddingVertical: 14 }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Кіру бетіне қайту</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
            <TouchableOpacity onPress={goBack} style={{ marginRight: 16 }}>
              <Text style={{ color: '#FFF', fontSize: 20 }}>←</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF' }}>Жаңа юзер тіркеу</Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Админ панель</Text>
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
              {stepIndex + 1}/{STEPS.length}
            </Text>
          </View>

          {/* Progress bar */}
          <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {STEPS.map((s, i) => (
                <Animated.View
                  key={s}
                  entering={FadeIn.duration(400)}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: i <= stepIndex ? '#6C63FF' : 'rgba(255,255,255,0.1)',
                  }}
                />
              ))}
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Step 1: Basic Info */}
            {step === 'info' && (
              <Animated.View key="info" entering={SlideInRight.duration(400)}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 6 }}>
                  Жеке мәліметтер
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24, fontSize: 14 }}>
                  Атыңызды және сыныбыңызды көрсетіңіз
                </Text>

                {/* Name */}
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6, marginLeft: 4 }}>
                  Аты-жөніңіз *
                </Text>
                <View style={inputStyle('name')}>
                  <Text style={{ fontSize: 16, marginRight: 12, opacity: 0.5 }}>👤</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Айдар Абдрахимов"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    style={{ flex: 1, color: '#FFF', fontSize: 16 }}
                  />
                </View>

                {/* Email + Verification */}
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6, marginLeft: 4 }}>
                  Электрондық пошта
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: codeSent ? 8 : 14 }}>
                  <View style={{ ...inputStyle('email'), flex: 1, marginBottom: 0 }}>
                    <Text style={{ fontSize: 16, marginRight: 12, opacity: 0.5 }}>✉️</Text>
                    <TextInput
                      value={email}
                      onChangeText={handleEmailChange}
                      placeholder="example@mail.com"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!emailVerified}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      style={{ flex: 1, color: emailVerified ? 'rgba(255,255,255,0.5)' : '#FFF', fontSize: 16 }}
                    />
                    {emailVerified && <Text style={{ fontSize: 16 }}>✅</Text>}
                  </View>
                  {emailProvided && !emailVerified && (
                    <TouchableOpacity
                      onPress={handleSendCode}
                      disabled={sendingCode || resendTimer > 0}
                      style={{
                        backgroundColor: sendingCode || resendTimer > 0 ? 'rgba(108,99,255,0.08)' : 'rgba(108,99,255,0.15)',
                        borderRadius: 16,
                        paddingVertical: 15,
                        paddingHorizontal: 14,
                        borderWidth: 1.5,
                        borderColor: sendingCode || resendTimer > 0 ? 'rgba(108,99,255,0.15)' : '#6C63FF',
                        opacity: sendingCode || resendTimer > 0 ? 0.6 : 1,
                      }}
                    >
                      {sendingCode ? (
                        <ActivityIndicator size="small" color="#6C63FF" />
                      ) : (
                        <Text style={{ color: '#6C63FF', fontWeight: '700', fontSize: 13 }}>
                          {resendTimer > 0 ? `${resendTimer}с` : codeSent ? 'Қайта' : 'Код жіберу'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                {/* Верификация коды */}
                {codeSent && !emailVerified && (
                  <Animated.View entering={FadeInDown.duration(300)} style={{ marginBottom: 14 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8, marginLeft: 4 }}>
                      📩 {email} поштаңызға 6 таңбалы код жіберілді
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ ...inputStyle('code'), flex: 1, marginBottom: 0 }}>
                        <Text style={{ fontSize: 16, marginRight: 12, opacity: 0.5 }}>🔑</Text>
                        <TextInput
                          value={verificationCode}
                          onChangeText={(t) => {
                            setVerificationCode(t.replace(/[^0-9]/g, '').slice(0, 6));
                            setCodeError('');
                          }}
                          placeholder="000000"
                          placeholderTextColor="rgba(255,255,255,0.25)"
                          keyboardType="number-pad"
                          maxLength={6}
                          onFocus={() => setFocusedField('code')}
                          onBlur={() => setFocusedField(null)}
                          style={{ flex: 1, color: '#FFF', fontSize: 20, letterSpacing: 6, fontWeight: 'bold' }}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={handleVerifyCode}
                        disabled={verifyingCode || verificationCode.length !== 6}
                        style={{
                          backgroundColor: verificationCode.length === 6 ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                          borderRadius: 16,
                          paddingVertical: 15,
                          paddingHorizontal: 16,
                          borderWidth: 1.5,
                          borderColor: verificationCode.length === 6 ? '#22C55E' : 'rgba(255,255,255,0.1)',
                          opacity: verifyingCode || verificationCode.length !== 6 ? 0.5 : 1,
                        }}
                      >
                        {verifyingCode ? (
                          <ActivityIndicator size="small" color="#22C55E" />
                        ) : (
                          <Text style={{ color: '#22C55E', fontWeight: '700', fontSize: 13 }}>Растау</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                    {codeError ? (
                      <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 6, marginLeft: 4 }}>
                        {codeError}
                      </Text>
                    ) : null}
                  </Animated.View>
                )}

                {/* Email расталды */}
                {emailVerified && (
                  <Animated.View entering={FadeIn.duration(300)} style={{ marginBottom: 14 }}>
                    <View style={{ backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)' }}>
                      <Text style={{ color: '#22C55E', fontSize: 13, fontWeight: '600', textAlign: 'center' }}>
                        ✅ Email расталды
                      </Text>
                    </View>
                  </Animated.View>
                )}

                {/* Password */}
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6, marginLeft: 4 }}>
                  Құпия сөз
                </Text>
                <View style={inputStyle('password')}>
                  <Text style={{ fontSize: 16, marginRight: 12, opacity: 0.5 }}>🔒</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="6+ таңба"
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

                {/* Grade */}
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 10, marginLeft: 4 }}>
                  Сынып *
                </Text>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
                  {([9, 10, 11] as Grade[]).map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setGrade(g)}
                      style={{
                        flex: 1,
                        paddingVertical: 16,
                        borderRadius: 16,
                        alignItems: 'center',
                        backgroundColor: grade === g ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.06)',
                        borderWidth: 1.5,
                        borderColor: grade === g ? '#6C63FF' : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 22,
                          fontWeight: 'bold',
                          color: grade === g ? '#6C63FF' : 'rgba(255,255,255,0.6)',
                        }}
                      >
                        {g}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: grade === g ? 'rgba(108,99,255,0.8)' : 'rgba(255,255,255,0.3)',
                          marginTop: 2,
                        }}
                      >
                        сынып
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Step 2: Subject combo + Specialty */}
            {step === 'subjects' && (
              <Animated.View key="subjects" entering={SlideInRight.duration(400)}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 6 }}>
                  Пән комбинациясы
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 20, fontSize: 14 }}>
                  ҰБТ-да тапсыратын 2 таңдау пәніңізді таңдаңыз
                </Text>

                <View style={{ gap: 10 }}>
                  {SUBJECT_COMBOS.map((combo) => {
                    const sel = selectedCombo === combo.id;
                    const previewDirs = combo.directions.slice(0, 2);
                    return (
                      <TouchableOpacity
                        key={combo.id}
                        onPress={() => {
                          setSelectedCombo(combo.id);
                          setSubjects([...combo.subjects]);
                          setSelectedDirection(null);
                          autoSetSpecialty(combo.subjects);
                        }}
                        activeOpacity={0.7}
                        style={{
                          backgroundColor: sel ? 'rgba(108,99,255,0.12)' : 'rgba(255,255,255,0.05)',
                          borderRadius: 16,
                          padding: 16,
                          borderWidth: 1.5,
                          borderColor: sel ? '#6C63FF' : 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
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
                              {combo.id}
                            </Text>
                          </View>
                          <Text style={{ color: sel ? '#FFF' : 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 15, flex: 1 }}>
                            {combo.name}
                          </Text>
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              borderWidth: 2,
                              borderColor: sel ? '#6C63FF' : 'rgba(255,255,255,0.2)',
                              backgroundColor: sel ? '#6C63FF' : 'transparent',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            {sel && <Text style={{ color: '#FFF', fontSize: 12 }}>✓</Text>}
                          </View>
                        </View>

                        {/* Subjects */}
                        <View style={{ flexDirection: 'row', marginBottom: 8, gap: 8 }}>
                          {combo.subjects.map((s) => (
                            <View
                              key={s}
                              style={{
                                backgroundColor: sel ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.06)',
                                borderRadius: 10,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                              }}
                            >
                              <Text style={{ color: sel ? '#A5A0FF' : 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                                {SUBJECT_EMOJI[s]} {SUBJECT_NAMES[s]}
                              </Text>
                            </View>
                          ))}
                        </View>

                        {/* Preview directions */}
                        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                          {previewDirs.map((d) => d.split(' — ')[1] || d).join(', ')}
                          {combo.directions.length > 2 && ` +${combo.directions.length - 2}`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Direction selection after combo chosen */}
                {selectedCombo && (() => {
                  const combo = SUBJECT_COMBOS.find((c) => c.id === selectedCombo)!;
                  return (
                    <View style={{ marginTop: 20 }}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 6 }}>
                        Мамандық таңдаңыз
                      </Text>
                      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 14 }}>
                        {combo.name} — {combo.directions.length} мамандық
                      </Text>
                      <View style={{ gap: 6 }}>
                        {combo.directions.map((dir) => {
                          const sel = selectedDirection === dir;
                          const code = dir.split(' — ')[0];
                          const name = dir.split(' — ')[1] || dir;
                          return (
                            <TouchableOpacity
                              key={dir}
                              onPress={() => setSelectedDirection(dir)}
                              activeOpacity={0.7}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: sel ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)',
                                borderRadius: 12,
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                borderWidth: 1.5,
                                borderColor: sel ? '#F59E0B' : 'rgba(255,255,255,0.06)',
                              }}
                            >
                              <View
                                style={{
                                  backgroundColor: sel ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)',
                                  borderRadius: 8,
                                  paddingHorizontal: 8,
                                  paddingVertical: 4,
                                  marginRight: 12,
                                }}
                              >
                                <Text style={{ color: sel ? '#F59E0B' : 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700' }}>
                                  {code}
                                </Text>
                              </View>
                              <Text
                                style={{ color: sel ? '#FFF' : 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500', flex: 1 }}
                                numberOfLines={2}
                              >
                                {name}
                              </Text>
                              <View
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: 10,
                                  borderWidth: 2,
                                  borderColor: sel ? '#F59E0B' : 'rgba(255,255,255,0.15)',
                                  backgroundColor: sel ? '#F59E0B' : 'transparent',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                {sel && <Text style={{ color: '#FFF', fontSize: 10 }}>✓</Text>}
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })()}
              </Animated.View>
            )}

            {/* Step 4: Target score */}
            {step === 'target' && (
              <Animated.View key="target" entering={SlideInRight.duration(400)}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 6 }}>
                  Мақсат балл
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 28, fontSize: 14 }}>
                  ҰБТ-дан қанша балл жинағыңыз келеді?
                </Text>

                {/* Score display */}
                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                  <View
                    style={{
                      width: 140,
                      height: 140,
                      borderRadius: 70,
                      borderWidth: 4,
                      borderColor: '#6C63FF',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(108,99,255,0.1)',
                    }}
                  >
                    <Text style={{ fontSize: 44, fontWeight: 'bold', color: '#FFF' }}>
                      {targetScore}
                    </Text>
                    <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>/ 140</Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View
                  style={{
                    height: 8,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 4,
                    marginBottom: 24,
                    overflow: 'hidden',
                  }}
                >
                  <LinearGradient
                    colors={['#6C63FF', '#5046E5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      height: '100%',
                      borderRadius: 4,
                      width: `${((targetScore - 60) / 80) * 100}%`,
                    }}
                  />
                </View>

                {/* Score buttons */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
                  {SCORES.map((s) => {
                    const sel = targetScore === s;
                    return (
                      <TouchableOpacity
                        key={s}
                        onPress={() => setTargetScore(s)}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 18,
                          borderRadius: 14,
                          backgroundColor: sel ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.06)',
                          borderWidth: 1.5,
                          borderColor: sel ? '#6C63FF' : 'rgba(255,255,255,0.08)',
                          minWidth: 60,
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            color: sel ? '#6C63FF' : 'rgba(255,255,255,0.6)',
                            fontWeight: '700',
                            fontSize: 16,
                          }}
                        >
                          {s}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Grant info */}
                {specialty && (
                  <View
                    style={{
                      backgroundColor: 'rgba(108,99,255,0.08)',
                      borderRadius: 14,
                      padding: 16,
                      marginTop: 24,
                      borderWidth: 1,
                      borderColor: 'rgba(108,99,255,0.15)',
                    }}
                  >
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                      {SPECIALTIES.find((s) => s.key === specialty)?.emoji}{' '}
                      {SPECIALTIES.find((s) => s.key === specialty)?.name} мамандығы бойынша ең төменгі грант баллы:{' '}
                      <Text style={{ color: '#6C63FF', fontWeight: 'bold' }}>
                        {SPECIALTIES.find((s) => s.key === specialty)?.minScore}
                      </Text>
                    </Text>
                  </View>
                )}
              </Animated.View>
            )}
          </ScrollView>

          {/* Bottom button */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
            {submitError ? (
              <Text style={{ color: '#EF4444', textAlign: 'center', marginBottom: 10, fontSize: 14 }}>
                {submitError}
              </Text>
            ) : null}
            <TouchableOpacity
              onPress={step === 'target' ? handleRegister : goNext}
              disabled={!canNext || submitting}
              style={{ opacity: !canNext || submitting ? 0.4 : 1 }}
            >
              <LinearGradient
                colors={step === 'target' ? ['#22C55E', '#16A34A'] : ['#6C63FF', '#5046E5']}
                style={{
                  borderRadius: 16,
                  paddingVertical: 17,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 17 }}>
                  {submitting ? 'Күте тұрыңыз...' : step === 'target' ? 'Бастау 🚀' : 'Келесі'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppBackground>
  );
}
