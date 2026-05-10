import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import { setAudioModeAsync, createAudioPlayer } from 'expo-audio';

import { T, Fonts, Spacing } from '../../constants/tokens';
import { Waveform, StatusPill, CorrectionCard, type SessionState } from '../../components/echo/shared';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useVAD }        from '../../hooks/useVAD';
import { useSession }    from '../../hooks/useSession';

export default function SessionScreen() {
  const { sessionId, mode, accent } = useLocalSearchParams<{ sessionId: string; mode: string; accent?: string }>();
  const [uiState, setUiState]       = useState<SessionState>('connecting');
  const [isActive, setIsActive]     = useState(false);
  const isActiveRef                 = useRef(false);   // ref mirror of isActive for stable callbacks
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
  // All PCM F32LE chunks for the current AI turn accumulate here.
  // On tts_done we concatenate them into a single WAV and play once —
  // this eliminates the per-chunk gap/overhead of playing many tiny files.
  const pcmAccumRef    = useRef<Uint8Array[]>([]);
  const audioPlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const lastTempPath   = useRef<string | null>(null);

  const playAccumulated = useCallback(async () => {
    if (pcmAccumRef.current.length === 0) return;

    // Concatenate all accumulated F32LE PCM bytes
    const chunks = pcmAccumRef.current;
    pcmAccumRef.current = [];
    const totalLen = chunks.reduce((s, c) => s + c.length, 0);
    const allPcm = new Uint8Array(totalLen);
    let offset = 0;
    for (const c of chunks) { allPcm.set(c, offset); offset += c.length; }

    let tempPath: string | null = null;
    try {
      const wav = pcmF32leToWav(allPcm, 24000);
      const b64 = bytesToBase64(new Uint8Array(wav));
      tempPath = `${FileSystem.cacheDirectory}echo_${Date.now()}.wav`;
      await FileSystem.writeAsStringAsync(tempPath, b64, { encoding: 'base64' });

      // Release any previous player
      if (audioPlayerRef.current) {
        try { audioPlayerRef.current.remove(); } catch (_) {}
        audioPlayerRef.current = null;
      }
      // Clean up previous temp file
      if (lastTempPath.current) {
        FileSystem.deleteAsync(lastTempPath.current, { idempotent: true }).catch(() => {});
      }
      lastTempPath.current = tempPath;

      const player = createAudioPlayer({ uri: tempPath });
      audioPlayerRef.current = player;
      player.play();

      // Duration-based wait (sample-accurate)
      const durationMs = Math.ceil((totalLen / 4 / 24000) * 1000) + 150;
      await new Promise(res => setTimeout(res, durationMs));
    } catch (e) {
      console.warn('[Audio] playback error:', e);
      if (tempPath) FileSystem.deleteAsync(tempPath, { idempotent: true }).catch(() => {});
    }

    isSpeakingRef.current = false;
    setUiState('listening');
  }, []);

  const clearAudio = useCallback(() => {
    pcmAccumRef.current  = [];
    isSpeakingRef.current = false;
    if (audioPlayerRef.current) {
      try { audioPlayerRef.current.remove(); } catch (_) {}
      audioPlayerRef.current = null;
    }
    if (lastTempPath.current) {
      FileSystem.deleteAsync(lastTempPath.current, { idempotent: true }).catch(() => {});
      lastTempPath.current = null;
    }
    setUiState('listening');
  }, []);

  // ── WebSocket ────────────────────────────────────────────────
  const { sendMessage, connected } = useWebSocket({
    sessionId: sessionId!,
    mode:   mode   || 'training',
    accent: accent || undefined,
    onMessage: useCallback(async (msg: any) => {
      try {
        switch (msg.type) {
          case 'session_ready':
            setSessionReady(true);
            setIsActive(true);
            isActiveRef.current = true;
            setUiState('idle');
            if (msg.session_id) sessionDbIdRef.current = msg.session_id;
            break;
          case 'tts_chunk':
            pcmAccumRef.current.push(base64ToBytes(msg.data));
            if (!isSpeakingRef.current) {
              isSpeakingRef.current = true;
              setUiState('speaking');
            }
            break;
          case 'tts_done':
            // All chunks for this turn have arrived — concatenate and play as one WAV
            playAccumulated();
            break;
          case 'tts_stop':
            clearAudio();
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
          case 'session_summary':
            // Backend confirms graceful session close — nothing extra needed on the client
            break;
          case 'error':
            console.warn('[Session] Server error:', msg.message);
            break;
        }
      } catch (error) {
        console.warn('[Session] Error handling WebSocket message:', error);
      }
    }, [clearAudio, playAccumulated, pushCard]),
  });

  // ── VAD ──────────────────────────────────────────────────────
  const audioChunksRef = useRef<Uint8Array[]>([]);

  const { startVAD, stopVAD } = useVAD({
    onSpeechStart: useCallback(() => {
      if (!isActiveRef.current) return;
      audioChunksRef.current = [];
      if (isSpeakingRef.current) {
        sendMessage({ type: 'interrupt' });
        clearAudio();
      }
      setUiState('listening');
    }, [sendMessage, clearAudio]),

    onSpeechEnd: useCallback(async (audioData: Uint8Array) => {
      if (!isActiveRef.current) return;
      setUiState('processing');
      try {
        for (const chunk of [...audioChunksRef.current, audioData]) {
          sendMessage({ type: 'audio_chunk', data: bytesToBase64(chunk) });
        }
        audioChunksRef.current = [];
        sendMessage({ type: 'turn_end' });
      } catch (error) {
        console.warn('[Session] Error sending audio chunks:', error);
        setUiState('listening');
      }
    }, [sendMessage]),

    onAudioData: useCallback((chunk: Uint8Array) => {
      audioChunksRef.current.push(chunk);
    }, []),
  });

  useEffect(() => {
    // Set audio mode first — must allow both recording AND playback in silent mode
    // before any WebSocket audio arrives or VAD starts recording.
    setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    }).catch(() => {});
    startVAD();
    
    return () => {
      stopVAD();
      sendMessage({ type: 'session_end' });
      if (audioPlayerRef.current) {
        try { audioPlayerRef.current.remove(); } catch (_) {}
        audioPlayerRef.current = null;
      }
    };
  }, [startVAD, stopVAD, sendMessage]);

  const handleEnd = () => {
    // Stop mic first to avoid leaving recording running during navigation
    stopVAD();
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

function pcmF32leToWav(pcm: Uint8Array, sr: number): ArrayBuffer {
  const sampleCount = pcm.length / 4;
  const out = new ArrayBuffer(44 + sampleCount * 2);
  const view = new DataView(out);
  const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };

  ws(0, 'RIFF');
  view.setUint32(4, 36 + sampleCount * 2, true);
  ws(8, 'WAVE');
  ws(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ws(36, 'data');
  view.setUint32(40, sampleCount * 2, true);

  const pcmView = new DataView(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  let offset = 44;
  for (let i = 0; i < sampleCount; i++) {
    const sample = pcmView.getFloat32(i * 4, true);
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return out;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenH,
    paddingTop: 8,
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
