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
import { supabase } from '../../services/supabase';
import { T, Fonts, Radius, Spacing } from '../../constants/tokens';
import { EchoLogo, EchoButton, EchoInput, GoogleSignInButton } from '../../components/echo/shared';

// Required by expo-web-browser to complete OAuth redirect back into the app
WebBrowser.maybeCompleteAuthSession();

async function sendPasswordReset(emailAddr: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(emailAddr.trim());
  if (error) Alert.alert('Error', error.message);
  else Alert.alert('Email sent', `A reset link was sent to ${emailAddr.trim()}. Check your inbox.`);
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading]  = useState(false);

  // ── Forgot password ─────────────────────────────────────────
  const handleForgotPassword = () => {
    const target = email.trim();
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Reset password',
        'Enter your account email address',
        async (inputEmail) => {
          const addr = inputEmail?.trim() || target;
          if (!addr) {
            Alert.alert('Required', 'Type your email in the field above first.');
            return;
          }
          await sendPasswordReset(addr);
        },
        'plain-text',
        target,
      );
    } else {
      if (!target) {
        Alert.alert('Enter your email', 'Type your email address above, then tap Forgot password again.');
        return;
      }
      Alert.alert(
        'Reset password',
        `Send a reset link to ${target}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Send reset link', onPress: () => sendPasswordReset(target) },
        ],
      );
    }
  };

  // ── Email + password login ───────────────────────────────────
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      router.replace('/(app)');
    } catch (error) {
      const message =
          error instanceof Error
              ? error.message
              : 'Something went wrong.';
  
      Alert.alert('Sign in failed', message);
  }
  };

  // ── Google OAuth ─────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      // Build the redirect URL for this device (Expo Go vs production build)
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

      // Open OAuth page in a browser tab; on success it deep-links back to us
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success') {
        // Exchange the auth code from the redirect URL for a real session
        await supabase.auth.exchangeCodeForSession(result.url);
        router.replace('/(app)');
      }
    } catch (e: any) {
      Alert.alert('Google sign-in failed', e.message || 'Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[s.inner, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">

        <View style={s.logoRow}>
          <EchoLogo size={30} />
        </View>

        <Text style={s.title}>Welcome back.</Text>
        <Text style={s.sub}>Sign in to continue your coaching.</Text>

        {/* Google sign-in — primary CTA at top */}
        <View style={{ marginBottom: 16 }}>
          <GoogleSignInButton onPress={handleGoogleSignIn} loading={googleLoading} />
        </View>

        {/* Divider */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>or sign in with email</Text>
          <View style={s.dividerLine} />
        </View>

        <View style={{ gap: 12, marginBottom: 8 }}>
          <EchoInput
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <EchoInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPass(!showPass)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={s.eyeText}>{showPass ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            }
          />
        </View>

        <TouchableOpacity style={s.forgotRow} onPress={handleForgotPassword}>
          <Text style={s.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <View style={s.btnWrap}>
          {loading
            ? <View style={s.btnLoading}><ActivityIndicator color="#fff" /></View>
            : <EchoButton label="Sign In" onPress={handleLogin} />}
        </View>

        <View style={s.bottomRow}>
          <Text style={s.bottomText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={s.bottomLink}> Create one</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: T.bg },
  inner: { paddingHorizontal: Spacing.screenH },

  logoRow:    { marginBottom: 32 },
  title:      { fontFamily: Fonts.bold, fontSize: 28, color: T.charcoal, letterSpacing: -0.6, marginBottom: 6 },
  sub:        { fontFamily: Fonts.regular, fontSize: 15, color: T.slate, marginBottom: 28 },

  eyeText:    { fontFamily: Fonts.semibold, fontSize: 12, color: T.rose400 },
  forgotRow:  { alignSelf: 'flex-end', marginBottom: 22 },
  forgotText: { fontFamily: Fonts.medium, fontSize: 14, color: T.rose500 },

  btnWrap:    { marginBottom: 24 },
  btnLoading: {
    height: 56, borderRadius: Radius.button, backgroundColor: T.rose600,
    alignItems: 'center', justifyContent: 'center',
  },

  dividerRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: T.border },
  dividerText: { fontFamily: Fonts.regular, fontSize: 12, color: T.slate, letterSpacing: 0.2 },

  bottomRow:  { flexDirection: 'row', justifyContent: 'center' },
  bottomText: { fontFamily: Fonts.regular, fontSize: 14, color: T.slate },
  bottomLink: { fontFamily: Fonts.semibold, fontSize: 14, color: T.rose600 },
});
