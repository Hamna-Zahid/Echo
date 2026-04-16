/**
 * EchoCoach Design System — Cold Blue
 * Minimalist, professional, high-contrast dark UI.
 */
export const C = {
  // Backgrounds
  bg:       '#05090F',  // Near-black navy — main background
  surface:  '#0C1322',  // Card / panel surface
  surface2: '#111B2E',  // Elevated surface (modals, dropdowns)
  overlay:  '#0A1120CC', // Semi-transparent overlay

  // Borders
  border:       '#1A2840',  // Default border
  borderMid:    '#1E3256',  // Focused / hover border
  borderActive: '#2563EB',  // Active / selected border

  // Blue scale
  blue900: '#1E3A8A',
  blue700: '#1D4ED8',
  blue600: '#2563EB',  // Primary action
  blue400: '#60A5FA',  // Labels, icons, highlights
  blue300: '#93C5FD',  // Light accent
  blue200: '#BFDBFE',  // Very light

  // Text
  text:      '#E2E8F0',  // Primary text
  textSub:   '#8896A8',  // Secondary / muted
  textDim:   '#3D5068',  // Placeholder / disabled

  // Semantic
  cyan:    '#22D3EE',  // AI speaking / active waveform
  success: '#34D399',  // Correct answer / green
  error:   '#F43F5E',  // Error / wrong
  warning: '#F59E0B',  // Warning / partial
  gold:    '#FBBF24',  // Score / badge

  // Waveform states
  waveAI:   '#60A5FA',  // AI speaking bars
  waveUser: '#E2E8F0',  // User speaking bars
  waveIdle: '#1A2840',  // Idle bars
} as const;

export const FONT = {
  xs:  11,
  sm:  13,
  md:  15,
  lg:  17,
  xl:  20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 38,
} as const;

export const RADIUS = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  full: 9999,
} as const;
