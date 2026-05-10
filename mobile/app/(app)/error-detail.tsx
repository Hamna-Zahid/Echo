import { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { api } from '../../services/api';
import { T, Fonts, Spacing, Shadow } from '../../constants/tokens';
import { EchoButton, MicroLabel } from '../../components/echo/shared';
import { IconChevronLeft, IconArrow } from '../../components/echo/icons';

const ERROR_TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  TENSE:       { color: '#F59E0B', bg: '#FEF3C7' },
  ARTICLE:     { color: '#0EA5E9', bg: '#E0F2FE' },
  PREPOSITION: { color: '#8B5CF6', bg: '#EDE9FE' },
  COLLOCATION: { color: '#F43F8E', bg: '#FCE7F3' },
  AGREEMENT:   { color: '#F97316', bg: '#FEF0E6' },
  VOCAB:       { color: '#6366F1', bg: '#EEF2FF' },
  FILLER:      { color: '#0D9488', bg: '#F0FDFA' },
};

const ERROR_TYPE_RULES: Record<string, { title: string; rule: string; example: string }> = {
  TENSE: {
    title: 'Tense error',
    rule: 'Use present perfect continuous for actions that started in the past and are still ongoing. "Since" and "for" with present actions always require this form.',
    example: '"I\'ve been working at this company since 2019, and it has been a great learning experience."',
  },
  ARTICLE: {
    title: 'Article error',
    rule: 'Use "the" for specific nouns previously mentioned or uniquely identified. Use "a/an" for non-specific references. Superlatives always take "the".',
    example: '"She is the best student in the class — everyone agrees on that."',
  },
  PREPOSITION: {
    title: 'Preposition error',
    rule: 'Prepositions are determined by the verb or adjective they follow. Common pairs: interested in, good at, depend on, responsible for, result in.',
    example: '"I\'m very interested in this role and I believe I\'m good at solving problems."',
  },
  COLLOCATION: {
    title: 'Collocation error',
    rule: 'Certain words naturally pair together in English. Using the wrong combination sounds unnatural even if the meaning is clear. Learn common verb-noun and adjective-noun pairs.',
    example: '"She made a significant contribution to the project, not \'did a big contribution\'."',
  },
  AGREEMENT: {
    title: 'Subject-verb agreement',
    rule: 'The verb must agree with its subject in number and person. Singular subjects take singular verbs. Collective nouns are usually singular.',
    example: '"The team is working hard" — not "The team are working hard" (in American English).',
  },
  VOCAB: {
    title: 'Vocabulary upgrade',
    rule: 'Using more precise and sophisticated vocabulary improves your lexical score. Replace vague or informal words with accurate, context-appropriate alternatives.',
    example: '"The results were exceptional" — stronger than "very good".',
  },
  FILLER: {
    title: 'Filler words',
    rule: 'Filler words like "um", "uh", "like", "you know", "basically" reduce fluency. Replace them with a brief pause or restructure the sentence for coherence.',
    example: '"To answer your question..." instead of "Well, um, basically, like, I think..."',
  },
};

