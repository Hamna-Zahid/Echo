// EchoCoach — Design tokens (white + rose theme)

export const T = {
  bg:              '#FFFFFF',
  bgSubtle:        '#FDF8F8',
  surface:         '#FFFFFF',
  surfaceElevated: '#FFF5F7',
  rose600:         '#E11D74',
  rose500:         '#F43F8E',
  rose400:         '#FB7BAF',
  rose200:         '#FBCFE8',
  rose100:         '#FCE7F3',
  rose50:          '#FFF0F6',
  charcoal:        '#111827',
  slate:           '#374151',
  muted:           '#9CA3AF',
  border:          '#F3E8EE',
  borderStrong:    '#E9D4DD',
  success:         '#10B981',
  warning:         '#F59E0B',
  errorText:       '#EF4444',
  gold:            '#D97706',
} as const;

export const Fonts = {
  regular:   'Inter_400Regular',
  medium:    'Inter_500Medium',
  semibold:  'Inter_600SemiBold',
  bold:      'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

export const Radius = {
  card:   20,
  button: 999,
  input:  14,
  chip:   999,
  small:  10,
} as const;

export const Spacing = {
  screenH: 22,
  cardP:   20,
  gap:     16,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#E11D74',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  button: {
    shadowColor: '#E11D74',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

export const MODES = [
  { id: 'Diagnostic',           color: '#0EA5E9', bg: '#E0F2FE', badgeBg: '#BAE6FD', badgeColor: '#0369A1', badge: '5 min',        desc: 'Assess your current IELTS band',       mode: 'diagnostic'    },
  { id: 'IELTS Training',       color: '#E11D74', bg: '#FFF0F6', badgeBg: '#FCE7F3', badgeColor: '#BE185D', badge: 'Recommended',  desc: 'Target your weak points with Echo',    mode: 'training'      },
  { id: 'Interview Prep',       color: '#D97706', bg: '#FFFBEB', badgeBg: '#FEF3C7', badgeColor: '#92400E', badge: 'Pro',          desc: 'Nail your next job interview',          mode: 'interview'     },
  { id: 'Daily Conversation',   color: '#0D9488', bg: '#F0FDFA', badgeBg: '#CCFBF1', badgeColor: '#0F766E', badge: 'Casual',       desc: 'Build fluency through real dialogue',   mode: 'conversation'  },
  { id: 'Professional English', color: '#6366F1', bg: '#EEF2FF', badgeBg: '#E0E7FF', badgeColor: '#4338CA', badge: 'Work',         desc: 'Lead meetings, pitch, close deals',    mode: 'professional'  },
  { id: 'Accent Training',      color: '#7C3AED', bg: '#F5F3FF', badgeBg: '#EDE9FE', badgeColor: '#6D28D9', badge: 'New',          desc: 'Shadow, repeat, perfect your accent',  mode: 'accent'        },
] as const;

export const ERROR_TYPES: Record<string, { color: string; bg: string; label: string }> = {
  TENSE:       { color: '#F59E0B', bg: '#FEF3C7', label: 'Tense' },
  ARTICLE:     { color: '#0EA5E9', bg: '#E0F2FE', label: 'Article' },
  PREPOSITION: { color: '#8B5CF6', bg: '#EDE9FE', label: 'Preposition' },
  COLLOCATION: { color: '#F43F8E', bg: '#FCE7F3', label: 'Collocation' },
  AGREEMENT:   { color: '#F97316', bg: '#FEF0E6', label: 'Agreement' },
  VOCAB:       { color: '#6366F1', bg: '#EEF2FF', label: 'Vocabulary' },
  FILLER:      { color: '#0D9488', bg: '#F0FDFA', label: 'Filler word' },
};
