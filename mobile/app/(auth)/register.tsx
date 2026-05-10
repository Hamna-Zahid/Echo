import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase';
import { T, Fonts, Radius, Spacing } from '../../constants/tokens';
import {
  EchoLogo, EchoButton, EchoInput,
  EchoChip, MicroLabel, AccentChip, GoogleSignInButton,
} from '../../components/echo/shared';

// Required by expo-web-browser to complete OAuth redirect back into the app
WebBrowser.maybeCompleteAuthSession();

const EXAM_OPTIONS = ['IELTS', 'TOEFL', 'Job Interview', 'General English'] as const;

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [goal, setGoal]             = useState('IELTS');
  const [accent, setAccent]         = useState<'American' | 'British'>('American');
  const [loading, setLoading]       = useState(false);
  const [googleLoading, setGoogle]  = useState(false);

  // ── Email + password registration ───────────────────────────
  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please fill in your name, email, and password.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Too short', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      // Step 1: Create account via backend (creates profile row in users table)
      await api.post('/auth/register', {
        full_name: name.trim(),
        email: email.trim(),
        password,
        target_exam: goal,
        preferred_accent: accent.toLowerCase(),
      });
      // Step 2: Sign in with Supabase to get a full persisted session
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw new Error(signInError.message);
      router.replace('/(auth)/post-reg');
    } catch (e: any) {
      Alert.alert('Registration failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth ─────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    try {
      setGoogle(true);
      const redirectTo = Linking.createURL('/');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data.url) {
        throw error || new Error('Google sign-in could not start. Check Supabase settings.');
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success') {
        await supabase.auth.exchangeCodeForSession(result.url);
        // New Google users skip the manual post-reg screen — go straight to app
        // (they can update profile later from Settings)
        router.replace('/(app)');
      }
    } catch (e: any) {
      Alert.alert('Google sign-in failed', e.message || 'Please try again.');
    } finally {
      setGoogle(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[s.inner, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">

        <View style={s.logoRow}>
          <EchoLogo size={30} />
        </View>

        <Text style={s.title}>Create your account.</Text>
        <Text style={s.sub}>Start speaking better English today.</Text>

        {/* Google sign-in — primary CTA at top */}
        <View style={{ marginBottom: 20 }}>
          <GoogleSignInButton onPress={handleGoogleSignIn} loading={googleLoading} />
        </View>

        {/* Divider */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>or register with email</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Name + email + password */}
        <View style={{ gap: 12, marginBottom: 24 }}>
          <EchoInput
            placeholder="Your full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
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
            secureTextEntry={!showPass}
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowPass(!showPass)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={s.eyeText}>{showPass ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            }
          />
        </View>

        {/* Goal chips */}
        <MicroLabel style={{ marginBottom: 10 }}>Your Goal</MicroLabel>
        <View style={s.chipRow}>
          {EXAM_OPTIONS.map((g) => (
            <EchoChip key={g} label={g} active={goal === g} onPress={() => setGoal(g)} />
          ))}
        </View>

        {/* Accent selector — fixed: AccentChip uses small={true} so only the flag
            renders inside the chip; the label text is the separate external Text */}
        <MicroLabel style={{ marginBottom: 10 }}>Preferred Accent</MicroLabel>
        <View style={s.accentRow}>
          {(['American', 'British'] as const).map((a) => (
            <TouchableOpacity
              key={a}
              onPress={() => setAccent(a)}
              style={[
                s.accentOption,
                {
                  borderColor: accent === a ? T.rose600 : T.borderStrong,
                  backgroundColor: accent === a ? T.rose50 : '#fff',
                },
              ]}
              activeOpacity={0.75}
            >
              {/* small={true} — only renders the flag, no internal text */}
              <AccentChip accent={a} small />
              <Text
                style={[
                  s.accentLabel,
                  {
                    color: accent === a ? T.rose600 : T.charcoal,
                    fontFamily: accent === a ? Fonts.semibold : Fonts.regular,
                  },
                ]}
              >
                {a === 'American' ? '🇺🇸 American' : '🇬🇧 British'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Create account CTA */}
        <View style={s.btnWrap}>
          {loading
            ? <View style={s.btnLoading}><ActivityIndicator color="#fff" /></View>
            : <EchoButton label="Create Account" onPress={handleRegister} />}
        </View>

        <View style={s.bottomRow}>
          <Text style={s.bottomText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={s.bottomLink}> Sign in</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: T.bg },
  inner: { paddingHorizontal: Spacing.screenH },

  logoRow: { marginBottom: 28 },
  title: { fontFamily: Fonts.bold, fontSize: 28, color: T.charcoal, letterSpacing: -0.6, marginBottom: 6 },
  sub: { fontFamily: Fonts.regular, fontSize: 15, color: T.muted, marginBottom: 24 },

  eyeText: { fontFamily: Fonts.semibold, fontSize: 12, color: T.rose400 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: T.border },
  dividerText: { fontFamily: Fonts.regular, fontSize: 12, color: T.muted, letterSpacing: 0.2 },

  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 24 },

  // Accent selector — each option takes exactly half the row width
  accentRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  accentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 50,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  accentLabel: { fontSize: 14, flexShrink: 1 },

  btnWrap: { marginBottom: 16 },
  btnLoading: {
    height: 56, borderRadius: Radius.button, backgroundColor: T.rose600,
    alignItems: 'center', justifyContent: 'center',
  },

  bottomRow: { flexDirection: 'row', justifyContent: 'center' },
  bottomText: { fontFamily: Fonts.regular, fontSize: 14, color: T.muted },
  bottomLink: { fontFamily: Fonts.semibold, fontSize: 14, color: T.rose600 },
});
