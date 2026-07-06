export const CEFR_LEVELS = [
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
] as const;

export const CEFR_SUBTITLE: Record<(typeof CEFR_LEVELS)[number], string> = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Pre-intermediate',
  B2: 'Upper Intermediate',
  C1: 'Advanced',
  C2: 'Mastery',
};

  export type CEFRLevel = (typeof CEFR_LEVELS)[number];
  export function getNextLevel(level?: CEFRLevel) {
    const index = CEFR_LEVELS.indexOf(level as CEFRLevel);
  
    if (index === -1 || index === CEFR_LEVELS.length - 1) {
      return null;
    }
  
    return CEFR_LEVELS[index + 1];
  }

export function getLevelProgress(level?: string) {
  switch (level) {
    case 'A1':
      return 15;

    case 'A2':
      return 30;

    case 'B1':
      return 50;

    case 'B2':
      return 70;

    case 'C1':
      return 90;

    case 'C2':
      return 100;

    default:
      return 0;
  }
}