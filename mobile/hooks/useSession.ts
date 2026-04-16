import { useState, useCallback, useRef } from 'react';
import { CorrectionCardData } from '../components/CorrectionCard';

let cardCounter = 0;

export function useSession() {
  const [correctionCards, setCorrectionCards] = useState<CorrectionCardData[]>([]);
  const [sessionReady, setSessionReady] = useState(false);

  const pushCard = useCallback((errorData: any) => {
    if (!errorData?.error) return;

    const card: CorrectionCardData = {
      id: `card-${++cardCounter}-${Date.now()}`,
      error_type: errorData.error_type || 'UNKNOWN',
      original: errorData.original || '',
      corrected: errorData.corrected || '',
      explanation: errorData.explanation || '',
      better_version: errorData.better_version || '',
    };

    setCorrectionCards((prev) => {
      // Max 2 cards visible at once — drop oldest if over limit
      const updated = [...prev, card];
      return updated.slice(-2);
    });
  }, []);

  const dismissCard = useCallback((id: string) => {
    setCorrectionCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    correctionCards,
    pushCard,
    dismissCard,
    sessionReady,
    setSessionReady,
  };
}
