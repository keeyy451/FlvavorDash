/**
 * constants/Theme.js
 * Clean Light Mode design tokens for FlavorDash
 */

export const COLORS = {
  // Primary Palette (Vibrant Orange/Red for Food Appetite)
  primary: '#FF5A5F',
  primaryDark: '#E31C5F',
  primaryLight: '#FF8A8E',
  
  // Backgrounds (Clean White/Off-White)
  background: '#F8FAFC',  // Slate 50
  surface: '#FFFFFF',     // White
  surfaceLight: '#F1F5F9',// Slate 100
  
  // Text Colors
  text: '#0F172A',        // Slate 900
  textSecondary: '#475569',// Slate 600
  textMuted: '#94A3B8',   // Slate 400
  
  // Accents
  accent: '#F59E0B',      // Warm Gold for ratings
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Overlays & Borders
  overlay: 'rgba(0, 0, 0, 0.4)',
  glass: 'rgba(255, 255, 255, 0.8)',
  glassBorder: '#E2E8F0', // Slate 200
  cardGradient: ['#FFFFFF', '#F8FAFC'],
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
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  large: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
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

