import { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { api } from '../../services/api';
import { T, Fonts, Spacing, Shadow } from '../../constants/tokens';
import { EchoButton, MicroLabel, ScoreChip } from '../../components/echo/shared';
import { IconCheck, IconArrow } from '../../components/echo/icons';

const ERROR_TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  TENSE:       { color: '#F59E0B', bg: '#FEF3C7' },
  ARTICLE:     { color: '#0EA5E9', bg: '#E0F2FE' },
  PREPOSITION: { color: '#8B5CF6', bg: '#EDE9FE' },
  COLLOCATION: { color: '#F43F8E', bg: '#FCE7F3' },
  AGREEMENT:   { color: '#F97316', bg: '#FEF0E6' },
  VOCAB:       { color: '#6366F1', bg: '#EEF2FF' },
  FILLER:      { color: '#0D9488', bg: '#F0FDFA' },
};

function fmtDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}s`;
  if (sec === 0) return `${m} min`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function SessionEndScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId, mode, elapsed } = useLocalSearchParams<{
    sessionId?: string; mode?: string; elapsed?: string;
  }>();

  const [session, setSession]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      if (sessionId) {
        const data = await api.get(`/sessions/${sessionId}`);
        setSession(data);
      }
    } catch (e) {
      console.error('session-end load error', e);
    } finally {
      setLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 320, useNativeDriver: true }),
      ]).start();
    }
  };

  const modeLabel = (mode || 'Training').split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  const durationLabel = elapsed ? fmtDuration(parseInt(elapsed, 10)) : '--';

  const scores = session ? [
    { label: 'Fluency',       score: session.fluency_score },
    { label: 'Lexical',       score: session.lexical_score },
    { label: 'Grammar',       score: session.grammar_score },
    { label: 'Pronunciation', score: session.pronunciation_score },
  ].filter(s => s.score != null) : [];

  const errors: any[] = session?.errors || [];
  const totalErrors = errors.length;

  // Group errors by type for the badge chips
  const errorGroups: Record<string, { count: number; color: string; bg: string }> = {};
  for (const e of errors) {
    const t = (e.error_type || 'OTHER').toUpperCase();
    const cfg = ERROR_TYPE_COLORS[t] || { color: T.rose600, bg: T.rose50 };
    if (!errorGroups[t]) errorGroups[t] = { count: 0, ...cfg };
    errorGroups[t].count++;
  }

  // Vocab upgrades — errors where we have both original and corrected
  const vocabUpgrades = errors
    .filter(e => e.error_type === 'VOCAB' && e.original_utterance && e.corrected_form)
    .slice(0, 3);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: T.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={T.rose600} />
      </View>
    );
  }

  return (
    <ScrollView style={s.root} contentContainerStyle={[s.content, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
      {/* Drag handle */}
      <View style={s.handle} />

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Header */}
        <View style={s.headerRow}>
          <View style={s.checkCircle}>
            <IconCheck color={T.success} size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.heading}>Session complete.</Text>
            <Text style={s.subheading}>{durationLabel} · {modeLabel}</Text>
          </View>
        </View>

        {/* Score grid */}
        {scores.length > 0 && (
          <View style={s.scoreGrid}>
            {scores.map((sc, i) => {
              const n = typeof sc.score === 'number' ? sc.score : parseFloat(sc.score);
              const [bg, color] = n >= 7
                ? ['#D1FAE5', '#065F46']
                : n >= 5.5
                  ? ['#FEF3C7', '#92400E']
                  : [T.rose100, T.rose600];
              return (
                <View key={sc.label} style={[s.scoreCell, { borderColor: T.borderStrong }]}>
                  <Text style={[s.scoreCellLabel, { color: T.muted }]}>{sc.label}</Text>
                  <Text style={[s.scoreCellValue, { color }]}>{n.toFixed(1)}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Errors caught */}
        <View style={s.errorsBox}>
          <View style={s.errorsCountRow}>
            <Text style={s.errorsCount}>{totalErrors}</Text>
            <Text style={s.errorsCountLabel}>
              {totalErrors === 1 ? 'error corrected this session' : 'errors corrected this session'}
            </Text>
          </View>
          {Object.keys(errorGroups).length > 0 && (
            <View style={s.errorBadgesRow}>
              {Object.entries(errorGroups).map(([type, cfg]) => (
                <View key={type} style={[s.errorBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[s.errorBadgeType, { color: cfg.color }]}>{type}</Text>
                  <Text style={[s.errorBadgeCount, { color: cfg.color, opacity: 0.6 }]}>×{cfg.count}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Vocabulary upgrades */}
        {vocabUpgrades.length > 0 && (
          <View style={s.vocabBox}>
            <MicroLabel style={{ marginBottom: 12 }}>Vocabulary Upgrades</MicroLabel>
            {vocabUpgrades.map((v, i) => (
              <View key={i} style={[s.vocabRow, i < vocabUpgrades.length - 1 && { marginBottom: 10 }]}>
                <Text style={s.vocabOriginal}>"{v.original_utterance}"</Text>
                <IconArrow color={T.rose400} size={14} />
                <Text style={s.vocabUpgrade}>{v.corrected_form}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={s.actions}>
          {sessionId && (
            <EchoButton
              label="View full report"
              variant="outline"
              onPress={() => router.push({ pathname: '/(app)/history' })}
            />
          )}
          <EchoButton
            label="Start another session"
            onPress={() => router.replace('/(app)')}
          />
          <TouchableOpacity style={s.homeLink} onPress={() => router.replace('/(app)')}>
            <Text style={s.homeLinkText}>Back to home</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bg },
  content: {
    paddingHorizontal: Spacing.screenH,
  },

  handle: {
    width: 34, height: 4, borderRadius: 999,
    backgroundColor: T.borderStrong,
    alignSelf: 'center', marginBottom: 18,
  },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 },
  checkCircle: {
    width: 40, height: 40, borderRadius: 999,
    backgroundColor: '#D1FAE5',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  heading:    { fontFamily: Fonts.bold, fontSize: 24, color: T.charcoal, letterSpacing: -0.5 },
  subheading: { fontFamily: Fonts.regular, fontSize: 13, color: T.muted, marginTop: 2 },

  scoreGrid: {
    flexDirection: 'row', gap: 8, marginBottom: 20,
  },
  scoreCell: {
    flex: 1, borderWidth: 1, borderRadius: 14,
    paddingVertical: 11, paddingHorizontal: 6,
    alignItems: 'center',
  },
  scoreCellLabel: { fontFamily: Fonts.medium, fontSize: 10, marginBottom: 5, letterSpacing: 0.1 },
  scoreCellValue: { fontFamily: Fonts.bold, fontSize: 22 },

  errorsBox: {
    backgroundColor: T.bgSubtle,
    borderRadius: 16, padding: 14, marginBottom: 16,
  },
  errorsCountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  errorsCount:      { fontFamily: Fonts.extrabold, fontSize: 28, color: T.rose600, letterSpacing: -1 },
  errorsCountLabel: { fontFamily: Fonts.medium, fontSize: 14, color: T.charcoal },
  errorBadgesRow: { flexDirection: 'row', gap: 7, flexWrap: 'wrap' },
  errorBadge: {
    height: 28, paddingHorizontal: 10, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  errorBadgeType:  { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase' },
  errorBadgeCount: { fontFamily: Fonts.regular, fontSize: 11 },

  vocabBox: {
    borderWidth: 1, borderColor: T.borderStrong,
    borderRadius: 16, padding: 14, marginBottom: 20,
  },
  vocabRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, flexWrap: 'wrap',
  },
  vocabOriginal: {
    fontFamily: Fonts.regular, fontSize: 14, color: T.muted,
    textDecorationLine: 'line-through', textDecorationColor: T.muted,
  },
  vocabUpgrade: { fontFamily: Fonts.bold, fontSize: 14, color: T.rose600 },

  actions: { gap: 10 },
  homeLink: { alignItems: 'center', paddingTop: 2 },
  homeLinkText: { fontFamily: Fonts.medium, fontSize: 14, color: T.rose600 },
});
