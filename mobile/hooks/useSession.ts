import { useState, useCallback } from 'react';

// Shape that the backend sends in correction_card messages
export type CardData = {
  id: string;
  error_type: string;
  original_utterance: string;
  corrected_form: string;
  explanation: string;
  full_sentence?: string;
};

let cardCounter = 0;

export function useSession() {
  const [correctionCards, setCorrectionCards] = useState<CardData[]>([]);
  const [sessionReady, setSessionReady]       = useState(false);

  const pushCard = useCallback((errorData: any) => {
    if (!errorData) return;

    const card: CardData = {
      id:                 `card-${++cardCounter}-${Date.now()}`,
      error_type:         errorData.error_type         || 'TENSE',
      original_utterance: errorData.original_utterance || errorData.original || '',
      corrected_form:     errorData.corrected_form      || errorData.corrected || '',
      explanation:        errorData.explanation         || '',
      full_sentence:      errorData.full_sentence       || errorData.better_version || '',
    };

    setCorrectionCards(prev => [...prev, card].slice(-2));
  }, []);

  const dismissCard = useCallback((id: string) => {
    setCorrectionCards(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    correctionCards,
    pushCard,
    dismissCard,
    sessionReady,
    setSessionReady,
  };
}
