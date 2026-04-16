// Client-side prompt fragments used for UI display only.
// All actual system prompts live in backend/prompts/.

export const MODE_DESCRIPTIONS = {
  diagnostic: 'A 3-minute speaking test to establish your CEFR level and IELTS band estimate.',
  training: 'Guided conversation practice with real-time grammar corrections.',
  interview: 'Mock job interview with STAR-format coaching and professional vocabulary feedback.',
} as const;

export const CEFR_DESCRIPTIONS: Record<string, string> = {
  A1: 'Beginner — basic phrases and familiar topics',
  A2: 'Elementary — simple everyday communication',
  B1: 'Intermediate — familiar topics and travel',
  B2: 'Upper-Intermediate — fluent interaction with native speakers',
  C1: 'Advanced — flexible, effective language use',
  C2: 'Proficient — effortless, precise communication',
};

export const IELTS_BAND_LABELS: Record<number, string> = {
  4: 'Limited User',
  4.5: 'Limited User',
  5: 'Modest User',
  5.5: 'Modest User',
  6: 'Competent User',
  6.5: 'Competent User',
  7: 'Good User',
  7.5: 'Good User',
  8: 'Very Good User',
  8.5: 'Very Good User',
  9: 'Expert User',
};
