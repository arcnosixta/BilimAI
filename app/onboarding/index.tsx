import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AppBackground } from '../../src/components/AppBackground';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

function FloatingEmoji({ emoji }: { emoji: string }) {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
    rotate.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(-5, { duration: 2200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.Text style={[{ fontSize: 120 }, style]}>{emoji}</Animated.Text>
  );
}

const slides = [
  {
    emoji: '\u{1F9E0}',
    title: 'Болашағыңды\nBilimAI-мен бірге құр',
    desc: 'Жасанды интеллект арқылы ҰБТ-ға дайындықтың жаңа деңгейіне шығыңыз. Жекелендірілген оқу жоспары және сараптамалық қолдау.',
    button: 'Бастау',
  },
  {
    emoji: '\u{1F4D6}',
    title: 'AI Куратор - сенің\nжеке тәлімгерің',
    desc: 'Сұрақтарыңа кез келген уақытта жауап ал және қиын тақырыптарды оңай меңгер',
    button: 'Келесі',
  },
  {
    emoji: '\u{1F680}',
    title: 'Арман жоғары оқу\nорнына бір қадам\nжақын',
    desc: 'Статистиканы бақыла, қателермен жұмыс жаса және грант иегері атан',
    button: 'Кіру',
    gradient: true,
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (width === 0) return;
      const index = Math.round(e.nativeEvent.contentOffset.x / width);
      setActiveIndex(index);
    },
    [width]
  );

  function handlePress() {
    if (activeIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
    } else {
      router.push('/onboarding/login');
    }
  }

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        >
          {slides.map((item, i) => {
            const isActive = i === activeIndex;
            return (
              <View
                key={i}
                style={{ width, flex: 1, justifyContent: 'center', paddingHorizontal: 30 }}
              >
                <Animated.View
                  entering={FadeIn.duration(600)}
                  style={{ alignItems: 'center', marginBottom: 40 }}
                >
                  {isActive ? (
                    <FloatingEmoji emoji={item.emoji} />
                  ) : (
                    <Text style={{ fontSize: 120 }}>{item.emoji}</Text>
                  )}
                </Animated.View>
                <Animated.Text
                  entering={FadeInDown.delay(200).duration(500)}
                  style={{
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    marginBottom: 16,
                    lineHeight: 38,
                  }}
                >
                  {item.title}
                </Animated.Text>
                <Animated.Text
                  entering={FadeInDown.delay(350).duration(500)}
                  style={{
                    fontSize: 15,
                    color: 'rgba(255,255,255,0.7)',
                    textAlign: 'center',
                    lineHeight: 22,
                    paddingHorizontal: 10,
                  }}
                >
                  {item.desc}
                </Animated.Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Button */}
        <View style={{ paddingHorizontal: 30, paddingBottom: 20 }}>
          {slides[activeIndex]?.gradient ? (
            <TouchableOpacity onPress={handlePress}>
              <LinearGradient
                colors={['#FF8C00', '#FF6B35', '#9B59B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>
                  {slides[activeIndex].button}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handlePress}
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(108,99,255,0.5)',
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={['#3B3099', '#4A3CB5']}
                style={{ paddingVertical: 16, alignItems: 'center', borderRadius: 15 }}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>
                  {slides[activeIndex]?.button}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', paddingBottom: 20 }}>
          {slides.map((_, i) => {
            const active = i === activeIndex;
            return (
              <View
                key={i}
                style={{
                  width: active ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: active ? '#6C63FF' : 'rgba(255,255,255,0.25)',
                  marginHorizontal: 4,
                }}
              />
            );
          })}
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}
