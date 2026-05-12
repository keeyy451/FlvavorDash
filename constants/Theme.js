/**
 * constants/Theme.js
 * Premium design tokens for FlavorDash
 */

export const COLORS = {
  // Primary Palette (Vibrant Red-Orange)
  primary: '#FF385C',
  primaryDark: '#E31C5F',
  primaryLight: '#FF5A5F',
  
  // Backgrounds (Deep Navy/Indigo)
  background: '#0B0D17',
  surface: '#161B2E',
  surfaceLight: '#1F2642',
  
  // Text Colors
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  
  // Accents
  accent: '#FFD700', // Gold for ratings
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Overlays & Glass
  overlay: 'rgba(0, 0, 0, 0.6)',
  glass: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  cardGradient: ['#161B2E', '#0B0D17'],
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 30,
  full: 999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  large: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
};

export const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  h3: { fontSize: 20, fontWeight: '700' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '500' },
};

