import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';
import { C, FONT, RADIUS } from '../../constants/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace('/(app)');
    } catch (e: any) {
      Alert.alert('Sign in failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.inner}>

        {/* Logo */}
        <View style={s.logoRow}>
          <View style={s.logoMark} />
          <Text style={s.logoText}>EchoCoach</Text>
        </View>
        <Text style={s.sub}>AI English coaching for IELTS Band 7+</Text>

        {/* Divider */}
        <View style={s.divider} />

        {/* Inputs */}
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
          placeholder="••••••••"
          placeholderTextColor={C.textDim}
          value={password}
          onChangeText={setPassword}
          onFocus={() => setFocused('password')}
          onBlur={() => setFocused(null)}
          secureTextEntry
        />

        {/* CTA */}
        <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
          {loading
            ? <ActivityIndicator color={C.text} size="small" />
            : <Text style={s.btnText}>Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={s.linkRow}>
          <Text style={s.linkText}>No account? </Text>
          <Text style={[s.linkText, s.linkHighlight]}>Create one</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, justifyContent: 'center' },
  inner: { paddingHorizontal: 28, paddingBottom: 32 },

  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  logoMark: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: C.blue600,
    shadowColor: C.blue600, shadowOpacity: 0.6, shadowRadius: 12, shadowOffset: { width: 0, height: 0 },
  },
  logoText: { fontSize: FONT['3xl'], fontWeight: '700', color: C.text, letterSpacing: -0.5 },
  sub: { fontSize: FONT.sm, color: C.textSub, marginBottom: 28 },
  divider: { height: 1, backgroundColor: C.border, marginBottom: 28 },

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

  btn: {
    backgroundColor: C.blue600,
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
    shadowColor: C.blue600, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
  },
  btnText: { color: C.text, fontSize: FONT.md, fontWeight: '700', letterSpacing: 0.2 },

  linkRow: { flexDirection: 'row', justifyContent: 'center' },
  linkText: { fontSize: FONT.sm, color: C.textSub },
  linkHighlight: { color: C.blue400, fontWeight: '600' },
});
