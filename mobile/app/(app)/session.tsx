import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Audio } from 'expo-av';

import { T, Fonts, Spacing } from '../../constants/tokens';
import { Waveform, StatusPill, CorrectionCard, type SessionState } from '../../components/echo/shared';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useVAD }        from '../../hooks/useVAD';
import { useSession }    from '../../hooks/useSession';

export default function SessionScreen() {
  const { sessionId, mode, accent } = useLocalSearchParams<{ sessionId: string; mode: string; accent?: string }>();
  const [uiState, setUiState]       = useState<SessionState>('connecting');
  const [isActive, setIsActive]     = useState(false);
  const [elapsed, setElapsed]       = useState(0);
  const isSpeakingRef   = useRef(false);
  const sessionDbIdRef  = useRef<string | null>(null);

  const { correctionCards, dismissCard, pushCard, setSessionReady } = useSession();

  // ── Timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [isActive]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  // ── Audio playback ───────────────────────────────────────────
  const audioBufferRef    = useRef<Uint8Array[]>([]);
  const playbackQueueRef  = useRef(false);

  const playNextChunk = useCallback(async () => {
    if (playbackQueueRef.current || audioBufferRef.current.length === 0) return;
    playbackQueueRef.current = true;
    while (audioBufferRef.current.length > 0) {
      const chunk = audioBufferRef.current.shift()!;
      try {
        const sound = new Audio.Sound();
        const wav = pcmF32leToWav(chunk, 24000);
        await sound.loadAsync({ uri: arrayBufferToDataUri(wav) });
        await sound.playAsync();
        await waitForPlayback(sound);
        await sound.unloadAsync();
      } catch (_) {}
    }
    playbackQueueRef.current = false;
  }, []);

  const clearAudio = useCallback(async () => {
    audioBufferRef.current   = [];
    playbackQueueRef.current = false;
    isSpeakingRef.current    = false;
    setUiState('listening');
  }, []);

  // ── WebSocket ────────────────────────────────────────────────
  const { sendMessage, connected } = useWebSocket({
    sessionId: sessionId!,
    mode:   mode   || 'training',
    accent: accent || undefined,
    onMessage: useCallback(async (msg: any) => {
      switch (msg.type) {
        case 'session_ready':
          setSessionReady(true);
          setIsActive(true);
          setUiState('idle');
          if (msg.session_id) sessionDbIdRef.current = msg.session_id;
          break;
        case 'tts_chunk':
          audioBufferRef.current.push(base64ToBytes(msg.data));
          if (!isSpeakingRef.current) {
            isSpeakingRef.current = true;
            setUiState('speaking');
          }
          playNextChunk();
          break;
        case 'tts_done':
          setTimeout(() => {
            if (audioBufferRef.current.length === 0) {
              isSpeakingRef.current = false;
              setUiState('listening');
            }
          }, 400);
          break;
        case 'tts_stop':
          await clearAudio();
          break;
        case 'correction_card':
          pushCard(msg.error);
          break;
        case 'diagnostic_complete': {
          const r = msg.result || {};
          router.push({
            pathname: '/(app)/diagnostic-results',
            params: {
              cefr_level:       r.cefr_level,
              ielts_equivalent: r.ielts_equivalent != null ? String(r.ielts_equivalent) : undefined,
              fluency:          r.fluency          != null ? String(r.fluency)          : undefined,
              lexical:          r.lexical           != null ? String(r.lexical)          : undefined,
              grammar:          r.grammar           != null ? String(r.grammar)          : undefined,
              pronunciation:    r.pronunciation     != null ? String(r.pronunciation)    : undefined,
              strengths:        r.strengths  ? JSON.stringify(r.strengths)  : undefined,
              weaknesses:       r.weaknesses ? JSON.stringify(r.weaknesses) : undefined,
              learning_plan:    r.learning_plan,
              focus_area:       r.focus_area,
            },
          });
          break;
        }
      }
    }, []),
  });

  // ── VAD ──────────────────────────────────────────────────────
  const audioChunksRef = useRef<Uint8Array[]>([]);

  const { startVAD, stopVAD } = useVAD({
    onSpeechStart: useCallback(() => {
      if (!isActive) return;
      audioChunksRef.current = [];
      if (isSpeakingRef.current) {
        sendMessage({ type: 'interrupt' });
        clearAudio();
      }
      setUiState('listening');
    }, [isActive]),

    onSpeechEnd: useCallback(async (audioData: Uint8Array) => {
      if (!isActive) return;
      setUiState('processing');
      for (const chunk of [...audioChunksRef.current, audioData]) {
        sendMessage({ type: 'audio_chunk', data: bytesToBase64(chunk) });
      }
      audioChunksRef.current = [];
      sendMessage({ type: 'turn_end' });
    }, [isActive]),

    onAudioData: useCallback((chunk: Uint8Array) => {
      audioChunksRef.current.push(chunk);
    }, []),
  });

  useEffect(() => {
    Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    startVAD();
    return () => {
      stopVAD();
      sendMessage({ type: 'session_end' });
    };
  }, []);

  const handleEnd = () => {
    sendMessage({ type: 'session_end' });
    const dbId = sessionDbIdRef.current;
    router.replace({
      pathname: '/(app)/session-end',
      params: {
        sessionId: dbId ?? undefined,
        mode:      mode  ?? 'training',
        elapsed:   String(elapsed),
      },
    });
  };

  // Format mode label
  const modeLabel = (mode || 'TRAINING').split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

  return (
    <SafeAreaView style={s.root}>

      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.endBtn} onPress={handleEnd}>
          <Text style={s.endBtnText}>End</Text>
        </TouchableOpacity>

        <View style={s.modeTag}>
          <Text style={s.modeTagText}>{modeLabel.toUpperCase()}</Text>
        </View>

        <View style={s.timerRow}>
          <View style={[s.timerDot, { backgroundColor: isActive ? T.success : T.muted }]} />
          <Text style={s.timerText}>{mm}:{ss}</Text>
        </View>
      </View>

      {/* ── Main stage ── */}
      <View style={s.stage}>
        {/* Ambient glow when speaking */}
        {uiState === 'speaking' && (
          <View style={[s.ambientGlow, { pointerEvents: 'none' }]} />
        )}
        {/* Active recording border indicator */}
        {uiState === 'listening' && (
          <View style={[s.listeningBorder, { pointerEvents: 'none' }]} />
        )}

        <Waveform state={uiState} />
        <StatusPill state={uiState} />

        {uiState === 'speaking' && (
          <Text style={s.interruptHint}>Tap to interrupt</Text>
        )}
      </View>

      {/* ── Reconnect banner ── */}
      {!connected && (
        <View style={s.reconnectBar}>
          <Text style={s.reconnectText}>Reconnecting…</Text>
        </View>
      )}

      {/* ── Correction cards (stacked at bottom) ── */}
      <View style={[s.cardsArea, { pointerEvents: 'box-none' }]}>
        {correctionCards.slice(0, 1).map((card) => (
          <CorrectionCard
            key={card.id}
            correction={{
              id:          card.id,
              type:        card.error_type,
              original:    card.original_utterance,
              corrected:   card.corrected_form,
              explanation: card.explanation,
              full:        card.full_sentence,
            }}
            onDismiss={() => dismissCard(card.id)}
          />
        ))}
      </View>

    </SafeAreaView>
  );
}

