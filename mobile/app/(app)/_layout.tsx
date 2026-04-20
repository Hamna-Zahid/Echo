import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';
import { T } from '../../constants/tokens';

export default function AppLayout() {
  // Auth guard — if session expires while app is open, send user back to login
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/(auth)/login');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: T.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="session"            options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="session-end"        options={{ animation: 'slide_from_bottom', gestureDirection: 'vertical' }} />
      <Stack.Screen name="diagnostic-results" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="error-detail"       options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="history" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="pre-session" />
    </Stack>
  );
}
