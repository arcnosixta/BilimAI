/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        primaryDark: '#5046E5',
        accent: '#3B82F6',
        bg: '#0D0B2E',
        bgLight: '#1A1745',
        card: 'rgba(255,255,255,0.08)',
        cardBorder: 'rgba(255,255,255,0.15)',
        muted: '#8A8FA3',
        success: '#22C55E',
        danger: '#EF4444',
        textPrimary: '#FFFFFF',
        textSecondary: 'rgba(255,255,255,0.7)',
      },
    },
  },
  plugins: [],
};
