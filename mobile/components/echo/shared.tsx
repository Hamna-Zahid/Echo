import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  Animated, Easing, PanResponder, ViewStyle, TextStyle,
  Platform, ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { T, Fonts, Radius, Shadow } from '../../constants/tokens';
import { FlagUS, FlagUK, FlameIcon, EchoLogoMark, IconHome, IconMic, IconChart } from './icons';

// ── EchoLogo ──────────────────────────────────────────────────
export function EchoLogo({ size = 32 }: { size?: number }) {
  const boxSize = Math.round(size);
  const br = Math.round(boxSize * 0.34);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
      <View style={{
        width: boxSize, height: boxSize, borderRadius: br,
        backgroundColor: T.rose600,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: T.rose600, shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.32, shadowRadius: 12, elevation: 6,
      }}>
        <EchoLogoMark size={boxSize} />
      </View>
      <Text style={{ fontFamily: Fonts.extrabold, fontSize: Math.round(boxSize * 0.72), color: T.charcoal, letterSpacing: -0.7 }}>
        Echo
      </Text>
    </View>
  );
}

// ── EchoButton ────────────────────────────────────────────────
export function EchoButton({
  label, variant = 'primary', onPress, disabled = false, style,
}: {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => Animated.spring(scale, { toValue: 0.965, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start();

  const variants = {
    primary:   { bg: disabled ? T.rose100 : T.rose600, color: disabled ? T.rose400 : '#fff', border: 0, borderColor: 'transparent', ...(!disabled && Shadow.button) },
    secondary: { bg: '#fff', color: T.rose600, border: 1.5, borderColor: T.rose200 },
    outline:   { bg: 'transparent', color: T.rose600, border: 1.5, borderColor: T.rose600 },
    ghost:     { bg: 'transparent', color: T.rose600, border: 0, borderColor: 'transparent' },
  };
  const v = variants[variant] || variants.primary;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPressIn={pressIn} onPressOut={pressOut}
        onPress={onPress} disabled={disabled} activeOpacity={1}
        style={[styles.btn, {
          backgroundColor: v.bg,
          borderWidth: v.border,
          borderColor: v.borderColor,
          shadowColor: (v as any).shadowColor,
          shadowOffset: (v as any).shadowOffset,
          shadowOpacity: (v as any).shadowOpacity,
          shadowRadius: (v as any).shadowRadius,
          elevation: (v as any).elevation,
        }]}>
        <Text style={[styles.btnText, { color: v.color }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── EchoInput ─────────────────────────────────────────────────
export function EchoInput({
  placeholder, value, onChangeText, secureTextEntry = false,
  autoCapitalize = 'none', keyboardType, rightIcon,
}: {
  placeholder?: string;
  value?: string;
  onChangeText?: (t: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric';
  rightIcon?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ position: 'relative' }}>
      <TextInput
        placeholder={placeholder} value={value} onChangeText={onChangeText}
        secureTextEntry={secureTextEntry} autoCapitalize={autoCapitalize}
        keyboardType={keyboardType} placeholderTextColor={T.muted}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={[styles.input, {
          borderColor: focused ? T.rose600 : T.borderStrong,
          backgroundColor: focused ? T.rose50 : '#fff',
        }]}
      />
      {rightIcon && <View style={styles.inputRight}>{rightIcon}</View>}
    </View>
  );
}

// ── EchoChip ──────────────────────────────────────────────────
export function EchoChip({
  label, active = false, onPress, size = 'md', color,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  size?: 'md' | 'sm';
  color?: string;
}) {
  const activeBg = color || T.rose600;
  return (
    <TouchableOpacity
      onPress={onPress} activeOpacity={0.75}
      style={[styles.chip, size === 'sm' && styles.chipSm, { backgroundColor: active ? activeBg : T.rose100 }]}>
      <Text style={[styles.chipText, size === 'sm' && styles.chipTextSm, { color: active ? '#fff' : T.rose400 }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── ScoreChip ─────────────────────────────────────────────────
export function ScoreChip({ score, label }: { score: string | number; label?: string }) {
  const n = parseFloat(String(score));
  const [bg, color] = isNaN(n) ? [T.rose100, T.rose600]
    : n >= 7 ? ['#D1FAE5', '#065F46']
    : n >= 5.5 ? ['#FEF3C7', '#92400E']
    : [T.rose100, T.rose600];
  return (
    <View style={[styles.scoreChip, { backgroundColor: bg }]}>
      {label ? <Text style={[styles.scoreLabel, { color }]}>{label}</Text> : null}
      <Text style={[styles.scoreValue, { color }]}>{score}</Text>
    </View>
  );
}

// ── AccentChip ────────────────────────────────────────────────
export function AccentChip({
  accent = 'American', onPress, small = false,
}: {
  accent?: 'American' | 'British';
  onPress?: () => void;
  small?: boolean;
}) {
  const isUs = accent === 'American';
  const h = small ? 24 : 30;
  const bgColor = isUs ? '#E0F2FE' : '#EEF2FF';
  const textColor = isUs ? '#0369A1' : '#4338CA';
  const Flag = isUs ? FlagUS : FlagUK;

  const inner = (
    <View style={[styles.accentChip, { height: h, backgroundColor: bgColor, paddingHorizontal: small ? 8 : 10, gap: 6 }]}>
      <View style={{ borderRadius: 2, overflow: 'hidden', borderWidth: 1, borderColor: isUs ? '#0369A133' : '#4338CA33' }}>
        <Flag size={small ? 14 : 16} />
      </View>
      {!small && <Text style={[styles.accentText, { color: textColor }]}>{isUs ? 'American' : 'British'}</Text>}
    </View>
  );

  if (onPress) return <TouchableOpacity onPress={onPress} activeOpacity={0.75}>{inner}</TouchableOpacity>;
  return inner;
}

// ── StreakChip ────────────────────────────────────────────────
export function StreakChip({ count }: { count?: number }) {
  if (!count) return null;
  return (
    <View style={styles.streakChip}>
      <FlameIcon size={12} />
      <Text style={styles.streakText}>{count} day streak</Text>
    </View>
  );
}

// ── GoogleIcon ────────────────────────────────────────────────
function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
  );
}

// ── GoogleSignInButton ────────────────────────────────────────
export function GoogleSignInButton({
  onPress, loading = false,
}: {
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.75}
      style={gStyles.btn}
    >
      {loading ? (
        <ActivityIndicator size="small" color={T.charcoal} />
      ) : (
        <>
          <GoogleIcon size={18} />
          <Text style={gStyles.text}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// ── MicroLabel ────────────────────────────────────────────────
export function MicroLabel({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.microLabel, style]}>{children}</Text>;
}

// ── SectionHeader ─────────────────────────────────────────────
export function SectionHeader({
  title, action, onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ── StatusPill ────────────────────────────────────────────────
export type SessionState = 'idle' | 'listening' | 'processing' | 'speaking' | 'connecting';

export function StatusPill({ state }: { state: SessionState }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    if (state !== 'idle' && state !== 'connecting') loop.start();
    else { loop.stop(); pulseAnim.setValue(1); }
    return () => loop.stop();
  }, [state]);

  const cfgs: Record<string, { dot: string; text: string; textColor: string; bg: string; border: string; italic: boolean }> = {
    connecting:  { dot: T.muted,     text: 'Connecting…',    textColor: T.muted,     bg: '#fff',    border: T.borderStrong, italic: true  },
    idle:        { dot: T.muted,     text: 'Ready',          textColor: T.slate,     bg: '#fff',    border: T.borderStrong, italic: false },
    listening:   { dot: T.success,   text: 'Listening',      textColor: T.charcoal,  bg: '#fff',    border: '#D1FAE5',      italic: false },
    processing:  { dot: T.rose500,   text: 'Thinking…',      textColor: T.slate,     bg: '#fff',    border: T.rose200,      italic: true  },
    speaking:    { dot: T.rose600,   text: 'Echo speaking',  textColor: T.rose600,   bg: T.rose50,  border: T.rose200,      italic: false },
  };
  const cfg = cfgs[state] || cfgs.idle;

  return (
    <View style={[styles.pill, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Animated.View style={[styles.pillDot, { backgroundColor: cfg.dot, opacity: (state !== 'idle' && state !== 'connecting') ? pulseAnim : 1 }]} />
      <Text style={[styles.pillText, { color: cfg.textColor, fontStyle: cfg.italic ? 'italic' : 'normal' }]}>
        {cfg.text}
      </Text>
    </View>
  );
}

// ── Waveform ──────────────────────────────────────────────────
const BAR_COUNT = 28;
const WAVEFORM_HEIGHT = 72;

export function Waveform({ state }: { state: SessionState }) {
  const [bars, setBars] = useState<number[]>(() => Array(BAR_COUNT).fill(5));
  const phaseRef = useRef(0);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const center = BAR_COUNT / 2;

    animRef.current = setInterval(() => {
      const speed = state === 'listening' ? 0.19 : state === 'speaking' ? 0.11 : 0.018;
      phaseRef.current += speed;
      const p = phaseRef.current;

      setBars(Array.from({ length: BAR_COUNT }, (_, i) => {
        const dist = Math.abs(i - center) / center;
        if (state === 'idle' || state === 'connecting') return 5 + Math.sin(p + i * 0.4) * 3.5;
        if (state === 'listening') {
          const a = Math.abs(Math.sin(p * 1.7 + i * 0.85));
          const b = Math.abs(Math.sin(p * 2.9 + i * 1.5)) * 0.35;
          return 8 + (a + b) * 36;
        }
        if (state === 'processing') {
          const wave = Math.sin(p * 1.3 - i * 0.52);
          return 6 + Math.max(0, wave) * 22;
        }
        if (state === 'speaking') {
          const env = Math.pow(1 - dist, 1.5);
          return 8 + Math.abs(Math.sin(p + i * 0.33)) * 50 * env + Math.abs(Math.sin(p * 1.8 + i * 0.62)) * 6;
        }
        return 5;
      }));
    }, 33); // ~30fps

    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [state]);

  const getColor = (i: number) => {
    const dist = Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2);
    if (state === 'idle' || state === 'connecting') return '#E2D1DA';
    if (state === 'listening') return dist < 0.25 ? T.charcoal : T.slate;
    if (state === 'processing') return dist < 0.35 ? T.rose400 : T.rose200;
    if (state === 'speaking') {
      if (dist < 0.18) return T.rose500;
      if (dist < 0.45) return T.rose400;
      return T.rose200;
    }
    return '#E2D1DA';
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, height: WAVEFORM_HEIGHT }}>
      {bars.map((h, i) => (
        <View
          key={i}
          style={{
            width: 2.5,
            borderRadius: 999,
            height: Math.max(3, Math.min(WAVEFORM_HEIGHT - 4, h)),
            backgroundColor: getColor(i),
          }}
        />
      ))}
    </View>
  );
}

// ── CorrectionCard ────────────────────────────────────────────
export type CorrectionData = {
  id: string;
  type: string;
  original: string;
  corrected: string;
  explanation: string;
  full?: string;
};

export function CorrectionCard({
  correction, onDismiss,
}: {
  correction: CorrectionData;
  onDismiss: () => void;
}) {
  const ERROR_TYPES: Record<string, { color: string; bg: string; label: string }> = {
    TENSE:       { color: '#F59E0B', bg: '#FEF3C7', label: 'Tense' },
    ARTICLE:     { color: '#0EA5E9', bg: '#E0F2FE', label: 'Article' },
    PREPOSITION: { color: '#8B5CF6', bg: '#EDE9FE', label: 'Preposition' },
    COLLOCATION: { color: '#F43F8E', bg: '#FCE7F3', label: 'Collocation' },
    AGREEMENT:   { color: '#F97316', bg: '#FEF0E6', label: 'Agreement' },
    VOCAB:       { color: '#6366F1', bg: '#EEF2FF', label: 'Vocabulary' },
    FILLER:      { color: '#0D9488', bg: '#F0FDFA', label: 'Filler word' },
  };
  const cfg = ERROR_TYPES[correction.type] || { color: T.rose600, bg: T.rose50, label: correction.type };

  const translateY = useRef(new Animated.Value(300)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const [prog, setProgState] = useState(1);

  useEffect(() => {
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
  }, []);

  // 6-second drain timer
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const p = 1 - (Date.now() - start) / 6000;
      if (p <= 0) { clearInterval(interval); onDismiss(); }
      else setProgState(p);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) dragY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 64) {
          Animated.timing(dragY, { toValue: 300, useNativeDriver: true, duration: 220 }).start(onDismiss);
        } else {
          Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={[styles.cardWrapper, { transform: [{ translateY: Animated.add(translateY, dragY) }] }]}
      {...panResponder.panHandlers}>
      {/* Left color strip */}
      <View style={[styles.cardStrip, { backgroundColor: cfg.color }]} />
      {/* Drag handle */}
      <View style={styles.cardHandle}>
        <View style={styles.handleBar} />
      </View>
      <View style={styles.cardBody}>
        {/* Badge + close */}
        <View style={styles.cardTop}>
          <View style={[styles.cardBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.cardBadgeText, { color: cfg.color }]}>{correction.type}</Text>
          </View>
          <TouchableOpacity onPress={onDismiss} style={styles.cardClose}>
            <Text style={styles.cardCloseText}>×</Text>
          </TouchableOpacity>
        </View>
        {/* Original → Corrected */}
        <View style={styles.cardDiff}>
          <Text style={[styles.cardOriginal]}>{correction.original}</Text>
          <Text style={styles.cardArrow}>→</Text>
          <Text style={styles.cardCorrected}>{correction.corrected}</Text>
        </View>
        <Text style={styles.cardExplanation}>{correction.explanation}</Text>
        {/* Native version */}
        {correction.full ? (
          <View style={[styles.cardNative, { borderLeftColor: T.rose400 }]}>
            <MicroLabel style={{ color: T.rose400, marginBottom: 5 }}>Native version</MicroLabel>
            <Text style={styles.cardNativeText}>"{correction.full}"</Text>
          </View>
        ) : null}
      </View>
      {/* Timer drain bar */}
      <View style={styles.timerTrack}>
        <View style={[styles.timerFill, { width: `${prog * 100}%` as any, backgroundColor: T.rose600 }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Button
  btn: { height: 56, borderRadius: Radius.button, alignItems: 'center', justifyContent: 'center', width: '100%' },
  btnText: { fontFamily: Fonts.bold, fontSize: 15, letterSpacing: -0.2 },

  // Input
  input: { height: 56, borderRadius: Radius.input, borderWidth: 1.5, paddingHorizontal: 16, fontSize: 15, fontFamily: Fonts.regular, color: T.charcoal },
  inputRight: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },

  // Chip
  chip: { height: 34, paddingHorizontal: 14, borderRadius: Radius.chip, alignItems: 'center', justifyContent: 'center' },
  chipSm: { height: 28, paddingHorizontal: 10 },
  chipText: { fontFamily: Fonts.semibold, fontSize: 13, letterSpacing: 0.1 },
  chipTextSm: { fontSize: 12 },

  // ScoreChip
  scoreChip: { height: 28, paddingHorizontal: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreLabel: { fontFamily: Fonts.semibold, fontSize: 10, opacity: 0.65 },
  scoreValue: { fontFamily: Fonts.bold, fontSize: 13 },

  // AccentChip
  accentChip: { borderRadius: Radius.chip, flexDirection: 'row', alignItems: 'center' },
  accentText: { fontFamily: Fonts.bold, fontSize: 12, letterSpacing: 0.3 },

  // StreakChip
  streakChip: { height: 30, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#FEF3C7', flexDirection: 'row', alignItems: 'center', gap: 5 },
  streakText: { fontFamily: Fonts.semibold, fontSize: 13, color: '#92400E' },

  // MicroLabel
  microLabel: { fontFamily: Fonts.bold, fontSize: 10, color: T.muted, letterSpacing: 1.2, textTransform: 'uppercase' },

  // SectionHeader
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 17, color: T.charcoal, letterSpacing: -0.4 },
  sectionAction: { fontFamily: Fonts.semibold, fontSize: 13, color: T.rose600, letterSpacing: -0.1 },

  // StatusPill
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 38, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  pillDot: { width: 7, height: 7, borderRadius: 999 },
  pillText: { fontFamily: Fonts.semibold, fontSize: 14, letterSpacing: -0.1 },

  // CorrectionCard
  cardWrapper: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20,
    overflow: 'hidden',
  },
  cardStrip: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  cardHandle: { alignItems: 'center', paddingTop: 12, paddingBottom: 6 },
  handleBar: { width: 34, height: 4, borderRadius: 999, backgroundColor: T.rose200 },
  cardBody: { paddingHorizontal: 24, paddingBottom: 20, paddingLeft: 28 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cardBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6 },
  cardBadgeText: { fontFamily: Fonts.bold, fontSize: 10, letterSpacing: 0.9, textTransform: 'uppercase' },
  cardClose: { width: 26, height: 26, borderRadius: 999, backgroundColor: T.bgSubtle, alignItems: 'center', justifyContent: 'center' },
  cardCloseText: { fontSize: 18, color: T.muted, lineHeight: 22 },
  cardDiff: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardOriginal: { fontFamily: Fonts.regular, fontSize: 15, color: T.charcoal, textDecorationLine: 'line-through', textDecorationColor: '#EF4444' },
  cardArrow: { fontSize: 13, color: T.muted },
  cardCorrected: { fontFamily: Fonts.bold, fontSize: 15, color: T.charcoal },
  cardExplanation: { fontFamily: Fonts.regular, fontSize: 13, color: T.muted, marginBottom: 12, letterSpacing: -0.1 },
  cardNative: { backgroundColor: T.rose50, borderLeftWidth: 3, borderRadius: 1, borderTopRightRadius: 10, borderBottomRightRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  cardNativeText: { fontFamily: Fonts.regular, fontSize: 13, color: T.slate, fontStyle: 'italic', lineHeight: 20 },
  timerTrack: { height: 3, backgroundColor: T.rose100 },
  timerFill: { height: '100%', borderRadius: 999 },
});

// Google button styles (separate sheet to avoid polluting the main one)
const gStyles = StyleSheet.create({
  btn: {
    height: 56, borderRadius: Radius.button,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  text: { fontFamily: Fonts.semibold, fontSize: 15, color: T.charcoal, letterSpacing: -0.2 },
});

// ── BottomTabBar ──────────────────────────────────────────────
export type BottomTab = 'home' | 'session' | 'progress';

export function BottomTabBar({ active }: { active: BottomTab }) {
  const insets = useSafeAreaInsets();
  const tabs: { id: BottomTab; label: string }[] = [
    { id: 'home',     label: 'Home' },
    { id: 'session',  label: 'Session' },
    { id: 'progress', label: 'Progress' },
  ];

  const onPress = (id: BottomTab) => {
    if (id === 'home') {
      router.replace('/(app)');
    } else if (id === 'session') {
      // Default to IELTS Training when launching from the FAB
      router.push({
        pathname: '/(app)/pre-session',
        params: { modeId: 'IELTS Training', mode: 'training' },
      } as any);
    } else if (id === 'progress') {
      router.push('/(app)/history');
    }
  };

  return (
    <View style={[bt.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {tabs.map((tab) => {
        const isCenter = tab.id === 'session';
        const isActive = active === tab.id;
        const c = isActive ? T.rose600 : T.muted;

        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onPress(tab.id)}
            activeOpacity={0.75}
            style={[bt.tab, isCenter && bt.tabCenter]}
          >
            {isCenter ? (
              <View style={bt.fab}>
                <IconMic color="#fff" size={22} />
              </View>
            ) : tab.id === 'home' ? (
              <IconHome color={c} size={22} />
            ) : (
              <IconChart color={c} size={22} />
            )}
            {!isCenter && (
              <Text style={[bt.label, { color: c }]}>{tab.label}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const bt = StyleSheet.create({
  bar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: T.borderStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 8,
  },
  tabCenter: {
    marginTop: -20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: T.rose600,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: T.rose600,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation: 8,
    // White ring
    borderWidth: 3,
    borderColor: '#fff',
  },
  label: {
    fontFamily: Fonts.semibold,
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
