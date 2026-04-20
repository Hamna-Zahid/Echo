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
    />
  );
}
