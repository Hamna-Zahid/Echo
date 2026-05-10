import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../services/supabase';
import { api } from '../../services/api';
import { T, Fonts, Spacing, Shadow, MODES } from '../../constants/tokens';
import { SectionHeader, ScoreChip, StreakChip, MicroLabel, BottomTabBar } from '../../components/echo/shared';
import { IconMic, IconChart, IconBriefcase, IconChat, IconBuilding, IconWaveform, IconClipboard, IconChevronRight } from '../../components/echo/icons';

function getModeIcon(modeId: string, color: string, size = 20) {
  switch (modeId) {
    case 'Diagnostic':           return <IconClipboard color={color} size={size} />;
    case 'IELTS Training':       return <IconMic color={color} size={size} />;
    case 'Interview Prep':       return <IconBriefcase color={color} size={size} />;
    case 'Daily Conversation':   return <IconChat color={color} size={size} />;
    case 'Professional English': return <IconBuilding color={color} size={size} />;
    case 'Accent Training':      return <IconWaveform color={color} size={size} />;
    default: return <IconMic color={color} size={size} />;
  }
}

const CEFR_SUBTITLE: Record<string, string> = {
  A1: 'Beginner', A2: 'Elementary', B1: 'Pre-intermediate',
  B2: 'Upper Intermediate', C1: 'Advanced', C2: 'Mastery',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [user, setUser]           = useState<any>(null);
  const [progress, setProgress]   = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [offline, setOffline]     = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    // Auth is always fetched — it's Supabase, not the local backend
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
    } catch (_) {}

    // Progress comes from the local backend — may be unreachable on first load
    try {
      const data = await api.get('/sessions/progress/summary');
      setProgress(data);
      setOffline(false);
    } catch (_) {
      setOffline(true);   // show banner, don't block the rest of the UI
    } finally {
      setLoading(false);
    }
  };

  const goToMode = (mode: typeof MODES[number]) => {
    router.push({ pathname: '/(app)/pre-session', params: { modeId: mode.id, mode: mode.mode } });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: T.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={T.rose600} />
      </View>
    );
  }

  const profile    = progress?.user;
  const cefr       = profile?.cefr_level;
  const ielts      = profile?.ielts_score;
  const streak     = profile?.streak_days || 0;
  const totalSess  = profile?.total_sessions || 0;
  const errFixed   = profile?.total_errors_fixed || 0;
  const handle     = user?.email?.split('@')[0] ?? 'Learner';
  const recent     = progress?.recent_sessions?.slice(0, 3) || [];

  const modeColors: Record<string, string> = {
    diagnostic: '#0EA5E9', training: '#E11D74', interview: '#D97706',
    conversation: '#0D9488', professional: '#6366F1', accent: '#7C3AED',
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bgSubtle }}>
    <ScrollView style={s.root} contentContainerStyle={[s.content, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>{getGreeting()}</Text>
          <Text style={s.handle}>{handle}.</Text>
        </View>
        <View style={s.headerRight}>
          {streak > 0 && <StreakChip count={streak} />}
          <TouchableOpacity onPress={() => router.push('/(app)/profile')} style={s.avatar}>
            <Text style={s.avatarText}>{handle[0]?.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Offline banner ── */}
      {offline && (
        <TouchableOpacity onPress={loadData} style={s.offlineBanner}>
          <Text style={s.offlineText}>⚠ Backend unreachable — tap to retry</Text>
        </TouchableOpacity>
      )}

      {/* ── Level card ── */}
      <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(app)/history')} style={{ marginBottom: 24 }}>
        <LinearGradient
          colors={['#D81B60', '#E11D74', '#C2185B']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.levelCard}>
          {/* Decorative circles */}
          <View style={s.levelCircle1} />
          <View style={s.levelCircle2} />

          <View style={s.levelCardInner}>
            <View>
              <MicroLabel style={s.levelMicro}>Current Level</MicroLabel>
              <Text style={s.levelCEFR}>{cefr ?? '—'}</Text>
              <Text style={s.levelCEFRSub}>{cefr ? (CEFR_SUBTITLE[cefr] ?? cefr) : 'Run diagnostic'}</Text>
            </View>
            {ielts ? (
              <View style={{ alignItems: 'flex-end' }}>
                <MicroLabel style={s.levelMicro}>IELTS Est.</MicroLabel>
                <Text style={s.levelIELTS}>{ielts}</Text>
                <Text style={s.levelTarget}>Band 9.0 target</Text>
              </View>
            ) : (
              <View style={{ alignItems: 'flex-end' }}>
                <MicroLabel style={s.levelMicro}>IELTS Est.</MicroLabel>
                <Text style={[s.levelIELTS, { opacity: 0.5 }]}>—</Text>
              </View>
            )}
          </View>

          {ielts && (
            <View style={s.levelProgress}>
              <View style={s.levelTrack}>
                <View style={[s.levelFill, { width: `${Math.min((parseFloat(ielts) / 9) * 100, 100)}%` as any }]} />
              </View>
              <View style={s.levelProgressLabels}>
                <Text style={s.levelProgressLabel}>{ielts}</Text>
                <Text style={s.levelProgressLabel}>Band 9.0</Text>
              </View>
            </View>
          )}

          {/* Stats */}
          <View style={s.levelStats}>
            {[
              [String(totalSess), 'Sessions'],
              [String(streak), 'Day streak'],
              [String(errFixed), 'Errors fixed'],
            ].map(([n, l]) => (
              <View key={l}>
                <Text style={s.levelStatNum}>{n}</Text>
                <Text style={s.levelStatLabel}>{l}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* ── Mode cards ── */}
      <SectionHeader title="Start a Session" />
      <View style={{ gap: 9, marginTop: 14, marginBottom: 28 }}>
        {MODES.map((m) => (
          <TouchableOpacity key={m.id} style={s.modeCard} onPress={() => goToMode(m)} activeOpacity={0.8}>
            <View style={[s.modeStrip, { backgroundColor: m.color }]} />
            <View style={[s.modeIconBox, { backgroundColor: m.bg }]}>
              {getModeIcon(m.id, m.color, 20)}
            </View>
            <View style={s.modeBody}>
              <View style={s.modeTitleRow}>
                <Text style={s.modeTitle}>{m.id}</Text>
                <View style={[s.modeBadge, { backgroundColor: m.badgeBg }]}>
                  <Text style={[s.modeBadgeText, { color: m.badgeColor }]}>{m.badge}</Text>
                </View>
              </View>
              <Text style={s.modeDesc} numberOfLines={1}>{m.desc}</Text>
            </View>
            <View style={{ marginRight: 2 }}>
              <IconChevronRight color={T.muted} size={14} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Recent sessions ── */}
      {recent.length > 0 && (
        <>
          <SectionHeader title="Recent" action="View all" onAction={() => router.push('/(app)/history')} />
          <View style={{ gap: 7, marginTop: 12, marginBottom: 24 }}>
            {recent.map((sess: any, i: number) => {
              const mColor = modeColors[sess.mode] || T.rose600;
              return (
                <View key={i} style={s.recentRow}>
                  <View style={[s.recentModePill, { backgroundColor: mColor + '18' }]}>
                    <Text style={[s.recentModeText, { color: mColor }]}>{sess.mode?.toUpperCase()}</Text>
                  </View>
                  <Text style={s.recentDate}>
                    {new Date(sess.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                  <View style={s.recentScores}>
                    {sess.fluency_score  ? <ScoreChip score={sess.fluency_score} label="F" /> : null}
                    {sess.grammar_score  ? <ScoreChip score={sess.grammar_score} label="G" /> : null}
                    {sess.cefr_score     ? <ScoreChip score={sess.cefr_score} /> : null}
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

    </ScrollView>
    <BottomTabBar active="home" />
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bgSubtle },
  content: { paddingBottom: 48, paddingHorizontal: Spacing.screenH },

  // Header
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, backgroundColor: T.bg, marginHorizontal: -Spacing.screenH, paddingHorizontal: Spacing.screenH, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: T.border },
  greeting:    { fontFamily: Fonts.medium, fontSize: 12, color: T.muted, letterSpacing: 0.1 },
  handle:      { fontFamily: Fonts.bold, fontSize: 21, color: T.charcoal, letterSpacing: -0.5, lineHeight: 26 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 4 },
  avatar:      { width: 38, height: 38, borderRadius: 999, backgroundColor: T.rose100, borderWidth: 1.5, borderColor: T.rose200, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontFamily: Fonts.bold, fontSize: 14, color: T.rose600 },

  // Level card
  levelCard:      { borderRadius: 22, padding: 20, overflow: 'hidden', position: 'relative' },
  levelCircle1:   { position: 'absolute', right: -32, top: -32, width: 130, height: 130, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.055)' },
  levelCircle2:   { position: 'absolute', right: 24, bottom: -44, width: 100, height: 100, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.035)' },
  levelCardInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' },
  levelMicro:     { color: 'rgba(255,255,255,0.5)', marginBottom: 3 },
  levelCEFR:      { fontFamily: Fonts.extrabold, fontSize: 52, color: '#fff', lineHeight: 52, letterSpacing: -2 },
  levelCEFRSub:   { fontFamily: Fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  levelIELTS:     { fontFamily: Fonts.extrabold, fontSize: 38, color: '#FDE68A', lineHeight: 40, letterSpacing: -1.5 },
  levelTarget:    { fontFamily: Fonts.regular, fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 },

  levelProgress:       { marginTop: 14, position: 'relative' },
  levelTrack:          { height: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)' },
  levelFill:           { height: '100%', borderRadius: 999, backgroundColor: '#FDE68A' },
  levelProgressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  levelProgressLabel:  { fontFamily: Fonts.regular, fontSize: 10, color: 'rgba(255,255,255,0.38)', letterSpacing: 0.2 },

  levelStats:     { flexDirection: 'row', gap: 18, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  levelStatNum:   { fontFamily: Fonts.bold, fontSize: 17, color: '#fff', letterSpacing: -0.4 },
  levelStatLabel: { fontFamily: Fonts.regular, fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.2, marginTop: 1 },

  // Mode cards
  modeCard:    { backgroundColor: T.bg, borderWidth: 1, borderColor: T.borderStrong, borderRadius: 17, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', ...Shadow.card },
  modeStrip:   { width: 3, alignSelf: 'stretch', borderRadius: 1 },
  modeIconBox: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center', margin: 12, marginLeft: 10 },
  modeBody:    { flex: 1, paddingVertical: 12, gap: 2, minWidth: 0 },
  modeTitleRow:{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  modeTitle:   { fontFamily: Fonts.semibold, fontSize: 14, color: T.charcoal, letterSpacing: -0.2 },
  modeBadge:   { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  modeBadgeText: { fontFamily: Fonts.bold, fontSize: 10, letterSpacing: 0.2 },
  modeDesc:    { fontFamily: Fonts.regular, fontSize: 12, color: T.muted },

  // Offline
  offlineBanner: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FCD34D', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 16, alignItems: 'center' },
  offlineText:   { fontFamily: Fonts.medium, fontSize: 13, color: '#92400E' },

  // Recent
  recentRow:      { backgroundColor: T.bg, borderWidth: 1, borderColor: T.borderStrong, borderRadius: 13, padding: 11, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  recentModePill: { height: 24, paddingHorizontal: 9, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  recentModeText: { fontFamily: Fonts.bold, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase' },
  recentDate:     { fontFamily: Fonts.medium, fontSize: 13, color: T.charcoal, flex: 1 },
  recentScores:   { flexDirection: 'row', gap: 5 },
});
