import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../services/supabase';

let WS_BASE = process.env.EXPO_PUBLIC_BACKEND_WS_URL || 'ws://localhost:8000';
if (Platform.OS === 'android' && WS_BASE.includes('localhost')) {
  WS_BASE = WS_BASE.replace('localhost', '10.0.2.2');
}

interface UseWebSocketOptions {
  sessionId: string;
  mode: string;
  accent?: string;
  onMessage: (msg: any) => void;
}

export function useWebSocket({ sessionId, mode, accent, onMessage }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    const accentParam = accent ? `&accent=${encodeURIComponent(accent)}` : '';
    const url = `${WS_BASE}/ws/${sessionId}?token=${session.access_token}&mode=${mode}${accentParam}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        onMessage(msg);
      } catch (e) {
        console.warn('WS parse error', e);
      }
    };

    ws.onerror = (e) => {
      console.warn('WebSocket error', e);
    };

    ws.onclose = (e) => {
      if (!mountedRef.current) return;
      setConnected(false);
      // Reconnect after 2s unless session ended
      if (e.code !== 1000 && e.code !== 4001) {
        reconnectTimerRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, 2000);
      }
    };
  }, [sessionId, mode, accent, onMessage]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000);
        wsRef.current = null;
      }
    };
  }, []);

  const sendMessage = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { sendMessage, connected };
}
