import { ReactNode } from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface Props extends PressableProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
}

const AnimatedPress = Animated.createAnimatedComponent(Pressable);

export function AnimatedPressable({ children, style, scaleTo = 0.96, ...rest }: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPress
      {...rest}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, { damping: 15, stiffness: 400 });
        opacity.value = withTiming(0.85, { duration: 100 });
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        opacity.value = withTiming(1, { duration: 150 });
        rest.onPressOut?.(e);
      }}
      style={[style, animatedStyle] as any}
    >
      {children}
    </AnimatedPress>
  );
}
