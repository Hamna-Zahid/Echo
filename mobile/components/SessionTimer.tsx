import { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { C, FONT } from '../constants/colors';

export default function SessionTimer({ active }: { active: boolean }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  return <Text style={s.t}>{mm}:{ss}</Text>;
}

const s = StyleSheet.create({
  t: { color: C.textDim, fontSize: FONT.sm, fontVariant: ['tabular-nums'], minWidth: 40, textAlign: 'right' },
});
