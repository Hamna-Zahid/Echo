/**
 * useLiveKit — LiveKit room management for WebRTC audio.
 *
 * LiveKit provides the low-latency WebRTC layer.
 * In the current architecture, audio is captured via LiveKit's
 * LocalAudioTrack and forwarded to the backend via WebSocket.
 *
 * For production: the backend can receive audio via LiveKit's
 * server-side room API, avoiding double-transmission.
 */

import { useRef, useCallback, useState } from 'react';
import {
  Room,
  RoomEvent,
  LocalAudioTrack,
  createLocalAudioTrack,
  AudioPresets,
// @ts-ignore — livekit-client not installed; this hook is unused
} from 'livekit-client';

const LIVEKIT_URL = process.env.EXPO_PUBLIC_LIVEKIT_URL || '';

interface UseLiveKitOptions {
  onAudioData?: (samples: Float32Array) => void;
}

export function useLiveKit({ onAudioData }: UseLiveKitOptions = {}) {
  const roomRef = useRef<Room | null>(null);
  const audioTrackRef = useRef<LocalAudioTrack | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(async (token: string) => {
    if (!LIVEKIT_URL) {
      console.warn('LIVEKIT_URL not configured');
      return;
    }

    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
      audioCaptureDefaults: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000,
        channelCount: 1,
      },
    });

    room.on(RoomEvent.Connected, () => setConnected(true));
    room.on(RoomEvent.Disconnected, () => setConnected(false));

    await room.connect(LIVEKIT_URL, token);
    roomRef.current = room;

    // Create and publish local audio track
    const audioTrack = await createLocalAudioTrack({
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 16000,
      channelCount: 1,
    });

    audioTrackRef.current = audioTrack;
    await room.localParticipant.publishTrack(audioTrack);

    setConnected(true);
  }, []);

  const disconnect = useCallback(async () => {
    if (audioTrackRef.current) {
      audioTrackRef.current.stop();
      audioTrackRef.current = null;
    }
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setConnected(false);
  }, []);

  const muteAudio = useCallback(async (muted: boolean) => {
    if (audioTrackRef.current) {
      if (muted) {
        await audioTrackRef.current.mute();
      } else {
        await audioTrackRef.current.unmute();
      }
    }
  }, []);

  return {
    connect,
    disconnect,
    muteAudio,
    connected,
    room: roomRef.current,
  };
}
