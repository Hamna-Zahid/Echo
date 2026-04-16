import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase';
import { C, FONT, RADIUS } from '../../constants/colors';

const EXAM_OPTIONS = ['IELTS', 'TOEFL', 'INTERVIEW'] as const;
const ACCENT_OPTIONS = [
  { key: 'american', label: 'American' },
  { key: 'british', label: 'British' },
] as const;

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetExam, setTargetExam] = useState<string>('IELTS');
  const [accent, setAccent] = useState<string>('american');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        email, password, target_exam: targetExam, preferred_accent: accent,
      });
      if (res.access_token) {
        await supabase.auth.setSession({ access_token: res.access_token, refresh_token: '' });
        router.replace('/(app)');
      }
    } catch (e: any) {
      Alert.alert('Registration failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">

        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={s.backText}>← Sign In</Text>
        </TouchableOpacity>

        <Text style={s.title}>Create account</Text>
        <Text style={s.sub}>Set up your coaching profile</Text>

        <View style={s.divider} />

        <Text style={s.label}>Email</Text>
        <TextInput
          style={[s.input, focused === 'email' && s.inputFocused]}
          placeholder="you@example.com"
          placeholderTextColor={C.textDim}
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={s.label}>Password</Text>
        <TextInput
          style={[s.input, focused === 'password' && s.inputFocused]}
          placeholder="Min. 8 characters"
          placeholderTextColor={C.textDim}
          value={password}
          onChangeText={setPassword}
          onFocus={() => setFocused('password')}
          onBlur={() => setFocused(null)}
          secureTextEntry
        />

        <Text style={s.label}>Target Exam</Text>
        <View style={s.chipRow}>
          {EXAM_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[s.chip, targetExam === opt && s.chipActive]}
              onPress={() => setTargetExam(opt)}
            >
              <Text style={[s.chipText, targetExam === opt && s.chipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Preferred Accent</Text>
        <View style={s.chipRow}>
          {ACCENT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[s.chip, accent === opt.key && s.chipActive]}
              onPress={() => setAccent(opt.key)}
            >
              <Text style={[s.chipText, accent === opt.key && s.chipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
          {loading
            ? <ActivityIndicator color={C.text} size="small" />
            : <Text style={s.btnText}>Create Account</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  inner: { paddingHorizontal: 28, paddingTop: 64, paddingBottom: 48 },

  back: { marginBottom: 28 },
  backText: { color: C.blue400, fontSize: FONT.sm, fontWeight: '500' },

  title: { fontSize: FONT['3xl'], fontWeight: '700', color: C.text, letterSpacing: -0.5, marginBottom: 6 },
  sub: { fontSize: FONT.sm, color: C.textSub, marginBottom: 24 },
  divider: { height: 1, backgroundColor: C.border, marginBottom: 24 },

  label: { fontSize: FONT.xs, fontWeight: '600', color: C.textSub, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  input: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: FONT.md,
    color: C.text,
    marginBottom: 20,
  },
  inputFocused: { borderColor: C.blue600 },

  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 24 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: C.border,
    backgroundColor: C.surface,
  },
  chipActive: { backgroundColor: C.blue600 + '22', borderColor: C.blue600 },
  chipText: { color: C.textSub, fontSize: FONT.sm, fontWeight: '500' },
  chipTextActive: { color: C.blue400, fontWeight: '700' },

  btn: {
    backgroundColor: C.blue600,
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: C.blue600, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
  },
  btnText: { color: C.text, fontSize: FONT.md, fontWeight: '700', letterSpacing: 0.2 },
});
