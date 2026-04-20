/**
 * useVAD — Voice Activity Detection via expo-av recording + amplitude metering.
 *
 * How it works:
 *   1. Start a continuous expo-av recording
 *   2. Poll metering every 32ms — when amplitude crosses threshold → speechStart
 *   3. After SILENCE_THRESHOLD_MS of continuous silence → speechEnd
 *   4. On speechEnd: stop recording, read the file URI, fetch bytes, call onSpeechEnd(bytes)
 *   5. Immediately start a new recording for the next utterance
 *
 * The recorded audio is in WebM/opus (Android) or WAV/PCM (iOS) — Groq Whisper
 * accepts both formats directly.
 *
 * For production Silero ONNX VAD: replace the amplitude threshold check with
 * ONNX Runtime inference on 512-sample PCM chunks.
 */

import { useRef, useCallback } from 'react';
import { AudioModule, AudioQuality, IOSOutputFormat, requestRecordingPermissionsAsync, setAudioModeAsync, RecorderState } from 'expo-audio';

interface VADOptions {
  onSpeechStart: () => void;
  onSpeechEnd: (audioData: Uint8Array) => void;
  onAudioData?: (chunk: Uint8Array) => void;
  silenceThresholdMs?: number;
  speechDbThreshold?: number;
}

const POLL_INTERVAL_MS = 32;     // 30fps polling — low enough latency, low CPU
const SILENCE_THRESHOLD_MS = 800; // 800ms of silence → end of utterance
const SPEECH_DB_THRESHOLD = -35;  // dB above which we consider speech active

const RECORDING_OPTIONS = {
  android: {
    extension: '.webm',
    outputFormat: 'webm',
    audioEncoder: 'default',
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
  },
  ios: {
    extension: '.wav',
    outputFormat: IOSOutputFormat.LINEARPCM,
    audioQuality: AudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm;codecs=opus',
    bitsPerSecond: 64000,
  },
};

export function useVAD({
  onSpeechStart,
  onSpeechEnd,
  onAudioData,
  silenceThresholdMs = SILENCE_THRESHOLD_MS,
  speechDbThreshold = SPEECH_DB_THRESHOLD,
}: VADOptions) {
  const recordingRef = useRef<any>(null);
  const isSpeakingRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef(false);

  const stopCurrentRecording = useCallback(async (): Promise<Uint8Array> => {
    const rec = recordingRef.current;
    if (!rec) return new Uint8Array(0);

    try {
      await rec.stop();
      const uri = rec.uri;
      if (!uri) return new Uint8Array(0);

      // Read the recorded file as bytes
      const response = await fetch(uri);
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer);
    } catch (e) {
      return new Uint8Array(0);
    } finally {
      recordingRef.current = null;
    }
  }, []);

  const startNewRecording = useCallback(async () => {
    if (!activeRef.current) return;
    try {
      const rec = new AudioModule.AudioRecorder({
        ...RECORDING_OPTIONS,
        isMeteringEnabled: true,
      } as any);
      await rec.prepareToRecordAsync();
      rec.record();
      recordingRef.current = rec;
    } catch (e) {
      console.warn('VAD: failed to start recording', e);
    }
  }, []);

  const handleSpeechEnd = useCallback(async () => {
    if (!isSpeakingRef.current) return;
    isSpeakingRef.current = false;

    // Stop recording and get the audio bytes
    const audioBytes = await stopCurrentRecording();
    onSpeechEnd(audioBytes);

    // Immediately start listening for the next utterance
    await startNewRecording();
  }, [onSpeechEnd, stopCurrentRecording, startNewRecording]);

  const startVAD = useCallback(async () => {
    activeRef.current = true;

    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      console.error('VAD: microphone permission denied');
      return;
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });

    await startNewRecording();

    // Metering poll loop
    pollIntervalRef.current = setInterval(async () => {
      if (!activeRef.current || !recordingRef.current) return;

      try {
        const status = recordingRef.current.getStatus();
        if (!status.isRecording) return;

        const db = status.metering ?? -160;
        const isSpeech = db > speechDbThreshold;

        if (isSpeech) {
          if (!isSpeakingRef.current) {
            isSpeakingRef.current = true;
            onSpeechStart();
          }
          // Reset silence timer on every speech frame
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else {
          // Silence — start or maintain silence timer
          if (isSpeakingRef.current && !silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(async () => {
              silenceTimerRef.current = null;
              await handleSpeechEnd();
            }, silenceThresholdMs);
          }
        }
      } catch (_) {
        // Ignore errors during teardown
      }
    }, POLL_INTERVAL_MS);
  }, [onSpeechStart, handleSpeechEnd, speechDbThreshold, silenceThresholdMs, startNewRecording]);

  const stopVAD = useCallback(async () => {
    activeRef.current = false;

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recordingRef.current) {
      try { await recordingRef.current.stop(); } catch (_) {}
      recordingRef.current = null;
    }
    isSpeakingRef.current = false;
  }, []);

  return { startVAD, stopVAD };
}
