import { Stack } from 'expo-router';
import { C } from '../../constants/colors';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: C.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="session" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="history" />
    </Stack>
  );
}
