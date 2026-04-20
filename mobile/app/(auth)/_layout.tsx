import { Stack } from 'expo-router';
import { T } from '../../constants/tokens';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: T.bg },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      {/* post-reg: no back gesture — user has already committed to an account */}
      <Stack.Screen name="post-reg" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
