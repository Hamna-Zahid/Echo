import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, Alert, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';
import { api } from '../../services/api';
import { T, Fonts, Spacing } from '../../constants/tokens';
import { MicroLabel, ScoreChip, StreakChip } from '../../components/echo/shared';
import { IconChevronLeft, IconChevronRight } from '../../components/echo/icons';

type RowItem = {
  label: string;
  detail?: string;
  onPress?: () => void;
  danger?: boolean;
  muted?: boolean;
  noChevron?: boolean;
  isLast?: boolean;
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [user, setUser]       = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      const data = await api.get('/sessions/progress/summary');
      setProfile(data?.user);
    } catch (e) { console.error(e); }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out', style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleForgotPassword = (email: string) => {
    // Reused from login — kept here for "change password via email" flow
    if (!email) {
      Alert.alert('Error', 'No email address on file.');
      return;
    }
    Alert.alert(
      'Reset password',
      `Send a password reset link to ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send link',
          onPress: async () => {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) Alert.alert('Error', error.message);
            else Alert.alert('Sent', 'Check your inbox for a password reset link.');
          },
        },
      ],
    );
  };

  const handleChangePassword = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'New password',
        'Enter your new password (min. 6 characters)',
        async (newPassword) => {
          if (!newPassword || newPassword.length < 6) {
            Alert.alert('Too short', 'Password must be at least 6 characters.');
            return;
          }
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          if (error) Alert.alert('Error', error.message);
          else Alert.alert('Done', 'Your password has been updated.');
        },
        'secure-text',
      );
    } else {
      // Android: use reset email as the secure alternative
      const email = user?.email;
      handleForgotPassword(email);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account, all sessions, and error history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete permanently', style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/auth/account');
              await supabase.auth.signOut();
              router.replace('/(auth)/login');
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Account deletion failed. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handleRateEcho = () => {
    const url = Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/echocoach/id0000000000'
      : 'https://play.google.com/store/apps/details?id=com.echocoach.app';
    Linking.openURL(url).catch(() =>
      Alert.alert('Not available', 'App store link not available yet.')
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://echocoach.app/privacy').catch(() =>
      Alert.alert('Not available', 'Privacy policy link not available yet.')
    );
  };

  // ── Derived display values ────────────────────────────────────────────────

  const handle = user?.email?.split('@')[0] ?? 'Learner';
  const initial = handle[0]?.toUpperCase() ?? 'L';
  const cefr   = profile?.cefr_level;
  const ielts  = profile?.ielts_score;
  const streak = profile?.streak_days || 0;
  const exam   = profile?.target_exam || 'IELTS';
  const accentRaw = profile?.preferred_accent || 'american';
  const accentDisplay = accentRaw.charAt(0).toUpperCase() + accentRaw.slice(1);

  const groups: { section: string; items: RowItem[] }[] = [
    {
      section: 'COACHING PREFERENCES',
      items: [
        { label: 'Target exam',      detail: exam },
        { label: 'Preferred accent', detail: accentDisplay, isLast: true },
      ],
    },
    {
      section: 'ACCOUNT',
      items: [
        { label: 'Email',            detail: user?.email, noChevron: true },
        { label: 'Change password',  onPress: handleChangePassword },
        { label: 'Delete account',   onPress: handleDeleteAccount, danger: true, isLast: true },
      ],
    },
    {
      section: 'APP',
      items: [
        { label: 'Rate Echo',        onPress: handleRateEcho },
        { label: 'Privacy policy',   onPress: handlePrivacyPolicy },
        { label: 'Version 1.0.0',    muted: true, isLast: true },
      ],
    },
  ];

  return (
    <ScrollView style={s.root} contentContainerStyle={[s.content, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <IconChevronLeft color={T.charcoal} size={16} />
        </TouchableOpacity>
        <Text style={s.title}>Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Avatar block */}
      <View style={s.avatarBlock}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initial}</Text>
        </View>
        <Text style={s.name}>{handle}</Text>
        <Text style={s.emailText}>{user?.email}</Text>
        <View style={s.badgeRow}>
          {cefr  && <ScoreChip score={cefr} />}
          {ielts && <ScoreChip score={ielts} label="IELTS" />}
          {streak > 0 && <StreakChip count={streak} />}
        </View>
      </View>

      {/* Settings groups */}
      {groups.map(g => (
        <View key={g.section} style={{ marginBottom: 22 }}>
          <MicroLabel style={{ marginBottom: 8 }}>{g.section}</MicroLabel>
          <View style={s.groupCard}>
            {g.items.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[s.row, !item.isLast && s.rowBorder]}
                activeOpacity={item.muted ? 1 : 0.65}
                onPress={item.onPress}
                disabled={!item.onPress && !item.danger}
              >
                <Text style={[
                  s.rowLabel,
                  item.danger && { color: T.errorText },
                  item.muted  && { color: T.muted },
                ]}>
                  {item.label}
                </Text>
                {item.detail && (
                  <Text style={s.rowDetail}>{item.detail}</Text>
                )}
                {!item.muted && !item.noChevron && item.onPress && (
                  <IconChevronRight color={T.muted} size={13} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Sign out */}
      <TouchableOpacity onPress={handleSignOut} style={s.signOutBtn}>
        <Text style={s.signOutText}>Sign out</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bgSubtle },
  content: { paddingHorizontal: Spacing.screenH },

  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0, backgroundColor: T.bg, marginHorizontal: -Spacing.screenH, paddingHorizontal: Spacing.screenH, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: T.bgSubtle, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' },
  title:   { fontFamily: Fonts.bold, fontSize: 17, color: T.charcoal, letterSpacing: -0.4 },

  avatarBlock: { backgroundColor: T.bg, marginHorizontal: -Spacing.screenH, paddingHorizontal: Spacing.screenH, paddingVertical: 24, alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: T.border, marginBottom: 24 },
  avatar:      { width: 72, height: 72, borderRadius: 999, backgroundColor: T.rose100, borderWidth: 2, borderColor: T.rose200, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontFamily: Fonts.bold, fontSize: 26, color: T.rose600, letterSpacing: -1 },
  name:        { fontFamily: Fonts.semibold, fontSize: 17, color: T.charcoal, letterSpacing: -0.3 },
  emailText:   { fontFamily: Fonts.regular, fontSize: 13, color: T.muted },
  badgeRow:    { flexDirection: 'row', gap: 7, alignItems: 'center', marginTop: 2 },

  groupCard: { backgroundColor: T.bg, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: T.borderStrong },
  row:       { height: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: T.border },
  rowLabel:  { fontFamily: Fonts.regular, fontSize: 15, color: T.charcoal, flex: 1, letterSpacing: -0.1 },
  rowDetail: { fontFamily: Fonts.regular, fontSize: 13, color: T.muted, marginRight: 6 },

  signOutBtn:  { alignItems: 'center', paddingVertical: 12 },
  signOutText: { fontFamily: Fonts.semibold, fontSize: 15, color: T.rose500, letterSpacing: -0.1 },
});
