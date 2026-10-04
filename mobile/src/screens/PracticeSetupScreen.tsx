import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { practiceApi, type PracticeMode } from '../api/practice';
import { colors, type, space, radius } from '../theme';
import type { PracticeSetupScreenProps } from '../navigation';
import { Screen, AppBar, Card, Button } from '../components/ui';

const OPTIONS: {
  mode: PracticeMode;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  si: string;
  body: string;
}[] = [
  {
    mode: 'untimed',
    icon: 'walk-outline',
    title: 'Practise at your own pace',
    si: 'ඔබගේ වේගයෙන්',
    body: 'No clock. Skip anything, come back later, and stop whenever you want.',
  },
  {
    mode: 'timed',
    icon: 'timer-outline',
    title: 'Run the clock',
    si: 'කාලය ගණන් කරන්න',
    body: 'A countdown runs for the whole paper, closer to real exam conditions.',
  },
];

/**
 * The student chooses how to practise before anything starts. Both modes allow
 * skipping and ending on their own terms, so this choice only decides whether
 * a clock runs.
 */
export default function PracticeSetupScreen({
  navigation,
  route,
}: PracticeSetupScreenProps) {
  const { subjectId, subjectName, topicId, topicName, questionCount } = route.params;

  const [mode, setMode] = useState<PracticeMode>('untimed');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ~75s per question matches a typical OL MCQ paper pace.
  const suggestedSeconds = questionCount * 75;

  async function start() {
    if (starting) return;
    setStarting(true);
    setError(null);
    try {
      const session = await practiceApi.start({
        subject_id: subjectId,
        topic_id: topicId,
        mode,
        limit: questionCount,
      });
      navigation.replace('Practice', {
        sessionId: session.id,
        subjectName,
        topicName,
        mode,
        totalSeconds: mode === 'timed' ? suggestedSeconds : 0,
      });
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Could not start a session');
      setStarting(false);
    }
  }

  return (
    <Screen>
      <AppBar title={topicName} onBack={() => navigation.goBack()} />

      <View style={s.content}>
        <Text style={s.heading}>How do you want to practise?</Text>
        <Text style={s.sub}>
          {questionCount} question{questionCount === 1 ? '' : 's'} · {subjectName}
        </Text>

        <View>
          {OPTIONS.map((opt) => {
            const selected = mode === opt.mode;
            return (
              <Card
                key={opt.mode}
                onPress={() => setMode(opt.mode)}
                background={selected ? colors.selectedTint : colors.surface}
                borderColor={selected ? colors.selectedBorder : colors.outlineVariant}
                borderWidth={selected ? 2 : 1}
                style={s.card}
              >
                <View style={s.cardInner}>
                  <View style={[s.icon, selected && s.iconSelected]}>
                    <Ionicons
                      name={opt.icon}
                      size={22}
                      color={selected ? colors.onPrimary : colors.onSurfaceVariant}
                    />
                  </View>
                  <View style={s.cardText}>
                    <Text style={s.cardTitle}>{opt.title}</Text>
                    <Text style={s.cardSi}>{opt.si}</Text>
                    <Text style={s.cardBody}>{opt.body}</Text>
                    {opt.mode === 'timed' ? (
                      <Text style={s.cardMeta}>
                        Suggested time: {Math.round(suggestedSeconds / 60)} min
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={selected ? colors.primary : colors.outline}
                  />
                </View>
              </Card>
            );
          })}
        </View>

        <Text style={s.footnote}>
          Skip questions, go back to change an answer, and end the session whenever
          you like. Your marks appear when you finish.
        </Text>

        {error ? (
          <View style={s.alert}>
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text style={s.alertText}>{error}</Text>
          </View>
        ) : null}
      </View>

      <View style={s.footer}>
        {starting ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Button label="Start practising" icon="play" onPress={start} />
        )}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  content: {
    flex: 1,
    padding: space.lg,
  },
  heading: {
    color: colors.onSurface,
    ...type.headlineSmall,
  },
  sub: {
    color: colors.onSurfaceVariant,
    marginTop: space.xs,
    marginBottom: space.xl,
    ...type.bodyMedium,
  },
  card: {
    marginBottom: space.md,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: space.lg,
    gap: space.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
  },
  iconSelected: {
    backgroundColor: colors.primary,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    color: colors.onSurface,
    ...type.titleSmall,
  },
  cardSi: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
    ...type.bodySmall,
  },
  cardBody: {
    color: colors.onSurfaceVariant,
    marginTop: space.sm,
    ...type.bodySmall,
    lineHeight: 18,
  },
  cardMeta: {
    color: colors.primary,
    marginTop: space.sm,
    ...type.bodySmall,
  },
  footnote: {
    color: colors.onSurfaceVariant,
    marginTop: space.lg,
    ...type.bodySmall,
    lineHeight: 18,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.errorContainer,
    borderRadius: radius.sm,
    padding: space.md,
    marginTop: space.lg,
  },
  alertText: {
    flex: 1,
    color: colors.onErrorContainer,
    ...type.bodyMedium,
  },
  footer: {
    padding: space.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHigh,
  },
});