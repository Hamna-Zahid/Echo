import { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { T, Fonts, Spacing, Shadow } from '../../constants/tokens';
import { EchoButton, MicroLabel, SectionHeader } from '../../components/echo/shared';
import { IconChevronLeft, IconCheck, IconArrow } from '../../components/echo/icons';
import { LinearGradient } from 'expo-linear-gradient';

type DiagResult = {
  cefr_level?: string;
  ielts_equivalent?: number | string;
  fluency?: number;
  lexical?: number;
  grammar?: number;
  pronunciation?: number;
  strengths?: string[];
  weaknesses?: string[];
  learning_plan?: string;
  focus_area?: string;
};

const WEEKS_TO_BAND7: Record<string, number> = {
  A1: 52, A2: 36, B1: 20, B2: 12, C1: 6, C2: 3,
};

const CEFR_SUBTITLE: Record<string, string> = {
  A1: 'Beginner', A2: 'Elementary', B1: 'Pre-intermediate',
  B2: 'Upper Intermediate', C1: 'Advanced', C2: 'Mastery',
};

export default function DiagnosticResultsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    cefr_level?: string; ielts_equivalent?: string;
    fluency?: string; lexical?: string;
    grammar?: string; pronunciation?: string;
    strengths?: string; weaknesses?: string;
    learning_plan?: string; focus_area?: string;
  }>();

  const result: DiagResult = {
    cefr_level:      params.cefr_level,
    ielts_equivalent: params.ielts_equivalent ? parseFloat(params.ielts_equivalent) : undefined,
    fluency:          params.fluency     ? parseFloat(params.fluency)     : undefined,
    lexical:          params.lexical     ? parseFloat(params.lexical)     : undefined,
    grammar:          params.grammar     ? parseFloat(params.grammar)     : undefined,
    pronunciation:    params.pronunciation ? parseFloat(params.pronunciation) : undefined,
    strengths:        params.strengths   ? JSON.parse(params.strengths)   : [],
    weaknesses:       params.weaknesses  ? JSON.parse(params.weaknesses)  : [],
    learning_plan:    params.learning_plan,
    focus_area:       params.focus_area,
  };

  const [barsIn, setBarsIn] = useState(false);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => setBarsIn(true), 350);
    return () => clearTimeout(t);
  }, []);

  const cefr     = result.cefr_level  || '—';
  const ielts    = result.ielts_equivalent;
  const subtitle = CEFR_SUBTITLE[cefr] ?? '';
  const weeks    = WEEKS_TO_BAND7[cefr] || 12;
  const ieltsStr = ielts ? (typeof ielts === 'number' ? ielts.toFixed(1) : String(ielts)) : '—';

  const criteria = [
    { name: 'Fluency & Coherence', score: result.fluency },
    { name: 'Lexical Resource',    score: result.lexical },
    { name: 'Grammar Range',       score: result.grammar },
    { name: 'Pronunciation',       score: result.pronunciation },
  ].filter(c => c.score != null) as { name: string; score: number }[];

  const strengths  = result.strengths  || [];
  const weaknesses = result.weaknesses || [];
  const focusArea  = result.focus_area;

  return (
    <ScrollView style={s.root} contentContainerStyle={[s.content, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.replace('/(app)')} style={s.backBtn}>
          <IconChevronLeft color={T.charcoal} size={16} />
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Your Assessment.</Text>
          <Text style={s.headerSub}>Based on your diagnostic session</Text>
        </View>
      </View>

      <Animated.View style={[{ gap: 18 }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* Band card */}
        <LinearGradient
          colors={['#D81B60', '#E11D74', '#C2185B']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.bandCard}>
          <View style={s.bandCircle} />
          <View style={s.bandCardInner}>
            <View>
              <MicroLabel style={s.bandMicro}>IELTS Band</MicroLabel>
              <Text style={s.bandIELTS}>{ieltsStr}</Text>
              {subtitle ? <Text style={s.bandSubtext}>{subtitle}</Text> : null}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <MicroLabel style={s.bandMicro}>CEFR</MicroLabel>
              <Text style={s.bandCEFR}>{cefr}</Text>
            </View>
          </View>
          <View style={s.bandDivider} />
          <Text style={s.bandPath}>
            Estimated path to Band 7:{' '}
            <Text style={s.bandWeeks}>{weeks} weeks</Text>
            {' '}at your current pace
          </Text>
        </LinearGradient>

        {/* Score breakdown */}
        {criteria.length > 0 && (
          <View style={s.card}>
            <SectionHeader title="Score Breakdown" />
            <View style={{ gap: 14, marginTop: 16 }}>
              {criteria.map((c, i) => {
                const clr = c.score >= 7 ? T.success : c.score >= 5.5 ? T.warning : T.rose600;
                const pct = `${Math.min((c.score / 9) * 100, 100)}%`;
                return (
                  <View key={c.name}>
                    <View style={s.criteriaRow}>
                      <Text style={s.criteriaName}>{c.name}</Text>
                      <Text style={[s.criteriaScore, { color: clr }]}>{c.score.toFixed(1)}</Text>
                    </View>
                    <View style={s.trackBg}>
                      <View
                        style={[
                          s.trackFill,
                          {
                            backgroundColor: clr,
                            width: (barsIn ? pct : '0%') as any,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Strengths / Improve grid — only shown when AI returned data */}
        {(strengths.length > 0 || weaknesses.length > 0) && (
          <View style={s.gridRow}>
            {strengths.length > 0 && (
              <View style={[s.gridCell, { backgroundColor: '#F0FDF4' }]}>
                <Text style={[s.gridTitle, { color: T.success }]}>Strengths</Text>
                {strengths.map((item: string) => (
                  <View key={item} style={s.gridItem}>
                    <IconCheck color={T.success} size={13} />
                    <Text style={s.gridItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
            {weaknesses.length > 0 && (
              <View style={[s.gridCell, { backgroundColor: T.rose50 }]}>
                <Text style={[s.gridTitle, { color: T.rose500 }]}>Improve</Text>
                {weaknesses.map((item: string) => (
                  <View key={item} style={s.gridItem}>
                    <IconArrow color={T.rose500} size={13} />
                    <Text style={s.gridItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Learning plan — only shown when AI returned data */}
        {(result.learning_plan || focusArea) && (
          <View style={s.planBox}>
            <MicroLabel style={{ color: T.rose400, marginBottom: 10 }}>Your Learning Plan</MicroLabel>
            <Text style={s.planBody}>
              {result.learning_plan ||
                `You've completed your diagnostic assessment. Focus on ${focusArea} in your next 3 sessions — it's the fastest path to Band 7.`}
            </Text>
            {focusArea && (
              <View style={s.planChip}>
                <Text style={s.planChipText}>Next focus: {focusArea}</Text>
              </View>
            )}
          </View>
        )}

        {/* CTA */}
        <EchoButton
          label="Start training session"
          onPress={() => router.replace('/(app)')}
        />

        <View style={{ height: 12 }} />
      </Animated.View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bg },
  content: {
    paddingHorizontal: Spacing.screenH,
  },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 22,
    paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: T.border,
    marginHorizontal: -Spacing.screenH,
    paddingHorizontal: Spacing.screenH,
    backgroundColor: T.bg,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: T.bgSubtle, borderWidth: 1, borderColor: T.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 17, color: T.charcoal, letterSpacing: -0.4 },
  headerSub:   { fontFamily: Fonts.regular, fontSize: 12, color: T.muted, marginTop: 1 },

  // Band card
  bandCard: {
    borderRadius: 22, padding: 22, paddingHorizontal: 24,
    overflow: 'hidden', position: 'relative',
    ...Shadow.button,
  },
  bandCircle: {
    position: 'absolute', right: -24, top: -24,
    width: 110, height: 110, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  bandCardInner: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', position: 'relative',
  },
  bandMicro:   { color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
  bandIELTS:   { fontFamily: Fonts.extrabold, fontSize: 70, color: '#fff', lineHeight: 64, letterSpacing: -3 },
  bandSubtext: { fontFamily: Fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 8 },
  bandCEFR:    { fontFamily: Fonts.extrabold, fontSize: 44, color: '#fff', lineHeight: 44, letterSpacing: -2 },
  bandDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginTop: 16, marginBottom: 14 },
  bandPath:    { fontFamily: Fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  bandWeeks:   { fontFamily: Fonts.bold, color: '#FDE68A' },

  card: {
    backgroundColor: T.bg, borderWidth: 1, borderColor: T.borderStrong,
    borderRadius: 20, padding: 18, ...Shadow.card,
  },
  criteriaRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  criteriaName: { fontFamily: Fonts.regular, fontSize: 14, color: T.charcoal, letterSpacing: -0.1 },
  criteriaScore:{ fontFamily: Fonts.bold,    fontSize: 14 },
  trackBg:  { height: 6, borderRadius: 999, backgroundColor: T.rose100, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 999 },

  gridRow: { flexDirection: 'row', gap: 10 },
  gridCell: { flex: 1, borderRadius: 16, padding: 14 },
  gridTitle:    { fontFamily: Fonts.bold, fontSize: 12, marginBottom: 10, letterSpacing: -0.1 },
  gridItem:     { flexDirection: 'row', gap: 7, marginBottom: 7, alignItems: 'flex-start' },
  gridItemText: { fontFamily: Fonts.regular, fontSize: 12, color: T.charcoal, lineHeight: 18, letterSpacing: -0.1, flex: 1 },

  planBox: {
    backgroundColor: T.rose50, borderWidth: 1, borderColor: T.rose200,
    borderRadius: 18, padding: 18,
  },
  planBody: { fontFamily: Fonts.regular, fontSize: 14, color: T.slate, lineHeight: 23, letterSpacing: -0.1, marginBottom: 14 },
  planChip: {
    alignSelf: 'flex-start', height: 30, paddingHorizontal: 14,
    borderRadius: 999, backgroundColor: T.rose600,
    alignItems: 'center', justifyContent: 'center',
  },
  planChipText: { fontFamily: Fonts.bold, fontSize: 12, color: '#fff', letterSpacing: 0.1 },
});
