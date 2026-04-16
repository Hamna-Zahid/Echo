import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Audio } from 'expo-av';

import WaveformVisualizer from '../../components/WaveformVisualizer';
import CorrectionCard from '../../components/CorrectionCard';
import SessionTimer from '../../components/SessionTimer';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useVAD } from '../../hooks/useVAD';
import { useSession } from '../../hooks/useSession';
import { C, FONT, RADIUS } from '../../constants/colors';

type UIState = 'connecting' | 'idle' | 'listening' | 'processing' | 'speaking';

const STATE_META: Record<UIState, { label: string; dot: string }> = {
  connecting:  { label: 'Connecting',        dot: C.textDim },
  idle:        { label: 'Ready',             dot: C.textDim },
  listening:   { label: 'Listening',         dot: C.success },
  processing:  { label: 'Processing',        dot: C.warning },
  speaking:    { label: 'EchoCoach speaking', dot: C.blue400 },
};

export default function SessionScreen() {
  const { sessionId, mode } = useLocalSearchParams<{ sessionId: string; mode: string }>();
  const [uiState, setUiState] = useState<UIState>('connecting');
  const [isActive, setIsActive] = useState(false);
  const isSpeakingRef = useRef(false);

  const { correctionCards, dismissCard, pushCard, setSessionReady } = useSession();

  // ── Audio playback ────────────────────────────────────────────────────────
  const audioBufferRef = useRef<Uint8Array[]>([]);
  const playbackQueueRef = useRef(false);

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
    audioBufferRef.current = [];
    playbackQueueRef.current = false;
    isSpeakingRef.current = false;
    setUiState('listening');
  }, []);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  const { sendMessage, connected } = useWebSocket({
    sessionId: sessionId!,
    mode: mode || 'training',
    onMessage: useCallback(async (msg: any) => {
      switch (msg.type) {
        case 'session_ready':
          setSessionReady(true);
          setIsActive(true);
          setUiState('idle');
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
        case 'diagnostic_complete':
          router.push({ pathname: '/(app)/history', params: { highlight: msg.result?.cefr_level } });
          break;
      }
    }, []),
  });

  // ── VAD ───────────────────────────────────────────────────────────────────
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
    router.replace('/(app)');
  };

  const waveMode = uiState === 'speaking' ? 'ai' : uiState === 'listening' ? 'user' : 'idle';
  const meta = STATE_META[uiState];

  return (
    <SafeAreaView style={s.container}>

      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.endBtn} onPress={handleEnd}>
          <Text style={s.endBtnText}>End</Text>
        </TouchableOpacity>

        <View style={s.modeTag}>
          <Text style={s.modeTagText}>{(mode || 'TRAINING').toUpperCase()}</Text>
        </View>

        <SessionTimer active={isActive} />
      </View>

      {/* ── Waveform ── */}
      <View style={s.waveArea}>
        <WaveformVisualizer mode={waveMode} />

        {/* Status pill */}
        <View style={s.statusPill}>
          <View style={[s.statusDot, { backgroundColor: meta.dot }]} />
          <Text style={s.statusLabel}>{meta.label}</Text>
        </View>
      </View>

      {/* ── Reconnect banner ── */}
      {!connected && (
        <View style={s.reconnectBar}>
          <Text style={s.reconnectText}>Reconnecting...</Text>
        </View>
      )}

      {/* ── Correction cards ── */}
      <View style={s.cardsArea} pointerEvents="box-none">
        {correctionCards.slice(0, 2).map((card, idx) => (
          <CorrectionCard
            key={card.id}
            card={card}
            index={idx}
            onDismiss={() => dismissCard(card.id)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

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
  return new Promise((res) => {
    sound.setOnPlaybackStatusUpdate((st) => {
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
  container: { flex: 1, backgroundColor: C.bg },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
    paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  endBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: C.error + '66',
    backgroundColor: C.error + '11',
  },
  endBtnText: { color: C.error, fontSize: FONT.sm, fontWeight: '600' },
  modeTag: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: RADIUS.sm,
    backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border,
  },
  modeTagText: { color: C.textDim, fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  waveArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
  },

  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: C.surface,
    borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: C.border,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusLabel: { fontSize: FONT.sm, color: C.textSub, fontWeight: '500' },

  reconnectBar: {
    backgroundColor: C.blue700, paddingVertical: 8, alignItems: 'center',
  },
  reconnectText: { color: C.text, fontSize: FONT.sm },

  cardsArea: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, gap: 8,
  },
});
