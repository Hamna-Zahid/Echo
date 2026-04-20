import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { T } from '../constants/tokens';
import 'react-native-url-polyfill/auto';

// Hold the native splash until fonts are ready — prevents white flash
SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden or not available — safe to ignore
});

// Load Inter fonts if available (requires @expo-google-fonts/inter install)
let useFonts: any = null;
let fontModules: any = null;
try {
  const fontPkg = require('@expo-google-fonts/inter');
  useFonts = fontPkg.useFonts;
  fontModules = {
    Inter_400Regular:   fontPkg.Inter_400Regular,
    Inter_500Medium:    fontPkg.Inter_500Medium,
    Inter_600SemiBold:  fontPkg.Inter_600SemiBold,
    Inter_700Bold:      fontPkg.Inter_700Bold,
    Inter_800ExtraBold: fontPkg.Inter_800ExtraBold,
  };
} catch (_) {
  // fonts package not installed — app works with system fonts
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts ? useFonts(fontModules) : [true];

  useEffect(() => {
    if (fontsLoaded) {
      // Fonts ready — dismiss native splash so our animated splash takes over
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    // Invisible placeholder — native splash is still showing
    return (
      <View style={{ flex: 1, backgroundColor: T.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={T.rose600} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: T.bg }}>
      <StatusBar style="dark" backgroundColor={T.bg} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: T.bg },
          animation: 'fade',
        }}
      >
        {/* index.tsx = animated splash entry — decides where to navigate */}
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