export default function ErrorDetailScreen() {
  const insets = useSafeAreaInsets();
  const {
    errorId, errorType, originalUtterance, correctedForm,
    explanation, recurrenceCount,
  } = useLocalSearchParams<{
    errorId?: string;
    errorType?: string;
    originalUtterance?: string;
    correctedForm?: string;
    explanation?: string;
    recurrenceCount?: string;
  }>();

  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [resolving, setResolving]     = useState(false);
  const [loading, setLoading]         = useState(false);

  const type = (errorType || 'TENSE').toUpperCase();
  const cfg  = ERROR_TYPE_COLORS[type] || { color: T.rose600, bg: T.rose50 };
  const rule = ERROR_TYPE_RULES[type]  || ERROR_TYPE_RULES['VOCAB'];
  const count = recurrenceCount ? parseInt(recurrenceCount, 10) : 1;

  useEffect(() => {
    if (errorId) loadOccurrences();
  }, []);

  const loadOccurrences = async () => {
    try {
      setLoading(true);
      // Fetch recent errors of this type from sessions
      const data = await api.get(`/sessions/errors/recurring`);
      const all: any[] = data.errors || [];
      const matches = all.filter((e: any) =>
        (e.error_type || '').toUpperCase() === type && e.id !== errorId,
      ).slice(0, 3);
      setOccurrences(matches);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const handleResolve = async () => {
    if (!errorId) return;
    Alert.alert(
      'Mark as resolved?',
      'This error will be hidden from your recurring errors list.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark resolved',
          style: 'default',
          onPress: async () => {
            try {
              setResolving(true);
              if (errorId) {
                await api.patch(`/sessions/errors/${errorId}/resolve`, {});
              }
              router.back();
            } catch (e) {
              console.error('resolve error', e);
              router.back(); // Navigate back even if API fails
            } finally {
              setResolving(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={[s.content, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <IconChevronLeft color={T.charcoal} size={16} />
        </TouchableOpacity>
        <View style={[s.typePill, { backgroundColor: cfg.bg }]}>
          <Text style={[s.typePillText, { color: cfg.color }]}>{type}</Text>
        </View>
      </View>

      {/* Title */}
      <View style={{ marginBottom: 20 }}>
        <Text style={s.title}>{rule.title}</Text>
        <Text style={s.titleSub}>
          Seen {count} {count === 1 ? 'time' : 'times'} across your sessions · Still active
        </Text>
      </View>

      {/* Rule */}
      <View style={[s.section, { backgroundColor: T.bgSubtle }]}>
        <MicroLabel style={{ marginBottom: 10 }}>The Rule</MicroLabel>
        <Text style={s.ruleText}>{rule.rule}</Text>
        {(originalUtterance || correctedForm) && (
          <View style={s.exampleBox}>
            {originalUtterance && (
              <Text style={s.exampleOriginal}>"{originalUtterance}"</Text>
            )}
            {originalUtterance && correctedForm && (
              <View style={{ marginVertical: 4 }}>
                <IconArrow color={T.muted} size={13} />
              </View>
            )}
            {correctedForm && (
              <Text style={s.exampleCorrected}>{correctedForm}</Text>
            )}
          </View>
        )}
      </View>

      {/* Usage example */}
      <View style={{ marginBottom: 18 }}>
        <MicroLabel style={{ marginBottom: 10 }}>Usage Example</MicroLabel>
        <View style={s.quoteBox}>
          <Text style={s.quoteText}>{rule.example}</Text>
        </View>
      </View>

      {/* Explanation from backend */}
      {explanation ? (
        <View style={[s.section, { backgroundColor: T.bg, borderWidth: 1, borderColor: T.borderStrong, marginBottom: 18 }]}>
          <MicroLabel style={{ marginBottom: 8 }}>Correction Note</MicroLabel>
          <Text style={s.ruleText}>{explanation}</Text>
        </View>
      ) : null}

      {/* Occurrences */}
      <View style={{ marginBottom: 24 }}>
        <MicroLabel style={{ marginBottom: 10 }}>Your Occurrences</MicroLabel>
        <View style={{ gap: 7 }}>
          {/* The current one */}
          {originalUtterance && (
            <View style={s.occurrenceRow}>
              <Text style={s.occurrenceSession}>This session</Text>
              <Text style={s.occurrenceQuote}>"{originalUtterance}"</Text>
            </View>
          )}
          {/* Past similar ones */}
          {occurrences.map((o: any, i: number) => (
            <View key={i} style={s.occurrenceRow}>
              <Text style={s.occurrenceSession}>
                {new Date(o.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · Past session
              </Text>
              <Text style={s.occurrenceQuote}>"{o.original_utterance}"</Text>
            </View>
          ))}
          {occurrences.length === 0 && !originalUtterance && (
            <Text style={s.empty}>No occurrences recorded yet.</Text>
          )}
        </View>
      </View>

      {/* Actions */}
      <EchoButton
        label="Practice this in a session"
        onPress={() => router.replace('/(app)')}
      />
      <TouchableOpacity style={s.resolveLink} onPress={handleResolve} disabled={resolving}>
        <Text style={s.resolveLinkText}>{resolving ? 'Marking…' : 'Mark as resolved'}</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bg },
  content: {
    paddingHorizontal: Spacing.screenH,
  },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 18,
    paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: T.border,
    marginHorizontal: -Spacing.screenH,
    paddingHorizontal: Spacing.screenH,
    backgroundColor: T.bg,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: T.bgSubtle, borderWidth: 1, borderColor: T.border,
    alignItems: 'center', justifyContent: 'center',
  },
  typePill: {
    height: 27, paddingHorizontal: 12, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  typePillText: { fontFamily: Fonts.bold, fontSize: 10, letterSpacing: 0.9, textTransform: 'uppercase' },

  title:    { fontFamily: Fonts.bold, fontSize: 22, color: T.charcoal, letterSpacing: -0.5, marginBottom: 5 },
  titleSub: { fontFamily: Fonts.medium, fontSize: 13, color: T.muted },

  section: { borderRadius: 16, padding: 16, marginBottom: 18 },

  ruleText: { fontFamily: Fonts.regular, fontSize: 14, color: T.slate, lineHeight: 23, letterSpacing: -0.1 },

  exampleBox: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: T.borderStrong,
    borderRadius: 10, padding: 12, paddingHorizontal: 14, marginTop: 12,
  },
  exampleOriginal:  { fontFamily: Fonts.regular, fontSize: 13, color: T.charcoal, textDecorationLine: 'line-through', textDecorationColor: '#EF4444' },
  exampleCorrected: { fontFamily: Fonts.bold,    fontSize: 13, color: T.charcoal },

  quoteBox: {
    backgroundColor: T.rose50, borderLeftWidth: 3, borderLeftColor: T.rose400,
    borderRadius: 12, borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
    padding: 12, paddingHorizontal: 16,
  },
  quoteText: { fontFamily: Fonts.regular, fontSize: 14, color: T.slate, fontStyle: 'italic', lineHeight: 22, letterSpacing: -0.1 },

  occurrenceRow: {
    backgroundColor: T.bgSubtle, borderWidth: 1, borderColor: T.border,
    borderRadius: 12, padding: 11, paddingHorizontal: 14,
  },
  occurrenceSession: { fontFamily: Fonts.semibold, fontSize: 11, color: T.muted, marginBottom: 4, letterSpacing: 0.1 },
  occurrenceQuote:   { fontFamily: Fonts.regular,  fontSize: 13, color: T.charcoal, fontStyle: 'italic' },

  resolveLink:     { alignItems: 'center', paddingTop: 14 },
  resolveLinkText: { fontFamily: Fonts.semibold, fontSize: 13, color: T.success, letterSpacing: -0.1 },

  empty: { fontFamily: Fonts.regular, fontSize: 14, color: T.muted, textAlign: 'center', paddingVertical: 16 },
});
