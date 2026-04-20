import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';
import { T, Fonts, Radius, Spacing } from '../../constants/tokens';
import { EchoLogo, EchoButton, EchoInput } from '../../components/echo/shared';

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

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
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">

        <View style={s.logoRow}>
          <EchoLogo size={30} />
        </View>

        <Text style={s.title}>Welcome back.</Text>
        <Text style={s.sub}>Sign in to continue your coaching.</Text>

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

        <TouchableOpacity style={s.forgotRow} onPress={() => {}}>
          <Text style={s.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <View style={s.btnWrap}>
          {loading
            ? <View style={s.btnLoading}><ActivityIndicator color="#fff" /></View>
            : <EchoButton label="Sign In" onPress={handleLogin} />}
        </View>

        {/* Divider */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>or</Text>
          <View style={s.dividerLine} />
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
  inner: { paddingHorizontal: Spacing.screenH, paddingTop: 64, paddingBottom: 48 },

  logoRow:    { marginBottom: 32 },
  title:      { fontFamily: Fonts.bold, fontSize: 28, color: T.charcoal, letterSpacing: -0.6, marginBottom: 6 },
  sub:        { fontFamily: Fonts.regular, fontSize: 15, color: T.muted, marginBottom: 28 },

  eyeText:    { fontFamily: Fonts.semibold, fontSize: 12, color: T.rose400 },
  forgotRow:  { alignSelf: 'flex-end', marginBottom: 22 },
  forgotText: { fontFamily: Fonts.medium, fontSize: 14, color: T.rose500 },

  btnWrap:    { marginBottom: 24 },
  btnLoading: {
    height: 56, borderRadius: Radius.button, backgroundColor: T.rose600,
    alignItems: 'center', justifyContent: 'center',
  },

  dividerRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: T.border },
  dividerText: { fontFamily: Fonts.regular, fontSize: 12, color: T.muted, letterSpacing: 0.2 },

  bottomRow:  { flexDirection: 'row', justifyContent: 'center' },
  bottomText: { fontFamily: Fonts.regular, fontSize: 14, color: T.muted },
  bottomLink: { fontFamily: Fonts.semibold, fontSize: 14, color: T.rose600 },
});
