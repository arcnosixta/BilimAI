// Design system constants matching BilimAI dark theme
export const colors = {
  // Backgrounds
  bgDark: '#0A0920',
  bgMid: '#0D0B2E',
  bgLight: '#1A0B3E',
  bgCard: 'rgba(255,255,255,0.08)',
  bgCardBorder: 'rgba(255,255,255,0.12)',
  bgInput: 'rgba(255,255,255,0.06)',
  bgInputBorder: 'rgba(255,255,255,0.1)',

  // Gradients
  gradientBg: ['#1A0B3E', '#0D0B2E', '#0A0920'] as const,
  gradientPrimary: ['#6C63FF', '#5046E5'] as const,
  gradientAccent: ['#3B82F6', '#6C63FF'] as const,
  gradientOrange: ['#FF8C00', '#FF6B35', '#9B59B6'] as const,
  gradientButton: ['#3B3099', '#4A3CB5'] as const,

  // Brand
  primary: '#6C63FF',
  primaryDark: '#5046E5',
  accent: '#3B82F6',
  orange: '#FF8C00',
  orangeLight: '#FF6B35',
  purple: '#7C3AED',
  gold: '#F59E0B',

  // Status
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
  textMuted: 'rgba(255,255,255,0.4)',
  textDisabled: 'rgba(255,255,255,0.3)',

  // Tab bar
  tabBg: '#0F0E2A',
  tabActive: '#6C63FF',
  tabInactive: 'rgba(255,255,255,0.4)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
} as const;
