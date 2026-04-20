import { Stack } from 'expo-router';
import { T } from '../../constants/tokens';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: T.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="session"             options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="session-end"         options={{ animation: 'slide_from_bottom', gestureDirection: 'vertical' }} />
      <Stack.Screen name="diagnostic-results"  options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="error-detail"        options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="history" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="pre-session" />
    </Stack>
  );
}
