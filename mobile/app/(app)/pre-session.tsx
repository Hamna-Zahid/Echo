import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { T, Fonts, Spacing, MODES, ERROR_TYPES } from '../../constants/tokens';
import { EchoButton, MicroLabel, AccentChip } from '../../components/echo/shared';
import { IconClose, IconMic, IconChart, IconBriefcase, IconChat, IconBuilding, IconWaveform, IconClipboard } from '../../components/echo/icons';
import { api } from '../../services/api';

function getModeIcon(modeId: string, color: string, size = 14) {
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

const MODE_DESCS: Record<string, string> = {
  'Diagnostic':           "A structured 5-turn speaking assessment. Echo acts as a senior IELTS examiner — no corrections during the test. You'll receive a full band breakdown after.",
  'IELTS Training':       'Echo leads the conversation and steers topics toward your top recurring errors. Correction cards surface silently without interrupting your flow.',
  'Interview Prep':       'Echo plays a senior interviewer. Warm-up questions lead to behavioral and situational rounds. One precise coaching note at the end.',
  'Daily Conversation':   'Casual, free-flowing dialogue. Build fluency and natural rhythm without the pressure of formal assessment.',
  'Professional English': 'Echo plays a work colleague or client. Practice meetings, proposals, giving feedback — professional register throughout.',
  'Accent Training':      "Shadow Echo's speech, repeat each phrase, and receive an immediate pronunciation score. Focused drills for clarity and rhythm.",
};

// Human-readable labels for error types stored in the DB
const ERROR_TYPE_LABELS: Record<string, string> = {
  TENSE:       'Tense consistency',
  ARTICLE:     'Article usage',
  PREPOSITION: 'Preposition choice',
  COLLOCATION: 'Collocation errors',
  AGREEMENT:   'Subject-verb agreement',
  VOCAB:       'Vocabulary precision',
  FILLER:      'Filler words',
};

export default function PreSessionScreen() {
  const insets = useSafeAreaInsets();
  const { modeId, mode } = useLocalSearchParams<{ modeId: string; mode: string }>();
  const modeData = MODES.find(m => m.id === modeId) || MODES[1];
  const [accent, setAccent] = useState<'American' | 'British'>('American');
  const [recurringErrors, setRecurringErrors] = useState<{ type: string; label: string; color: string; bg: string }[]>([]);
  const [errorsLoading, setErrorsLoading] = useState(true);

  useEffect(() => {
    loadRecurringErrors();
  }, []);

  const loadRecurringErrors = async () => {
    try {
      const data = await api.get('/sessions/errors/recurring');
      const errors: any[] = data.errors || [];
      const top3 = errors.slice(0, 3).map((e: any) => {
        const type = (e.error_type || 'VOCAB').toUpperCase();
        const cfg = ERROR_TYPES[type] || { color: T.rose600, bg: T.rose50, label: type };
        return {
          type,
          label: ERROR_TYPE_LABELS[type] || cfg.label || type,
          color: cfg.color,
          bg: cfg.bg,
        };
      });
      setRecurringErrors(top3);
    } catch (_) {
      // Non-fatal — targeting card just won't show
    } finally {
      setErrorsLoading(false);
    }
  };

  const startSession = () => {
    const sid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    router.push({
      pathname: '/(app)/session',
      params: { sessionId: sid, mode: mode || modeData.mode, accent: accent.toLowerCase() },
    });
  };

  return (
    <View style={s.root}>
      {/* Top */}
      <View style={[s.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}>
          <IconClose color={T.charcoal} size={13} />
        </TouchableOpacity>
        <View style={[s.modePill, { backgroundColor: modeData.bg }]}>
          {getModeIcon(modeData.id, modeData.color, 14)}
          <Text style={[s.modePillText, { color: modeData.color }]}>{modeData.id.toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>{modeData.id}</Text>
        <Text style={s.desc}>{MODE_DESCS[modeData.id] || MODE_DESCS['IELTS Training']}</Text>

        {/* Settings card */}
        <View style={s.settingsCard}>
          {/* Accent row */}
          <View style={s.settingsRow}>
            <Text style={s.settingsLabel}>Accent</Text>
            <View style={s.accentOptions}>
              {(['American', 'British'] as const).map(a => (
                <TouchableOpacity
                  key={a}
                  onPress={() => setAccent(a)}
                  style={[s.accentOpt, {
                    borderColor: accent === a ? modeData.color : T.borderStrong,
                    backgroundColor: accent === a ? modeData.bg : '#fff',
                  }]}
                  activeOpacity={0.75}>
                  <AccentChip accent={a} small />
                  <Text style={[s.accentOptText, { color: accent === a ? modeData.color : T.muted, fontFamily: accent === a ? Fonts.bold : Fonts.regular }]}>
                    {a === 'American' ? 'US' : 'UK'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Error targeting — only shown when user has real recurring errors */}
        {errorsLoading ? (
          <View style={[s.targetCard, { alignItems: 'center', paddingVertical: 20 }]}>
            <ActivityIndicator size="small" color={T.rose400} />
          </View>
        ) : recurringErrors.length > 0 ? (
          <View style={s.targetCard}>
            <MicroLabel style={{ color: T.rose400, marginBottom: 10 }}>Targeting your top errors</MicroLabel>
            {recurringErrors.map(e => (
              <View key={e.type} style={s.targetRow}>
                <View style={[s.targetDot, { backgroundColor: e.color }]} />
                <Text style={s.targetText}>{e.label}</Text>
                <View style={[s.targetTypePill, { backgroundColor: e.bg }]}>
                  <Text style={[s.targetTypeText, { color: e.color }]}>{e.type}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + 10 }]}>
        <EchoButton label="Begin Session" onPress={startSession} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bg },
  topBar:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.screenH, paddingBottom: 12 },
  closeBtn:  { width: 36, height: 36, borderRadius: 10, backgroundColor: T.bgSubtle, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' },
  modePill:  { flexDirection: 'row', alignItems: 'center', gap: 7, height: 28, paddingHorizontal: 14, borderRadius: 999 },
  modePillText: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase' },

  content: { paddingHorizontal: Spacing.screenH, paddingTop: 20, paddingBottom: 24 },
  title:   { fontFamily: Fonts.bold, fontSize: 24, color: T.charcoal, letterSpacing: -0.5, marginBottom: 10 },
  desc:    { fontFamily: Fonts.regular, fontSize: 14, color: T.slate, lineHeight: 22, marginBottom: 24 },

  settingsCard: { borderWidth: 1, borderColor: T.borderStrong, borderRadius: 16, overflow: 'hidden', marginBottom: 14 },
  settingsRow:  { minHeight: 54, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  settingsLabel: { fontFamily: Fonts.regular, fontSize: 15, color: T.charcoal, flex: 1 },
  accentOptions: { flexDirection: 'row', gap: 6 },
  accentOpt:     { height: 28, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', gap: 6 },
  accentOptText: { fontSize: 12 },

  targetCard: { backgroundColor: T.rose50, borderWidth: 1, borderColor: T.rose200, borderRadius: 14, padding: 14 },
  targetRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  targetDot:  { width: 6, height: 6, borderRadius: 999, flexShrink: 0 },
  targetText: { fontFamily: Fonts.regular, fontSize: 14, color: T.slate, flex: 1 },
  targetTypePill: { height: 20, paddingHorizontal: 7, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  targetTypeText: { fontFamily: Fonts.bold, fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase' },

  footer: { paddingHorizontal: Spacing.screenH, paddingTop: 10, borderTopWidth: 1, borderTopColor: T.border, backgroundColor: T.bg },
});
