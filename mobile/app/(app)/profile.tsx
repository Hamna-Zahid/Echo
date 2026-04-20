import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';
import { api } from '../../services/api';
import { T, Fonts, Spacing, Shadow } from '../../constants/tokens';
import { MicroLabel, ScoreChip, StreakChip } from '../../components/echo/shared';
import { IconChevronLeft, IconChevronRight } from '../../components/echo/icons';

export default function ProfileScreen() {
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

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out', style: 'destructive',
        onPress: async () => { await supabase.auth.signOut(); router.replace('/(auth)/login'); },
      },
    ]);
  };

  const handle   = user?.email?.split('@')[0] ?? 'Learner';
  const initial  = handle[0]?.toUpperCase() ?? 'L';
  const cefr     = profile?.cefr_level;
  const ielts    = profile?.ielts_score;
  const streak   = profile?.streak_days || 0;
  const exam     = profile?.target_exam || 'IELTS';
  const accent   = profile?.preferred_accent || 'American';

  const groups = [
    {
      section: 'COACHING PREFERENCES',
      items: [
        { label: 'Target exam',    detail: exam },
        { label: 'Target band',    detail: '7.0' },
        { label: 'Preferred accent', detail: accent.charAt(0).toUpperCase() + accent.slice(1) },
        { label: 'Session length', detail: '20 min', isLast: true },
      ],
    },
    {
      section: 'ACCOUNT',
      items: [
        { label: 'Email',           detail: user?.email, noChevron: true },
        { label: 'Change password', isLast: false },
        { label: 'Delete account',  danger: true, isLast: true },
      ],
    },
    {
      section: 'APP',
      items: [
        { label: 'Rate Echo' },
        { label: 'Privacy policy' },
        { label: 'Version 1.0.0', muted: true, isLast: true },
      ],
    },
  ];

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

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
        <Text style={s.email}>{user?.email}</Text>
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
            {g.items.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[s.row, !item.isLast && s.rowBorder]}
                activeOpacity={(item as any).muted ? 1 : 0.65}
                onPress={(item as any).danger ? handleSignOut : undefined}>
                <Text style={[
                  s.rowLabel,
                  (item as any).danger && { color: T.errorText },
                  (item as any).muted  && { color: T.muted },
                ]}>
                  {item.label}
                </Text>
                {(item as any).detail && (
                  <Text style={s.rowDetail}>{(item as any).detail}</Text>
                )}
                {!(item as any).muted && !(item as any).noChevron && (
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
  content: { paddingHorizontal: Spacing.screenH, paddingTop: Platform.OS === 'ios' ? 56 : 44, paddingBottom: 48 },

  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0, backgroundColor: T.bg, marginHorizontal: -Spacing.screenH, paddingHorizontal: Spacing.screenH, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: T.bgSubtle, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' },
  title:   { fontFamily: Fonts.bold, fontSize: 17, color: T.charcoal, letterSpacing: -0.4 },

  avatarBlock: { backgroundColor: T.bg, marginHorizontal: -Spacing.screenH, paddingHorizontal: Spacing.screenH, paddingVertical: 24, alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: T.border, marginBottom: 24 },
  avatar:      { width: 72, height: 72, borderRadius: 999, backgroundColor: T.rose100, borderWidth: 2, borderColor: T.rose200, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontFamily: Fonts.bold, fontSize: 26, color: T.rose600, letterSpacing: -1 },
  name:        { fontFamily: Fonts.semibold, fontSize: 17, color: T.charcoal, letterSpacing: -0.3 },
  email:       { fontFamily: Fonts.regular, fontSize: 13, color: T.muted },
  badgeRow:    { flexDirection: 'row', gap: 7, alignItems: 'center', marginTop: 2 },

  groupCard: { backgroundColor: T.bg, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: T.borderStrong },
  row:       { height: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: T.border },
  rowLabel:  { fontFamily: Fonts.regular, fontSize: 15, color: T.charcoal, flex: 1, letterSpacing: -0.1 },
  rowDetail: { fontFamily: Fonts.regular, fontSize: 13, color: T.muted, marginRight: 6 },

  signOutBtn:  { alignItems: 'center', paddingVertical: 12 },
  signOutText: { fontFamily: Fonts.semibold, fontSize: 15, color: T.rose500, letterSpacing: -0.1 },
});
