import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle, Text as SvgText, Line } from 'react-native-svg';
import { api } from '../../services/api';
import { T, Fonts, Spacing, Shadow } from '../../constants/tokens';
import { SectionHeader, ScoreChip, EchoChip, MicroLabel, BottomTabBar } from '../../components/echo/shared';
import { IconChevronLeft } from '../../components/echo/icons';

type Session = {
  id: string; started_at: string; mode: string; cefr_score: string | null;
  fluency_score: number | null; grammar_score: number | null;
  lexical_score: number | null; pronunciation_score: number | null;
  duration_seconds: number | null;
};

function fmtDuration(s: number | null) {
  if (!s) return '--';
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const MODE_COLORS: Record<string, string> = {
  diagnostic: '#0EA5E9', training: '#E11D74', interview: '#D97706',
  conversation: '#0D9488', professional: '#6366F1', accent: '#7C3AED',
};

const ERROR_TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  TENSE:       { color: '#F59E0B', bg: '#FEF3C7' },
  ARTICLE:     { color: '#0EA5E9', bg: '#E0F2FE' },
  PREPOSITION: { color: '#8B5CF6', bg: '#EDE9FE' },
  COLLOCATION: { color: '#F43F8E', bg: '#FCE7F3' },
  AGREEMENT:   { color: '#F97316', bg: '#FEF0E6' },
  VOCAB:       { color: '#6366F1', bg: '#EEF2FF' },
  FILLER:      { color: '#0D9488', bg: '#F0FDFA' },
};

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { highlight } = useLocalSearchParams<{ highlight?: string }>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [errors, setErrors]     = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('All');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [sr, er, pr] = await Promise.all([
        api.get('/sessions/'),
        api.get('/sessions/errors/recurring'),
        api.get('/sessions/progress/summary'),
      ]);
      setSessions(sr.sessions || []);
      setErrors(er.errors || []);
      setProgress(pr);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: T.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={T.rose600} />
      </View>
    );
  }

  // Build a simple IELTS over-time dataset from sessions
  const scorePts = sessions
    .filter(s => s.fluency_score)
    .slice(-5)
    .map(s => ({
      d: new Date(s.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      s: ((s.fluency_score! + (s.grammar_score || s.fluency_score!) + (s.lexical_score || s.fluency_score!)) / 3),
    }));

  const W = 260, H = 72, MIN = 4.5, MAX = 8.5;
  const px = (i: number) => (i / Math.max(scorePts.length - 1, 1)) * (W - 20) + 10;
  const py = (v: number) => H - ((v - MIN) / (MAX - MIN)) * (H - 16) - 8;
  const linePath = scorePts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(i)} ${py(p.s)}`).join(' ');
  const fillPath = scorePts.length > 1
    ? `${linePath} L ${px(scorePts.length - 1)} ${H} L ${px(0)} ${H} Z`
    : '';

  const FILTERS = ['All', 'Training', 'Diagnostic', 'Interview'];
  const filteredSessions = filter === 'All'
    ? sessions
    : sessions.filter(s => s.mode?.toLowerCase().includes(filter.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: T.bgSubtle }}>
    <ScrollView style={s.root} contentContainerStyle={[s.content, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <IconChevronLeft color={T.charcoal} size={16} />
        </TouchableOpacity>
        <Text style={s.title}>Progress</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Diagnostic result highlight */}
      {highlight && (
        <View style={s.highlightCard}>
          <MicroLabel style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Assessment Complete</MicroLabel>
          <Text style={s.highlightCEFR}>{highlight}</Text>
          <Text style={s.highlightSub}>Your profile has been updated</Text>
          <View style={s.highlightGlow} />
        </View>
      )}

      {/* Level hero */}
      {sessions.length > 0 && (
        <View style={s.levelHero}>
          <Text style={s.levelHeroCEFR}>{progress?.user?.cefr_level ?? '—'}</Text>
          <Text style={s.levelHeroSub}>
            {progress?.user?.cefr_level
              ? `${progress.user.cefr_level}${progress?.user?.ielts_score ? ` · IELTS ${progress.user.ielts_score}` : ''}`
              : 'Run a diagnostic to get your level'}
          </Text>
          <View style={s.levelHeroLine} />
        </View>
      )}

      {/* Chart */}
      {scorePts.length >= 2 && (
        <View style={[s.card, { marginBottom: 22 }]}>
          <MicroLabel style={{ marginBottom: 16 }}>IELTS Score Over Time</MicroLabel>
          <Svg width={W} height={H + 24} style={{ overflow: 'visible' as any }}>
            {[5, 6, 7].map(v => (
              <Line key={v} x1="0" y1={py(v)} x2={W} y2={py(v)} stroke={T.border} strokeWidth="1"/>
            ))}
            {fillPath ? <Path d={fillPath} fill={T.rose500} fillOpacity={0.1} /> : null}
            {scorePts.length > 1 && (
              <Path d={linePath} fill="none" stroke={T.rose500} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            )}
            {scorePts.map((p, i) => (
              <Circle key={i} cx={px(i)} cy={py(p.s)} r="5" fill={T.rose600} />
            ))}
          </Svg>
        </View>
      )}

      {/* Recurring errors */}
      {errors.length > 0 && (
        <View style={{ marginBottom: 22 }}>
          <SectionHeader title="Recurring Errors" />
          <View style={{ gap: 7, marginTop: 12 }}>
            {errors.slice(0, 6).map((err: any, i: number) => {
              const cfg = ERROR_TYPE_COLORS[err.error_type] || { color: T.rose600, bg: T.rose50 };
              return (
                <TouchableOpacity
                  key={i}
                  style={s.errorRow}
                  activeOpacity={0.75}
                  onPress={() => router.push({
                    pathname: '/(app)/error-detail',
                    params: {
                      errorId:           err.id,
                      errorType:         err.error_type,
                      originalUtterance: err.original_utterance,
                      correctedForm:     err.corrected_form,
                      explanation:       err.explanation,
                      recurrenceCount:   String(err.recurrence_count || 1),
                    },
                  })}
                >
                  <View style={[s.errorBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[s.errorBadgeText, { color: cfg.color }]}>{err.error_type}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.errorOriginal} numberOfLines={1}>{err.original_utterance}</Text>
                    <Text style={s.errorCorrected} numberOfLines={1}>{err.corrected_form}</Text>
                  </View>
                  <Text style={[s.errorCount, { color: err.recurrence_count >= 5 ? T.rose600 : err.recurrence_count >= 2 ? T.warning : T.muted }]}>
                    ×{err.recurrence_count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Sessions */}
      <View>
        <SectionHeader title="Sessions" />
        <View style={s.filterRow}>
          {FILTERS.map(f => (
            <EchoChip key={f} label={f} active={filter === f} size="sm" onPress={() => setFilter(f)} />
          ))}
        </View>
        {filteredSessions.length === 0 ? (
          <Text style={s.empty}>No sessions yet. Start your first session.</Text>
        ) : (
          <View style={{ gap: 8, marginTop: 4 }}>
            {filteredSessions.map((sess) => {
              const mColor = MODE_COLORS[sess.mode] || T.rose600;
              return (
                <View key={sess.id} style={s.sessCard}>
                  <View style={s.sessRow}>
                    <View style={[s.sessModeTag, { backgroundColor: mColor + '18' }]}>
                      <Text style={[s.sessModeText, { color: mColor }]}>{sess.mode?.toUpperCase()}</Text>
                    </View>
                    <Text style={s.sessDate}>
                      {new Date(sess.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                    <Text style={s.sessDuration}>{fmtDuration(sess.duration_seconds)}</Text>
                  </View>
                  {(sess.cefr_score || sess.fluency_score) && (
                    <View style={s.sessScores}>
                      {sess.cefr_score && <ScoreChip score={sess.cefr_score} />}
                      {sess.fluency_score   && <ScoreChip score={sess.fluency_score}       label="F" />}
                      {sess.grammar_score   && <ScoreChip score={sess.grammar_score}       label="G" />}
                      {sess.lexical_score   && <ScoreChip score={sess.lexical_score}       label="L" />}
                      {sess.pronunciation_score && <ScoreChip score={sess.pronunciation_score} label="P" />}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
    <BottomTabBar active="progress" />
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bgSubtle },
  content: { paddingHorizontal: Spacing.screenH, paddingBottom: 48 },

  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, backgroundColor: T.bg, marginHorizontal: -Spacing.screenH, paddingHorizontal: Spacing.screenH, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn:   { width: 36, height: 36, borderRadius: 10, backgroundColor: T.bgSubtle, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' },
  title:     { fontFamily: Fonts.bold, fontSize: 20, color: T.charcoal, letterSpacing: -0.4 },

  highlightCard: {
    backgroundColor: T.rose600, borderRadius: 22, padding: 24, alignItems: 'center',
    marginBottom: 22, overflow: 'hidden', position: 'relative',
    ...Shadow.button,
  },
  highlightCEFR: { fontFamily: Fonts.extrabold, fontSize: 56, color: '#fff', letterSpacing: -2, lineHeight: 60 },
  highlightSub:  { fontFamily: Fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  highlightGlow: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: '#FDE68A' },

  levelHero:     { alignItems: 'center', paddingVertical: 6, marginBottom: 22 },
  levelHeroCEFR: { fontFamily: Fonts.extrabold, fontSize: 52, color: T.charcoal, letterSpacing: -2 },
  levelHeroSub:  { fontFamily: Fonts.regular, fontSize: 13, color: T.muted, marginTop: 4 },
  levelHeroLine: { width: 44, height: 2, borderRadius: 999, backgroundColor: T.rose600, marginTop: 10 },

  card: { backgroundColor: T.bg, borderWidth: 1, borderColor: T.borderStrong, borderRadius: 20, padding: 18, ...Shadow.card },

  errorRow:       { backgroundColor: T.bg, borderWidth: 1, borderColor: T.borderStrong, borderRadius: 14, padding: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  errorBadge:     { height: 25, paddingHorizontal: 8, borderRadius: 999, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  errorBadgeText: { fontFamily: Fonts.bold, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase' },
  errorOriginal:  { fontFamily: Fonts.medium, fontSize: 13, color: T.charcoal, textDecorationLine: 'line-through', textDecorationColor: '#EF4444' },
  errorCorrected: { fontFamily: Fonts.regular, fontSize: 12, color: T.muted, marginTop: 1 },
  errorCount:     { fontFamily: Fonts.bold, fontSize: 15, letterSpacing: -0.3, flexShrink: 0 },

  filterRow: { flexDirection: 'row', gap: 7, marginTop: 12, marginBottom: 12, flexWrap: 'wrap' },

  sessCard:    { backgroundColor: T.bg, borderWidth: 1, borderColor: T.borderStrong, borderRadius: 14, padding: 12, paddingHorizontal: 14, ...Shadow.card },
  sessRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessModeTag: { height: 24, paddingHorizontal: 8, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  sessModeText: { fontFamily: Fonts.bold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3 },
  sessDate:    { fontFamily: Fonts.medium, fontSize: 13, color: T.charcoal, flex: 1 },
  sessDuration: { fontFamily: Fonts.regular, fontSize: 12, color: T.muted },
  sessScores:  { flexDirection: 'row', gap: 5, marginTop: 10, flexWrap: 'wrap' },

  empty: { fontFamily: Fonts.regular, fontSize: 14, color: T.muted, textAlign: 'center', paddingVertical: 40 },
});
