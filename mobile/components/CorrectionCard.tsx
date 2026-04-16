import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { C, FONT, RADIUS } from '../constants/colors';

export type CorrectionCardData = {
  id: string;
  error_type: string;
  original: string;
  corrected: string;
  explanation: string;
  better_version: string;
};

interface Props {
  card: CorrectionCardData;
  index: number;
  onDismiss: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  TENSE:       C.warning,
  ARTICLE:     C.blue400,
  PREPOSITION: '#A78BFA',  // violet
  FILLER:      '#F472B6',  // pink
  COHERENCE:   C.error,
  VOCAB:       C.cyan,
};

const AUTO_DISMISS = 6000;

export default function CorrectionCard({ card, index, onDismiss }: Props) {
  const ty = useSharedValue(120);
  const op = useSharedValue(0);
  const swipe = useSharedValue(0);

  useEffect(() => {
    ty.value = withSpring(0, { damping: 20, stiffness: 200 });
    op.value = withTiming(1, { duration: 200 });
    const t = setTimeout(dismiss, AUTO_DISMISS);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    ty.value = withTiming(140, { duration: 220 });
    op.value = withTiming(0, { duration: 180 }, (done) => {
      if (done) runOnJS(onDismiss)();
    });
  };

  const gesture = Gesture.Pan()
    .onUpdate((e) => { if (e.translationY > 0) swipe.value = e.translationY; })
    .onEnd((e) => {
      if (e.translationY > 44) runOnJS(dismiss)();
      else swipe.value = withSpring(0);
    });

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value + swipe.value }],
    opacity: op.value,
    marginBottom: index === 0 ? 8 : 0,
  }));

  const accent = TYPE_COLORS[card.error_type] ?? C.textSub;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[s.card, aStyle]}>
        {/* Left accent strip */}
        <View style={[s.strip, { backgroundColor: accent }]} />

        <View style={s.body}>
          {/* Badge + type */}
          <View style={s.topRow}>
            <View style={[s.badge, { borderColor: accent + '55', backgroundColor: accent + '18' }]}>
              <Text style={[s.badgeText, { color: accent }]}>{card.error_type}</Text>
            </View>
            <View style={s.handleBar} />
          </View>

          {/* Original → Corrected */}
          <View style={s.corrRow}>
            <Text style={s.original} numberOfLines={1}>{card.original}</Text>
            <Text style={s.arrow}>→</Text>
            <Text style={s.corrected} numberOfLines={1}>{card.corrected}</Text>
          </View>

          {/* Better version */}
          {card.better_version ? (
            <Text style={s.better} numberOfLines={2}>
              <Text style={s.betterLabel}>Better: </Text>
              {card.better_version}
            </Text>
          ) : null}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: C.surface2,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: C.border,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  strip: { width: 3 },
  body: { flex: 1, padding: 14 },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  badge: {
    paddingHorizontal: 9, paddingVertical: 3,
    borderRadius: RADIUS.sm, borderWidth: 1,
  },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  handleBar: { width: 28, height: 3, backgroundColor: C.border, borderRadius: 2 },

  corrRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  original: {
    flex: 1, fontSize: FONT.sm, color: C.error,
    textDecorationLine: 'line-through', flexShrink: 1,
  },
  arrow: { fontSize: FONT.sm, color: C.textDim },
  corrected: {
    flex: 1, fontSize: FONT.sm, color: C.success,
    fontWeight: '600', flexShrink: 1,
  },
  better: { fontSize: FONT.xs, color: C.textSub, lineHeight: 17 },
  betterLabel: { color: C.textDim, fontStyle: 'italic' },
});
