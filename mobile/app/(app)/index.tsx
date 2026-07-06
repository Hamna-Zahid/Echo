import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../services/supabase';
import { api } from '../../services/api';
import { T, Fonts, Spacing, Shadow } from '../../constants/tokens';
import { SectionHeader, ScoreChip, StreakChip, BottomTabBar } from '../../components/echo/shared';
import { IconMic, IconChart, IconChat, IconClipboard, IconChevronRight } from '../../components/echo/icons';


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
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    // Auth is always fetched — it's Supabase, not the local backend
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
    } catch (_) { }

    // Progress comes from the local backend — may fail if offline or not signed in
    try {
      const data = await api.get('/sessions/progress/summary');
      setProgress(data);
      setLoadError(null);
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg.startsWith('401:')) {
        setLoadError('auth');
      } else {
        setLoadError('offline');
      }
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: T.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={T.rose600} />
      </View>
    );
  }

  const profile = progress?.user;
  const cefr = profile?.cefr_level;
  const englishScore = profile?.englishScore;
  const streak = profile?.streak_days || 0;
  const totalSess = profile?.total_sessions || 0;
  const errFixed = profile?.total_errors_fixed || 0;
  const handle = user?.email?.split('@')[0] ?? 'Learner';
  const recent = progress?.recent_sessions?.slice(0, 3) || [];


  // mockup backend functions
  const nextLevel =
    cefr === 'A1' ? 'A2' :
      cefr === 'A2' ? 'B1' :
        cefr === 'B1' ? 'B2' :
          cefr === 'B2' ? 'C1' :
            cefr === 'C1' ? 'C2' :
              '—';

  const progressPercentage = profile?.progress_percentage ?? 35;

  // Temporary until backend provides it
  const confidenceScore = 94;

  // after backend integratio
  // const nextLevel = profile?.next_level;
  // const progressPercentage = profile?.progress_percentage;
  // const confidenceScore = profile?.confidence_score;

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

        {/* ── Load error banner ── */}
        {loadError === 'auth' && (
        <TouchableOpacity
          onPress={async () => {
            await supabase.auth.signOut();
            router.replace('/(auth)/login');
          }}
          style={s.offlineBanner}>
          <Text style={s.offlineText}>⚠ Session expired — tap to sign in again</Text>
        </TouchableOpacity>
      )}
      {loadError === 'offline' && (
        <TouchableOpacity onPress={loadData} style={s.offlineBanner}>
          <Text style={s.offlineText}>⚠ Backend unreachable — tap to retry</Text>
        </TouchableOpacity>
      )}

        { /* ── Hero card ── */}

        <View style={s.heroContainer}>

          <View >

            <View style={s.heroText}>

              <Text style={s.heroTitle}>
                Your journey to{"\n"}
                confident English{"\n"}
                starts here.
              </Text>

              <Text style={s.heroSubtitle}>
                Practice real conversations{"\n"}
                and improve every day.
              </Text>

            </View>

          </View>
          <Image
            source={require('../../assets/echoheygif.gif')}
            style={s.heroRobot}
          />

        </View>

        {/* ── Level card ── */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => router.push('/(app)/history')}
          style={{ marginBottom: 24 }}
        >
          <LinearGradient
            colors={['#E91E63', '#D81B60', '#C2185B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.levelCard}
          >

            <View style={s.levelGlowTop} />
            <View style={s.levelGlowBottom} />

            {/* Top Row */}

            <View style={s.levelTop}>

              <View style={{ flex: 1 }}>

                <Text style={s.levelLabel}>
                  CURRENT LEVEL
                </Text>

                <Text style={s.levelCurrent}>
                  {cefr ?? '—'}
                </Text>

                <Text style={s.levelSubtitle}>
                  {cefr
                    ? (CEFR_SUBTITLE[cefr] ?? cefr)
                    : 'Run diagnostic'}
                </Text>

              </View>

              <View style={{ alignItems: 'flex-end' }}>

                <Text style={s.levelLabel}> NEXT LEVEL </Text>

                <Text style={s.levelNext}>
                  {nextLevel}
                </Text>

                <Text style={s.levelSubtitle}>
                  Advanced
                </Text>

              </View>

            </View>

            {/* Progress */}

            <View style={s.progressContainer}>

              <View style={s.progressTrack}>
                <View
                  style={[
                    s.progressFill,
                    {
                      width: `${progressPercentage}%`,
                    },
                  ]}
                />
              </View>

              <View style={s.progressLabels}>
                <Text style={s.progressLabel}>
                  {cefr ?? 'A1'}
                </Text>

                <Text style={s.progressLabel}>
                  C1
                </Text>

              </View>

            </View>

            {/* Motivation */}

            <View style={s.motivationRow}>

              <View style={s.badgeCircle}>
                <Text style={s.badgeIcon}>✦</Text>
              </View>

              <View style={{ flex: 1 }}>

                <Text style={s.motivationTitle}>
                  You're doing great!
                </Text>

                <Text style={s.motivationSubtitle}>
                  Keep practicing to reach Advanced.
                </Text>

              </View>

            </View>

          </LinearGradient>
        </TouchableOpacity>

        {/* session card  */}
        {/* Start Conversation */}
        <SectionHeader title="Start a Conversation" />

        <TouchableOpacity
          activeOpacity={0.9}
          style={s.startCard}
          onPress={() => router.push('/(app)/session')}
        >

          <LinearGradient
            colors={['#FFFFFF', '#FFF7FA']}
            style={s.startGradient}
          >

            <View style={s.startIcon}>
              <IconMic
                size={28}
                color={T.rose600}
              />
            </View>

            <View style={{ flex: 1 }}>

              <Text style={s.startTitle}>
                Begin your next conversation
              </Text>

              <Text style={s.startSubtitle}>
                Echo will automatically choose the best practice session based on your current level.
              </Text>

            </View>

            <View style={s.startArrow}>
              <IconChevronRight
                size={14}
                color="#9CA3AF"
              />
            </View>

          </LinearGradient>

        </TouchableOpacity>

        {/* progress Card  */}
        <View style={s.progressCard}>
          <View style={s.progressHeader}>
            <Text style={s.progressTitle}>
              Your Progress
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(app)/history')}
            >
              <Text style={s.progressAction}>
                View details →
              </Text>
            </TouchableOpacity>
          </View>

          <View style={s.progressStats}>
            <View style={s.progressItem}>
              <View style={s.progressIconPink}>
              <IconChat size={16} color={T.rose600}/>
              </View>
              <Text style={s.progressValue}>
                {totalSess}
              </Text>
              <Text style={s.progressText}>
                Conversations
              </Text>

            </View>

            <View style={s.progressDivider} />

            <View style={s.progressItem}>

              <View style={s.progressIconBlue}>
              <IconChart size={16} color="#3B82F6" />
              </View>
              <Text style={s.progressValue}>
                {streak}
              </Text>

              <Text style={s.progressText}>
                Day streak
              </Text>

            </View>

            <View style={s.progressDivider} />

            <View style={s.progressItem}>
              <View style={s.progressIconPurple}>
              <IconClipboard size={16} color="#8B5CF6" /> </View>
              <Text style={s.progressValue}>
                {confidenceScore}%
              </Text>
              <Text style={s.progressText}>
                Confidence
              </Text>

            </View>

          </View>

        </View>

        {/* ── Recent sessions ── */}
        {
          recent.length > 0 && (
            <>
              <SectionHeader title="Recent" action="View all" onAction={() => router.push('/(app)/history')} />
              <View style={{ gap: 7, marginTop: 12, marginBottom: 24 }}>
                {recent.map((sess: any, i: number) => {

                  return (
                    <View key={i} style={s.recentRow}>
                      <View style={[s.recentModePill, { backgroundColor: T.rose100 + '18' }]}>
                        <Text style={[s.recentModeText, { color: T.rose100 }]}>{sess.mode?.toUpperCase()}</Text>
                      </View>
                      <Text style={s.recentDate}>
                        {new Date(sess.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                      <View style={s.recentScores}>
                        {sess.fluency_score ? <ScoreChip score={sess.fluency_score} label="F" /> : null}
                        {sess.grammar_score ? <ScoreChip score={sess.grammar_score} label="G" /> : null}
                        {sess.cefr_score ? <ScoreChip score={sess.cefr_score} /> : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )
        }

      </ScrollView >
      <BottomTabBar active="home" />
    </View >
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bgSubtle },
  content: { paddingBottom: 48, paddingHorizontal: Spacing.screenH },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, backgroundColor: T.bg, marginHorizontal: -Spacing.screenH, paddingHorizontal: Spacing.screenH, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: T.border },
  greeting: { fontFamily: Fonts.medium, fontSize: 12, color: T.muted, letterSpacing: 0.1 },
  handle: { fontFamily: Fonts.bold, fontSize: 21, color: T.charcoal, letterSpacing: -0.5, lineHeight: 26 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 4 },
  avatar: { width: 38, height: 38, borderRadius: 999, backgroundColor: T.rose100, borderWidth: 1.5, borderColor: T.rose200, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: Fonts.bold, fontSize: 14, color: T.rose600 },

  // Offline
  offlineBanner: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FCD34D', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 16, alignItems: 'center' },
  offlineText: { fontFamily: Fonts.medium, fontSize: 13, color: '#92400E' },

  // Recent
  recentRow: { backgroundColor: T.bg, borderWidth: 1, borderColor: T.borderStrong, borderRadius: 13, padding: 11, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  recentModePill: { height: 24, paddingHorizontal: 9, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  recentModeText: { fontFamily: Fonts.bold, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase' },
  recentDate: { fontFamily: Fonts.medium, fontSize: 13, color: T.charcoal, flex: 1 },
  recentScores: { flexDirection: 'row', gap: 5 },

  heroContainer: {
    position: 'relative',
    zIndex: 0,
  },

  heroRobot: {
    position: 'absolute',
    right: -2,
    bottom: -55,
    width: 170,
    height: 220,
    zIndex: 0,
  },


  heroText: {
    flex: 1,
    paddingRight: 0,
    marginBottom: 23,
  },

  heroTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    lineHeight: 24,
    color: T.charcoal,
    letterSpacing: -0.4,
  },

  heroSubtitle: {
    marginTop: 10,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },

  robot: {
    width: 185,
    height: 145,
    resizeMode: 'contain',
    position: 'absolute',
    marginRight: -10,
    marginBottom: -10,
  },

  // new styles
  levelCard: {
    position: 'relative',
    zIndex: 5,

    borderRadius: 26,
    padding: 22,
    overflow: 'hidden',
  },

  levelGlowTop: {
    position: 'absolute',
    right: -25,
    top: -30,
    width: 140,
    height: 140,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  levelGlowBottom: {
    position: 'absolute',
    right: 40,
    bottom: -55,
    width: 120,
    height: 120,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  levelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  levelLabel: {
    fontFamily: Fonts.semibold,
    fontSize: 8,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.1,
  },

  levelCurrent: {
    marginTop: 4,
    fontFamily: Fonts.bold,
    fontSize: 48,
    color: '#FFF',
    lineHeight: 50,
  },

  levelNext: {
    marginTop: 4,
    fontFamily: Fonts.bold,
    fontSize: 52,
    color: '#FFE27A',
    lineHeight: 50,
  },

  levelSubtitle: {
    marginTop: 4,
    fontFamily: Fonts.medium,
    fontSize: 8,
    color: 'rgba(255,255,255,0.85)',
  },

  progressContainer: {
    marginBottom: 12,
  },

  progressTrack: {
    height: 6,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  progressFill: {
    height: 6,
    borderRadius: 50,
    backgroundColor: '#FFD15B',
  },

  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  progressLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 8,
    fontFamily: Fonts.medium,
  },

  motivationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  badgeCircle: {
    width: 28,
    height: 28,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  badgeIcon: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: '700',
  },

  motivationTitle: {
    color: '#FFF',
    fontFamily: Fonts.semibold,
    fontSize: 12,
  },

  motivationSubtitle: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.82)',
    fontFamily: Fonts.regular,
    fontSize: 10,
  },

  // progress styles
  progressCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 22,
    marginBottom: 30,

    ...Shadow.card,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  progressTitle: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: T.charcoal,
  },

  progressAction: {
    fontFamily: Fonts.medium,
    color: '#8A8FA2',
    fontSize: 8,
  },

  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressItem: {
    flex: 1,
    alignItems: 'center',
  },

  progressDivider: {
    width: 1,
    backgroundColor: '#ECECEC',
    marginHorizontal: 12,
  },

  progressValue: {
    marginTop: 10,
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: T.charcoal,
  },

  progressText: {
    marginTop: 4,
    fontFamily: Fonts.medium,
    fontSize: 9,
    color: '#7B8495',
  },

  progressIconPink: {
    width: 32,
    height: 32,
    borderRadius: 21,
    backgroundColor: '#FFE7F1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressIconBlue: {
    width: 32,
    height: 32,
    borderRadius: 21,
    backgroundColor: '#EAF5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressIconPurple: {
    width: 32,
    height: 32,
    borderRadius: 21,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // session card styles 
  startCard: {
    marginTop: 14,
    marginBottom: 24,
    borderRadius: 22,
    overflow: 'hidden',
    ...Shadow.card,
  },

  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 22,
  },

  startIcon: {
    width: 40,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#FFE8F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },

  startTitle: {
    fontFamily: Fonts.semibold,
    fontSize: 12,
    color: T.charcoal,
  },

  startSubtitle: {
    marginTop: 6,
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 14,
  },

  startArrow: {
    marginLeft: 12,
  },


}); 