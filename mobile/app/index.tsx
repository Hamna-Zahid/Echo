import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { T, Fonts } from '../constants/tokens';
import Wave from '../components/echo/wave';

// Root entry — animated splash that routes based on auth + first-run state.
export default function SplashIndex() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;
  const barAnim = useRef(new Animated.Value(0)).current;
  const [, setProgress] = useState(0);
  const DEV_MODE = false;

  useEffect(() => {
    // Fade-in + slide-up entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 550,
        delay: 100,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 550,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar
    Animated.timing(barAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    // JS progress counter
    let start: number | null = null;
    let rafId: number;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 2000, 1);
      setProgress(p);
      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);

    // 🚀 Stay on splash while designing
    if (DEV_MODE) {
      return () => {
        cancelAnimationFrame(rafId);
      };
    }

    // Normal app flow
    const timer = setTimeout(async () => {
      try {
        const [
          onboarded,
          {
            data: { session },
          },
        ] = await Promise.all([
          AsyncStorage.getItem('echo_onboarding_done'),
          supabase.auth.getSession(),
        ]);
        
        if (!onboarded) {
          router.replace('/(auth)/onboarding');
        } else if (session) {
          router.replace('/(app)');
        } else {
          router.replace('/(auth)/login');
        }
      } catch {
        router.replace('/(auth)/login');
      }
    }, 2350);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
    };
  }, []);


  const barWidth =
    barAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });
  return (

    <View style={s.root}>
      {/* Logo + tagline */}
      <Animated.View
        style={[
          s.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Image
          source={require('../assets/logo.png')}
          style={s.logo}
        />
        <Text style={s.tagline}>
          SPEAK WITH CONFIDENCE
        </Text>
        <View style={s.waveContainer}>
          <Wave />
        </View>
      </Animated.View>

      {/* Progress bar */}
      <View style={s.barTrack}>
        <Animated.View
          style={[

            s.barFill,
            {
              width: barWidth
            }
          ]}
        />
      </View>
    </View>

  );
}



const s = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: T.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    alignItems: 'center',
  },

  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 14,
  },

  barTrack: {
    position: 'absolute',
    bottom: 68,
    left: 52,
    right: 52,
    height: 2,
    borderRadius: 999,
    backgroundColor: T.rose100,
    overflow: 'hidden',
  },

  barFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: T.rose600,
  },

  logo: {
    width: 230,
    height: 70,
    resizeMode: 'contain',
  },

  tagline: {
    marginTop: 18,
    fontFamily: Fonts.regular,
    fontSize: 10,
    fontWeight: '700',
    color: '#061A4A',
    letterSpacing: 2.6,
  },
  
  waveContainer: {
    marginTop: 35,
    opacity: 0.85,
  },


});