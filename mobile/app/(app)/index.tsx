import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';
import { api } from '../../services/api';
import ModeSelector from '../../components/ModeSelector';
import { C, FONT, RADIUS } from '../../constants/colors';

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const data = await api.get('/sessions/progress/summary');
      setProgress(data);
    } catch (e) {
      console.error('Home data failed', e);
    } finally {
      setLoading(false);
    }
  };

  const startSession = (mode: 'diagnostic' | 'training' | 'interview') => {
    const sid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    router.push({ pathname: '/(app)/session', params: { sessionId: sid, mode } });
  };

  if (loading) {
    return <View style={s.centered}><ActivityIndicator size="large" color={C.blue600} /></View>;
  }

  const profile = progress?.user;
  const cefr = profile?.cefr_level;
  const ielts = profile?.ielts_score;
  const recent = progress?.recent_sessions?.slice(0, 3) || [];

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Good day,</Text>
          <Text style={s.handle}>{user?.email?.split('@')[0] ?? 'Learner'}</Text>
        </View>
        <TouchableOpacity
          style={s.historyBtn}
          onPress={() => router.push('/(app)/history')}
        >
          <Text style={s.historyBtnText}>Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Level card */}
      {cefr ? (
        <View style={s.levelCard}>
          <View style={s.levelCardLeft}>
            <Text style={s.levelCardLabel}>Current Level</Text>
            <Text style={s.levelCardCEFR}>{cefr}</Text>
            <Text style={s.levelCardSub}>{profile?.target_exam ?? 'IELTS'} preparation</Text>
          </View>
          {ielts && (
            <View style={s.ieltsBox}>
              <Text style={s.ieltsBoxLabel}>IELTS</Text>
              <Text style={s.ieltsBoxScore}>{ielts}</Text>
            </View>
          )}
          {/* Glow line */}
          <View style={s.cardGlow} />
        </View>
      ) : (
        <TouchableOpacity style={s.diagnosticCard} onPress={() => startSession('diagnostic')} activeOpacity={0.85}>
          <View style={s.diagnosticInner}>
            <View style={s.pulseDot} />
            <View>
              <Text style={s.diagnosticTitle}>Begin Assessment</Text>
              <Text style={s.diagnosticSub}>3-minute speaking test · Instant CEFR score</Text>
            </View>
          </View>
          <Text style={s.diagnosticArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* Mode selector */}
      <Text style={s.sectionTitle}>Start a Session</Text>
      <ModeSelector onSelect={startSession} />

      {/* Recent sessions */}
      {recent.length > 0 && (
        <>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Recent</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/history')}>
              <Text style={s.viewAll}>View all →</Text>
            </TouchableOpacity>
          </View>
          {recent.map((sess: any, i: number) => (
            <View key={i} style={s.sessionRow}>
              <View>
                <Text style={s.sessionMode}>{sess.mode?.toUpperCase()}</Text>
                <Text style={s.sessionDate}>
                  {new Date(sess.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <View style={s.sessionScores}>
                {[['F', sess.fluency_score], ['G', sess.grammar_score], ['L', sess.lexical_score]].map(([k, v]) =>
                  v ? (
                    <View key={k as string} style={s.scoreChip}>
                      <Text style={s.scoreChipKey}>{k}</Text>
                      <Text style={s.scoreChipVal}>{v}</Text>
                    </View>
                  ) : null
                )}
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingBottom: 48 },
  centered: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  greeting: { fontSize: FONT.sm, color: C.textDim, marginBottom: 3 },
  handle: { fontSize: FONT.xl, fontWeight: '700', color: C.text },
  historyBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border,
  },
  historyBtnText: { color: C.textSub, fontSize: FONT.sm, fontWeight: '500' },

  levelCard: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: C.border,
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    overflow: 'hidden',
  },
  levelCardLeft: {},
  levelCardLabel: { fontSize: FONT.xs, color: C.textDim, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 },
  levelCardCEFR: { fontSize: FONT['4xl'], fontWeight: '800', color: C.text, letterSpacing: -1, marginBottom: 4 },
  levelCardSub: { fontSize: FONT.sm, color: C.textSub },
  ieltsBox: { alignItems: 'flex-end' },
  ieltsBoxLabel: { fontSize: FONT.xs, color: C.textDim, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  ieltsBoxScore: { fontSize: 36, fontWeight: '800', color: C.blue400 },
  cardGlow: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
    backgroundColor: C.blue600,
    borderTopLeftRadius: RADIUS.lg, borderBottomLeftRadius: RADIUS.lg,
  },

  diagnosticCard: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: C.blue600 + '55',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  diagnosticInner: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  pulseDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: C.blue600,
    shadowColor: C.blue600, shadowOpacity: 0.8, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
  },
  diagnosticTitle: { fontSize: FONT.lg, fontWeight: '700', color: C.text, marginBottom: 3 },
  diagnosticSub: { fontSize: FONT.sm, color: C.textSub },
  diagnosticArrow: { fontSize: 24, color: C.blue400 },

  sectionTitle: { fontSize: FONT.md, fontWeight: '700', color: C.text, marginBottom: 14, letterSpacing: -0.2 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 4 },
  viewAll: { fontSize: FONT.sm, color: C.blue400, fontWeight: '500' },

  sessionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  sessionMode: { fontSize: FONT.xs, fontWeight: '700', color: C.blue400, letterSpacing: 0.8, marginBottom: 4 },
  sessionDate: { fontSize: FONT.sm, color: C.textSub },
  sessionScores: { flexDirection: 'row', gap: 6 },
  scoreChip: {
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: C.surface, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: C.border,
    flexDirection: 'row', gap: 4, alignItems: 'center',
  },
  scoreChipKey: { fontSize: FONT.xs, color: C.textDim },
  scoreChipVal: { fontSize: FONT.sm, color: C.blue400, fontWeight: '700' },
});