// ── Helpers ───────────────────────────────────────────────────

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function arrayBufferToDataUri(buf: ArrayBuffer): string {
  return `data:audio/wav;base64,${bytesToBase64(new Uint8Array(buf))}`;
}

function waitForPlayback(sound: Audio.Sound): Promise<void> {
  return new Promise(res => {
    sound.setOnPlaybackStatusUpdate(st => {
      if (st.isLoaded && st.didJustFinish) res();
    });
  });
}

function pcmF32leToWav(pcm: Uint8Array, sr: number): ArrayBuffer {
  const header = new ArrayBuffer(44);
  const v = new DataView(header);
  const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); v.setUint32(4, 36 + pcm.length, true); ws(8, 'WAVE');
  ws(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 3, true);
  v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true);
  v.setUint16(32, 4, true); v.setUint16(34, 32, true); ws(36, 'data');
  v.setUint32(40, pcm.length, true);
  const out = new Uint8Array(44 + pcm.length);
  out.set(new Uint8Array(header), 0); out.set(pcm, 44);
  return out.buffer;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenH,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: T.border,
  },
  endBtn: {
    height: 34, paddingHorizontal: 14, borderRadius: 10,
    backgroundColor: T.rose100, alignItems: 'center', justifyContent: 'center',
  },
  endBtnText: { fontFamily: Fonts.semibold, fontSize: 13, color: T.rose600 },

  modeTag: {
    height: 27, paddingHorizontal: 12, borderRadius: 999,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  modeTagText: { fontFamily: Fonts.bold, fontSize: 10, color: T.slate, letterSpacing: 0.8 },

  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timerDot: { width: 7, height: 7, borderRadius: 999 },
  timerText: { fontFamily: Fonts.semibold, fontSize: 13, color: T.charcoal, letterSpacing: -0.2 },

  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, position: 'relative' },

  ambientGlow: {
    position: 'absolute', width: 340, height: 340, borderRadius: 999,
    backgroundColor: 'rgba(252,231,243,0.7)',
  },
  listeningBorder: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    borderWidth: 2, borderColor: T.success, borderRadius: 0,
  },

  interruptHint: { fontFamily: Fonts.regular, fontSize: 12, color: T.muted, letterSpacing: 0.1 },

  reconnectBar: { backgroundColor: T.rose600, paddingVertical: 8, alignItems: 'center' },
  reconnectText: { fontFamily: Fonts.semibold, fontSize: 13, color: '#fff' },

  cardsArea: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
