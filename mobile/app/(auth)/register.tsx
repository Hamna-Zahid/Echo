import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase';
import { T, Fonts, Radius, Spacing } from '../../constants/tokens';
import { EchoLogo, EchoButton, EchoInput, EchoChip, MicroLabel, AccentChip } from '../../components/echo/shared';

const EXAM_OPTIONS = ['IELTS', 'TOEFL', 'Job Interview', 'General English'] as const;

export default function RegisterScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [goal, setGoal]         = useState('IELTS');
  const [accent, setAccent]     = useState<'American' | 'British'>('American');
  const [loading, setLoading]   = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      // Step 1: Create account via backend (creates profile row)
      await api.post('/auth/register', {
        email, password,
        target_exam: goal,
        preferred_accent: accent.toLowerCase(),
      });
      // Step 2: Sign in with Supabase to get a full persisted session
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw new Error(signInError.message);
      router.replace('/(auth)/post-reg');
    } catch (e: any) {
      Alert.alert('Registration failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">

        <View style={s.logoRow}>
          <EchoLogo size={30} />
        </View>

        <Text style={s.title}>Create your account.</Text>

        <View style={{ gap: 12, marginBottom: 24 }}>
          <EchoInput
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <EchoInput
            placeholder="Password (min. 8 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <MicroLabel style={{ marginBottom: 10 }}>Your Goal</MicroLabel>
        <View style={s.chipRow}>
          {EXAM_OPTIONS.map((g) => (
            <EchoChip key={g} label={g} active={goal === g} onPress={() => setGoal(g)} />
          ))}
        </View>

        <MicroLabel style={{ marginBottom: 10 }}>Preferred Accent</MicroLabel>
        <View style={s.accentRow}>
          {(['American', 'British'] as const).map((a) => (
            <TouchableOpacity
              key={a}
              onPress={() => setAccent(a)}
              style={[s.accentOption, { borderColor: accent === a ? T.rose600 : T.borderStrong, backgroundColor: accent === a ? T.rose50 : '#fff' }]}
              activeOpacity={0.75}>
              <AccentChip accent={a} />
              <Text style={[s.accentLabel, { color: accent === a ? T.rose600 : T.charcoal, fontFamily: accent === a ? Fonts.semibold : Fonts.regular }]}>
                {a}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.btnWrap}>
          {loading
            ? <View style={s.btnLoading}><ActivityIndicator color="#fff" /></View>
            : <EchoButton label="Create Account" onPress={handleRegister} />}
        </View>

        <View style={s.bottomRow}>
          <Text style={s.bottomText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.bottomLink}> Sign in</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: T.bg },
  inner: { paddingHorizontal: Spacing.screenH, paddingTop: 64, paddingBottom: 48 },

  logoRow: { marginBottom: 32 },
  title:   { fontFamily: Fonts.bold, fontSize: 28, color: T.charcoal, letterSpacing: -0.6, marginBottom: 24 },

  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 24 },

  accentRow:   { flexDirection: 'row', gap: 10, marginBottom: 28 },
  accentOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    height: 48, paddingHorizontal: 14, borderRadius: 12,
    borderWidth: 1.5,
  },
  accentLabel: { fontSize: 14 },

  btnWrap:    { marginBottom: 16 },
  btnLoading: {
    height: 56, borderRadius: Radius.button, backgroundColor: T.rose600,
    alignItems: 'center', justifyContent: 'center',
  },

  bottomRow:  { flexDirection: 'row', justifyContent: 'center' },
  bottomText: { fontFamily: Fonts.regular, fontSize: 14, color: T.muted },
  bottomLink: { fontFamily: Fonts.semibold, fontSize: 14, color: T.rose600 },
});
