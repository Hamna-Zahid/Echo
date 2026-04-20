/**
 * Legacy color constants — kept for backward compatibility with old components.
 * New code should import from `constants/tokens` instead.
 */
export { T, Fonts, Radius, Spacing, Shadow } from './tokens';

// Legacy aliases used by old component files (not active in new UI)
export const C = {
  bg:       '#FFFFFF',
  surface:  '#FFFFFF',
  surface2: '#FDF8F8',
  overlay:  '#00000066',
  border:   '#F3E8EE',
  borderMid: '#E9D4DD',
  borderActive: '#E11D74',
  blue900: '#1E3A8A',
  blue700: '#1D4ED8',
  blue600: '#E11D74',
  blue400: '#F43F8E',
  blue300: '#FB7BAF',
  blue200: '#FBCFE8',
  text:     '#111827',
  textSub:  '#374151',
  textDim:  '#9CA3AF',
  cyan:     '#10B981',
  success:  '#10B981',
  error:    '#EF4444',
  warning:  '#F59E0B',
  gold:     '#D97706',
  waveAI:   '#E11D74',
  waveUser: '#111827',
  waveIdle: '#F3E8EE',
} as const;

export const FONT = {
  xs:    11,
  sm:    13,
  md:    15,
  lg:    17,
  xl:    20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 38,
} as const;

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 9999,
} as const;
