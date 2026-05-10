import { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  Animated, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { T, Fonts, Spacing, Shadow } from '../../constants/tokens';
import { EchoButton, EchoLogo } from '../../components/echo/shared';
import { IconChart, IconMic, IconCheck } from '../../components/echo/icons';

// ── Slide 0 — Band 7 target ──────────────────────────────────
function Slide0() {
  const stats = [
    { icon: <IconChart color={T.rose600} size={18} />, label: 'Track your band' },
    { icon: <IconMic   color={T.rose600} size={18} />, label: 'Speak every day' },
    { icon: <IconCheck color={T.success} size={16} />, label: 'Errors corrected' },
  ];
  return (
    <View style={sl.root}>
      <Text style={sl.giant}>7</Text>
      <Text style={sl.h1}>Your target is{'\n'}Band 7.</Text>
      <Text style={sl.body}>
        Most learners plateau at 5.5 because they never get live feedback on how they actually speak. Echo fixes that.
      </Text>
      <View style={sl.statsRow}>
        {stats.map(({ icon, label }) => (
          <View key={label} style={sl.statCard}>
            <View style={sl.statIconBox}>{icon}</View>
            <Text style={sl.statLabel}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Slide 1 — How Echo works ─────────────────────────────────
function Slide1() {
  const steps = [
    { n: '01', title: 'Echo opens the conversation', desc: 'The AI always starts and drives — you just respond naturally.', color: T.rose600 },
    { n: '02', title: 'Errors surface silently', desc: 'Grammar correction cards appear without ever interrupting your flow.', color: '#0EA5E9' },
    { n: '03', title: 'Your IELTS band updates', desc: 'Every session recalibrates your score estimate in real-time.', color: T.success },
  ];
  return (
    <View style={sl.root}>
      <Text style={sl.h1}>How Echo works.</Text>
      <Text style={sl.sub}>The AI leads every session. Your job is to respond.</Text>
      <View style={{ gap: 10, marginTop: 4 }}>
        {steps.map((s, i) => (
          <View key={s.n} style={sl.stepCard}>
            <View style={[sl.stepNum, { backgroundColor: s.color }]}>
              <Text style={sl.stepNumText}>{s.n}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={sl.stepTitle}>{s.title}</Text>
              <Text style={sl.stepDesc}>{s.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Slide 2 — Real results ───────────────────────────────────
function Slide2() {
  const users = [
    { name: 'Ahmad R.',  origin: 'Lahore, PK',  result: '5.0 → 7.5', time: '3 months', quote: '"I finally sound confident in client meetings."' },
    { name: 'Priya S.', origin: 'Mumbai, IN',  result: '5.5 → 7.0', time: '2 months', quote: '"The correction cards changed how I speak entirely."' },
    { name: 'Fatima K.', origin: 'Dhaka, BD',   result: '6.0 → 7.5', time: '6 weeks',  quote: '"Echo is like having a private coach 24/7."' },
  ];
  return (
    <View style={sl.root}>
      <Text style={sl.h1}>Real results.</Text>
      <Text style={sl.sub}>From professionals who committed to daily practice.</Text>
      <View style={{ gap: 10, marginTop: 4 }}>
        {users.map((u, i) => (
          <View key={u.name} style={sl.testimonialCard}>
            <View style={sl.testimonialHeader}>
              <View style={sl.avatar}>
                <Text style={sl.avatarText}>{u.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={sl.testimonialName}>{u.name}</Text>
                <Text style={sl.testimonialMeta}>{u.origin} · {u.time}</Text>
              </View>
              <Text style={sl.testimonialResult}>{u.result}</Text>
            </View>
            <Text style={sl.testimonialQuote}>{u.quote}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const SLIDES = [Slide0, Slide1, Slide2];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [slide, setSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const advance = (to: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setSlide(to), 120);
  };

  const finish = async (dest: 'login' | 'register') => {
    await AsyncStorage.setItem('echo_onboarding_done', '1');
    router.replace(`/(auth)/${dest}`);
  };

  const SlideContent = SLIDES[slide];

  return (
    <View style={s.root}>
      {/* Persistent logo — always visible across all slides */}
      <View style={[s.logoBar, { paddingTop: insets.top + 12 }]}>
        <EchoLogo size={26} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          <SlideContent key={slide} />
        </Animated.View>
      </ScrollView>

      {/* Page dots */}
      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[s.dot, { width: i === slide ? 22 : 7, backgroundColor: i === slide ? T.rose600 : T.rose100 }]}
          />
        ))}
      </View>

      {/* CTAs */}
      <View style={s.footer}>
        {slide < SLIDES.length - 1 ? (
          <EchoButton label="Continue" onPress={() => advance(slide + 1)} />
        ) : (
          <View style={{ gap: 10 }}>
            <EchoButton label="Create free account" onPress={() => finish('register')} />
            <View style={s.signInRow}>
              <Text style={s.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => finish('login')}>
                <Text style={s.signInLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Shared slide styles ──────────────────────────────────────
const sl = StyleSheet.create({
  root:     { paddingHorizontal: Spacing.screenH, paddingTop: 32, paddingBottom: 8 },
  giant:    { fontFamily: Fonts.extrabold, fontSize: 108, color: T.rose600, lineHeight: 96, letterSpacing: -6, marginBottom: 26, opacity: 0.9 },
  h1:       { fontFamily: Fonts.bold, fontSize: 30, color: T.charcoal, letterSpacing: -0.6, lineHeight: 36, marginBottom: 14 },
  sub:      { fontFamily: Fonts.regular, fontSize: 14, color: T.muted, marginBottom: 22, lineHeight: 20 },
  body:     { fontFamily: Fonts.regular, fontSize: 15, color: T.slate, lineHeight: 24, marginBottom: 28 },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: T.bgSubtle, borderWidth: 1, borderColor: T.border, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center', gap: 8 },
  statIconBox: { width: 36, height: 36, borderRadius: 999, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...Shadow.card },
  statLabel:   { fontFamily: Fonts.semibold, fontSize: 11, color: T.slate, textAlign: 'center', lineHeight: 15 },

  stepCard:     { backgroundColor: T.bg, borderWidth: 1, borderColor: T.borderStrong, borderRadius: 18, padding: 16, paddingHorizontal: 18, flexDirection: 'row', gap: 14, ...Shadow.card },
  stepNum:      { width: 32, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumText:  { fontFamily: Fonts.bold, fontSize: 11, color: '#fff', letterSpacing: 0.2 },
  stepTitle:    { fontFamily: Fonts.semibold, fontSize: 15, color: T.charcoal, letterSpacing: -0.2, marginBottom: 3 },
  stepDesc:     { fontFamily: Fonts.regular, fontSize: 13, color: T.muted, lineHeight: 19 },

  testimonialCard:   { backgroundColor: T.bg, borderWidth: 1, borderColor: T.borderStrong, borderRadius: 18, padding: 14, paddingHorizontal: 16, ...Shadow.card },
  testimonialHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 9 },
  avatar:            { width: 36, height: 36, borderRadius: 999, backgroundColor: T.rose100, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText:        { fontFamily: Fonts.bold, fontSize: 14, color: T.rose600 },
  testimonialName:   { fontFamily: Fonts.semibold, fontSize: 14, color: T.charcoal, letterSpacing: -0.2 },
  testimonialMeta:   { fontFamily: Fonts.regular, fontSize: 11, color: T.muted },
  testimonialResult: { fontFamily: Fonts.bold, fontSize: 15, color: T.rose600, letterSpacing: -0.3 },
  testimonialQuote:  { fontFamily: Fonts.regular, fontSize: 13, color: T.slate, fontStyle: 'italic', lineHeight: 19 },
});

// ── Screen styles ────────────────────────────────────────────
const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: T.bg },
  logoBar:       { paddingHorizontal: Spacing.screenH, paddingBottom: 12 },
  scrollContent: { flexGrow: 1 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 7, paddingVertical: 20 },
  dot:  { height: 7, borderRadius: 999 },

  footer:     { paddingHorizontal: Spacing.screenH, paddingBottom: Platform.OS === 'ios' ? 36 : 28 },
  signInRow:  { flexDirection: 'row', justifyContent: 'center', paddingTop: 2 },
  signInText: { fontFamily: Fonts.regular, fontSize: 14, color: T.muted },
  signInLink: { fontFamily: Fonts.semibold, fontSize: 14, color: T.rose600 },
});
