import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../../services/api';
import { C, FONT, RADIUS } from '../../constants/colors';

type Session = {
  id: string; started_at: string; mode: string; cefr_score: string | null;
  fluency_score: number | null; grammar_score: number | null;
  lexical_score: number | null; pronunciation_score: number | null;
  duration_seconds: number | null;
};

const SCORE_KEYS = [
  { key: 'fluency_score',       label: 'Fluency' },
  { key: 'grammar_score',       label: 'Grammar' },
  { key: 'lexical_score',       label: 'Lexical' },
  { key: 'pronunciation_score', label: 'Pronun.' },
] as const;

function scoreColor(v: number | null) {
  if (!v) return C.textDim;
  if (v >= 7) return C.success;
  if (v >= 5.5) return C.warning;
  return C.error;
}

function fmtDuration(s: number | null) {
  if (!s) return '--';
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function HistoryScreen() {
  const { highlight } = useLocalSearchParams<{ highlight?: string }>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [sr, er] = await Promise.all([api.get('/sessions/'), api.get('/sessions/errors/recurring')]);
      setSessions(sr.sessions || []);
      setErrors(er.errors || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) {
    return <View style={s.centered}><ActivityIndicator size="large" color={C.blue600} /></View>;
  }

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Progress</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Diagnostic result */}
      {highlight && (
        <View style={s.highlightCard}>
          <Text style={s.highlightLabel}>Assessment Complete</Text>
          <Text style={s.highlightCEFR}>{highlight}</Text>
          <Text style={s.highlightSub}>Your profile has been updated</Text>
          <View style={s.highlightGlow} />
        </View>
      )}

      {/* Recurring errors */}
      {errors.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Recurring Errors</Text>
          <View style={s.card}>
            {errors.slice(0, 6).map((err, i) => (
              <View key={err.id} style={[s.errorRow, i < errors.length - 1 && s.errorRowBorder]}>
                <View style={s.errorBadge}>
                  <Text style={s.errorBadgeText}>{err.error_type}</Text>
                </View>
                <View style={s.errorBody}>
                  <Text style={s.errorOriginal}>{err.original_utterance}</Text>
                  <Text style={s.errorCorrected}>{err.corrected_form}</Text>
                </View>
                <View style={s.errorCount}>
                  <Text style={s.errorCountText}>×{err.recurrence_count}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Sessions */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Sessions</Text>
        {sessions.length === 0 ? (
          <Text style={s.empty}>No sessions yet. Start your first session.</Text>
        ) : (
          sessions.map((sess) => (
            <View key={sess.id} style={s.sessCard}>
              <View style={s.sessHeader}>
                <View style={s.sessModeTag}>
                  <Text style={s.sessModeText}>{sess.mode?.toUpperCase()}</Text>
                </View>
                <Text style={s.sessDate}>
                  {new Date(sess.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
                <Text style={s.sessDuration}>{fmtDuration(sess.duration_seconds)}</Text>
              </View>

              {sess.cefr_score && (
                <View style={s.scoresRow}>
                  <View style={s.cefrPill}>
                    <Text style={s.cefrPillText}>{sess.cefr_score}</Text>
                  </View>
                  {SCORE_KEYS.map(({ key, label }) => {
                    const val = sess[key] as number | null;
                    return val ? (
                      <View key={key} style={s.scoreItem}>
                        <Text style={s.scoreLabel}>{label}</Text>
                        <Text style={[s.scoreValue, { color: scoreColor(val) }]}>{val}</Text>
                      </View>
                    ) : null;
                  })}
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingBottom: 48 },
  centered: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  back: { color: C.blue400, fontSize: FONT.sm, fontWeight: '500' },
  title: { fontSize: FONT.xl, fontWeight: '700', color: C.text },

  highlightCard: {
    backgroundColor: C.surface, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: C.blue600 + '44',
    padding: 24, alignItems: 'center', marginBottom: 28, overflow: 'hidden',
  },
  highlightLabel: { fontSize: FONT.xs, color: C.textDim, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  highlightCEFR: { fontSize: 56, fontWeight: '800', color: C.text, letterSpacing: -2, marginBottom: 6 },
  highlightSub: { fontSize: FONT.sm, color: C.textSub },
  highlightGlow: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
    backgroundColor: C.blue600,
  },

  section: { marginBottom: 28 },
  sectionTitle: { fontSize: FONT.md, fontWeight: '700', color: C.text, marginBottom: 12, letterSpacing: -0.2 },
  card: { backgroundColor: C.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },

  errorRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  errorRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  errorBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: C.warning + '22', borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: C.warning + '44', minWidth: 72, alignItems: 'center',
  },
  errorBadgeText: { fontSize: 10, fontWeight: '700', color: C.warning, letterSpacing: 0.5 },
  errorBody: { flex: 1 },
  errorOriginal: { fontSize: FONT.sm, color: C.textSub, textDecorationLine: 'line-through', marginBottom: 2 },
  errorCorrected: { fontSize: FONT.sm, color: C.blue300, fontWeight: '600' },
  errorCount: {},
  errorCountText: { fontSize: FONT.sm, fontWeight: '700', color: C.error },

  sessCard: { backgroundColor: C.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 10 },
  sessHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sessModeTag: {
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: C.blue600 + '22', borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: C.blue600 + '44',
  },
  sessModeText: { fontSize: 11, fontWeight: '700', color: C.blue400, letterSpacing: 0.5 },
  sessDate: { fontSize: FONT.sm, color: C.textSub },
  sessDuration: { fontSize: FONT.sm, color: C.textDim },
  scoresRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  cefrPill: {
    paddingHorizontal: 12, paddingVertical: 5,
    backgroundColor: C.blue600, borderRadius: RADIUS.sm,
  },
  cefrPillText: { fontSize: FONT.sm, fontWeight: '800', color: C.text },
  scoreItem: { alignItems: 'center', minWidth: 50 },
  scoreLabel: { fontSize: 10, color: C.textDim, marginBottom: 2, letterSpacing: 0.3 },
  scoreValue: { fontSize: FONT.md, fontWeight: '700' },
  empty: { color: C.textDim, fontSize: FONT.md, textAlign: 'center', paddingVertical: 40 },
});
