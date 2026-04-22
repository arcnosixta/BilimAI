import { Text, TouchableOpacity, View, ViewProps, StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export function Card({ children, className, style, ...p }: ViewProps & { className?: string }) {
  return (
    <View
      className={className}
      style={StyleSheet.flatten([
        { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
        style,
      ])}
      {...p}
    >
      {children}
    </View>
  );
}

export function GlassCard({ children, className, style, ...p }: ViewProps & { className?: string }) {
  return (
    <View
      className={className}
      style={StyleSheet.flatten([
        { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
        style,
      ])}
      {...p}
    >
      {children}
    </View>
  );
}

export function GradientButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} style={{ opacity: disabled ? 0.5 : 1 }}>
      <LinearGradient
        colors={['#FF8C00', '#FF6B35', '#9B59B6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
      >
        <Text className="text-white font-bold text-lg">{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={{
        opacity: disabled ? 0.5 : 1,
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
        <Text className="text-white font-bold text-base">{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="rounded-full px-4 py-2 mr-2 mb-2"
      style={{
        backgroundColor: selected ? '#6C63FF' : 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: selected ? '#6C63FF' : 'rgba(255,255,255,0.15)',
      }}
    >
      <Text className={selected ? 'text-white font-medium' : 'text-white/70'}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 12 }}>
      {children}
    </Text>
  );
}
