import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withDelay,
  cancelAnimation, Easing,
} from 'react-native-reanimated';
import { C } from '../constants/colors';

export type WaveformMode = 'idle' | 'user' | 'ai';

const BAR_COUNT = 24;
const BAR_W = 3;
const BAR_GAP = 4;
const MAX_H = 72;
const MIN_H = 5;

function Bar({ index, mode }: { index: number; mode: WaveformMode }) {
  const h = useSharedValue(MIN_H);

  useEffect(() => {
    cancelAnimation(h);
    const mid = BAR_COUNT / 2;
    const centerWeight = 1 - Math.abs(index - mid) / mid;

    if (mode === 'idle') {
      h.value = withDelay(
        index * 50,
        withRepeat(
          withSequence(
            withTiming(MIN_H + 5, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
            withTiming(MIN_H,     { duration: 1000, easing: Easing.inOut(Easing.sin) }),
          ), -1, true,
        ),
      );
    } else if (mode === 'ai') {
      // Smooth organic AI waveform — center bars taller, outer bars shorter
      const peak = MIN_H + (MAX_H - MIN_H) * (0.25 + centerWeight * 0.7);
      const trough = peak * 0.3;
      const speed = 280 + index * 14;
      h.value = withDelay(
        index * 30,
        withRepeat(
          withSequence(
            withTiming(peak,   { duration: speed, easing: Easing.inOut(Easing.sin) }),
            withTiming(trough, { duration: speed * 0.8, easing: Easing.inOut(Easing.sin) }),
          ), -1, true,
        ),
      );
    } else {
      // User speaking — fast, irregular, reactive
      const peak = MIN_H + (MAX_H - MIN_H) * (0.2 + Math.random() * 0.8);
      const sp = 80 + (index % 5) * 20;
      h.value = withDelay(
        (index % 6) * 18,
        withRepeat(
          withSequence(
            withTiming(peak,       { duration: sp, easing: Easing.out(Easing.quad) }),
            withTiming(MIN_H + 4,  { duration: sp * 1.5, easing: Easing.in(Easing.quad) }),
          ), -1, false,
        ),
      );
    }
  }, [mode]);

  const color = mode === 'ai' ? C.waveAI : mode === 'user' ? C.waveUser : C.waveIdle;

  const aStyle = useAnimatedStyle(() => ({
    height: h.value,
    backgroundColor: color,
    opacity: mode === 'idle' ? 0.45 : 1,
  }));

  return <Animated.View style={[s.bar, aStyle]} />;
}

export default function WaveformVisualizer({ mode }: { mode: WaveformMode }) {
  return (
    <View style={s.container}>
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <Bar key={i} index={i} mode={mode} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: MAX_H + 24,
    gap: BAR_GAP,
    paddingHorizontal: 20,
  },
  bar: {
    width: BAR_W,
    borderRadius: BAR_W,
    minHeight: MIN_H,
  },
});
