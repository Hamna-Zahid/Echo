import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '../../services/api';
import { T, Fonts, Spacing, Shadow } from '../../constants/tokens';
import { EchoButton, EchoLogo, MicroLabel } from '../../components/echo/shared';
import { IconCheck, IconClipboard, IconBriefcase, IconBuilding, IconChat } from '../../components/echo/icons';

const LEVELS = [
  'A2 – Elementary',
  'B1 – Pre-intermediate',
  'B1+ – Intermediate',
  'B2 – Upper intermediate',
  'C1 – Advanced',
];

const GOALS = [
  { icon: <IconClipboard color={T.rose600} size={20} />, label: 'IELTS Band 7+' },
  { icon: <IconBriefcase color={T.rose600} size={20} />, label: 'Job interviews' },
  { icon: <IconBuilding  color={T.rose600} size={20} />, label: 'Professional English' },
  { icon: <IconChat      color={T.rose600} size={20} />, label: 'Everyday fluency' },
];

export default function PostRegScreen() {
  const insets = useSafeAreaInsets();
  const [level, setLevel] = useState<string | null>(null);
  const [goal, setGoal]   = useState<string | null>(null);

  const ready = !!(level && goal);

  const handleContinue = async () => {
    try {
      // Parse CEFR level from the selected string, e.g. "B1 – Pre-intermediate" → "B1"
      const cefrCode = level ? level.split(' ')[0] : null;
      if (cefrCode || goal) {
        await api.patch('/auth/profile', {
          ...(cefrCode && { cefr_level: cefrCode }),
          ...(goal    && { goal }),
        });
      }
    } catch (_) {
      // Non-blocking — proceed even if save fails
    }
    router.replace('/(app)');
  };

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={[s.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={s.logoRow}>
        <EchoLogo size={26} />
      </View>

      <Text style={s.setupLabel}>Quick setup · 30 seconds</Text>

      <Text style={s.h1}>Where are you now?</Text>
      <Text style={s.sub}>
        Your best estimate is fine — Echo calibrates as you practice.
      </Text>

      {/* Level picker */}
      <View style={{ gap: 7, marginBottom: 28 }}>
        {LEVELS.map((l, i) => {
          const active = level === l;
          return (
            <TouchableOpacity
              key={l}
              onPress={() => setLevel(l)}
              activeOpacity={0.75}
              style={[s.levelRow, {
                borderColor: active ? T.rose600 : T.borderStrong,
                backgroundColor: active ? T.rose50 : '#fff',
                shadowOpacity: active ? 0 : 0,
              }]}
            >
              <Text style={[s.levelText, { color: active ? T.rose600 : T.charcoal, fontFamily: active ? Fonts.semibold : Fonts.regular }]}>
                {l}
              </Text>
              {active && (
                <View style={s.levelCheck}>
                  <IconCheck color="#fff" size={12} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Goal grid */}
      <Text style={s.h2}>What's your main goal?</Text>
      <View style={s.goalGrid}>
        {GOALS.map((g) => {
          const active = goal === g.label;
          return (
            <TouchableOpacity
              key={g.label}
              onPress={() => setGoal(g.label)}
              activeOpacity={0.75}
              style={[s.goalCard, {
                borderColor: active ? T.rose600 : T.borderStrong,
                backgroundColor: active ? T.rose50 : '#fff',
              }]}
            >
              <View style={s.goalIcon}>{g.icon}</View>
              <Text style={[s.goalLabel, { color: active ? T.rose600 : T.charcoal, fontFamily: active ? Fonts.semibold : Fonts.regular }]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ marginTop: 4, gap: 10 }}>
        <EchoButton
          label={ready ? 'Start coaching' : 'Skip for now'}
          variant={ready ? 'primary' : 'secondary'}
          onPress={handleContinue}
        />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bg },
  content: {
    paddingHorizontal: Spacing.screenH,
  },

  logoRow:    { marginBottom: 6 },
  setupLabel: { fontFamily: Fonts.medium, fontSize: 12, color: T.muted, letterSpacing: 0.2, marginBottom: 22 },

  h1:  { fontFamily: Fonts.bold, fontSize: 24, color: T.charcoal, letterSpacing: -0.5, marginBottom: 4 },
  sub: { fontFamily: Fonts.regular, fontSize: 14, color: T.muted, lineHeight: 21, marginBottom: 18 },
  h2:  { fontFamily: Fonts.bold, fontSize: 20, color: T.charcoal, letterSpacing: -0.4, marginBottom: 14 },

  levelRow: {
    height: 52, borderRadius: 14, borderWidth: 1.5,
    paddingHorizontal: 16, flexDirection: 'row',
    alignItems: 'center',
  },
  levelText:  { flex: 1, fontSize: 14 },
  levelCheck: {
    width: 20, height: 20, borderRadius: 999,
    backgroundColor: T.rose600,
    alignItems: 'center', justifyContent: 'center',
  },

  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 26 },
  goalCard: {
    width: '47.5%', borderRadius: 16, borderWidth: 1.5,
    padding: 16, paddingHorizontal: 14,
  },
  goalIcon:  { marginBottom: 10 },
  goalLabel: { fontSize: 14, lineHeight: 19 },
});
