import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C, FONT, RADIUS } from '../constants/colors';

type Mode = 'diagnostic' | 'training' | 'interview';

const MODES: {
  key: Mode; label: string; desc: string;
  tag: string; accent: string;
}[] = [
  {
    key: 'diagnostic',
    label: 'Diagnostic',
    desc: 'Assess your CEFR level in 3 minutes',
    tag: '3 min',
    accent: C.blue400,
  },
  {
    key: 'training',
    label: 'Training',
    desc: 'Conversation coaching with live corrections',
    tag: 'Recommended',
    accent: C.cyan,
  },
  {
    key: 'interview',
    label: 'Interview Prep',
    desc: 'STAR-format practice for job interviews',
    tag: 'Professional',
    accent: C.gold,
  },
];

export default function ModeSelector({ onSelect }: { onSelect: (m: Mode) => void }) {
  return (
    <View style={s.container}>
      {MODES.map((m) => (
        <TouchableOpacity
          key={m.key}
          style={s.row}
          onPress={() => onSelect(m.key)}
          activeOpacity={0.7}
        >
          {/* Left accent */}
          <View style={[s.accentBar, { backgroundColor: m.accent }]} />

          <View style={s.textBlock}>
            <View style={s.titleRow}>
              <Text style={s.label}>{m.label}</Text>
              <View style={[s.tag, { borderColor: m.accent + '55', backgroundColor: m.accent + '15' }]}>
                <Text style={[s.tagText, { color: m.accent }]}>{m.tag}</Text>
              </View>
            </View>
            <Text style={s.desc}>{m.desc}</Text>
          </View>

          <Text style={[s.arrow, { color: m.accent }]}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: 1, marginBottom: 32, backgroundColor: C.border, borderRadius: RADIUS.lg, overflow: 'hidden' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, padding: 18, gap: 14,
  },
  accentBar: { width: 3, height: 36, borderRadius: 2 },
  textBlock: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  label: { fontSize: FONT.md, fontWeight: '700', color: C.text },
  tag: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: RADIUS.sm, borderWidth: 1,
  },
  tagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  desc: { fontSize: FONT.sm, color: C.textSub },
  arrow: { fontSize: 22 },
});
