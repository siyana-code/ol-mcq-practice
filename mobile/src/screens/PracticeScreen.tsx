import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import apiClient from '../api/client';
import { Question } from '../types';
import { colors, type, space, radius } from '../theme';
import type { PracticeScreenProps } from '../navigation';
import { Screen, AppBar, Card, Button, StateScreen } from '../components/ui';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/** Resolves the visual state of an option row. */
function optionState(
  index: number,
  correctIndex: number,
  selected: number | null,
  revealed: boolean,
) {
  if (!revealed) {
    return {
      background: colors.surface,
      border: colors.outlineVariant,
      badge: colors.surfaceContainer,
      badgeText: colors.onSurfaceVariant,
    };
  }
  if (index === correctIndex) {
    return {
      background: colors.correctTint,
      border: colors.correctBorder,
      badge: colors.correctBorder,
      badgeText: colors.onSuccess,
    };
  }
  if (index === selected) {
    return {
      background: colors.incorrectTint,
      border: colors.incorrectBorder,
      badge: colors.incorrectBorder,
      badgeText: colors.onError,
    };
  }
  return {
    background: colors.surface,
    border: colors.outlineVariant,
    badge: colors.surfaceContainer,
    badgeText: colors.onSurfaceVariant,
  };
}

export default function PracticeScreen({ navigation, route }: PracticeScreenProps) {
  const { topicId, topicName } = route.params;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get<Question[]>(
        '/questions',
        // A full Paper I is 40 MCQs; topics get populated to that size.
        { params: { topic_id: topicId, limit: 40 } },
      );
      setQuestions(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const choose = (optionIndex: number) => {
    if (revealed) return;
    setSelected(optionIndex);
    setRevealed(true);
    if (optionIndex === questions[index].correct_answer) {
      setScore((n) => n + 1);
    }
  };

  const advance = () => {
    if (index + 1 >= questions.length) {
      navigation.navigate('Result', {
        // `score` is read after this state update commits, so compute it here.
        score: score + (selected === questions[index].correct_answer ? 1 : 0),
        total: questions.length,
        topicName,
      });
      return;
    }
    setIndex((n) => n + 1);
    setSelected(null);
    setRevealed(false);
  };

  if (loading) {
    return (
      <Screen>
        <AppBar title={topicName} onBack={() => navigation.goBack()} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <AppBar title={topicName} onBack={() => navigation.goBack()} />
        <StateScreen
          icon="cloud-offline-outline"
          title="Couldn't load questions"
          body={error}
          actionLabel="Try again"
          onAction={fetchQuestions}
          tone="error"
        />
      </Screen>
    );
  }

  if (questions.length === 0) {
    return (
      <Screen>
        <AppBar title={topicName} onBack={() => navigation.goBack()} />
        <StateScreen
          icon="document-text-outline"
          title="ප්‍රශ්න ඉක්මන්ට එයි"
          body="This topic has no questions yet. Past paper questions are being added — try another topic in the meantime."
          actionLabel="Choose another topic"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  const q = questions[index];
  const isCorrect = selected === q.correct_answer;
  const isLast = index + 1 >= questions.length;

  return (
    <Screen>
      <AppBar
        title={topicName}
        onBack={() => navigation.goBack()}
        trailing={
          <Text style={s.counter}>
            {index + 1}/{questions.length}
          </Text>
        }
      />

      {/* Progress rail */}
      <View style={s.railTrack}>
        <View
          style={[
            s.railFill,
            { width: `${((index + 1) / questions.length) * 100}%` },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <Card style={s.questionCard}>
          <Text style={s.question}>{q.question_text_si}</Text>
        </Card>

        <View style={s.options}>
          {q.options.map((option, i) => {
            const st = optionState(i, q.correct_answer, selected, revealed);
            return (
              <Card
                key={i}
                onPress={() => choose(i)}
                background={st.background}
                borderColor={st.border}
                borderWidth={revealed && (i === q.correct_answer || i === selected) ? 2 : 1}
                style={s.optionCard}
              >
                <View style={s.optionRow}>
                  <View style={[s.badge, { backgroundColor: st.badge }]}>
                    <Text style={[s.badgeText, { color: st.badgeText }]}>
                      {LETTERS[i]}
                    </Text>
                  </View>
                  <Text style={s.optionText}>{option.text_si}</Text>
                  {revealed && i === q.correct_answer ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.correctBorder} />
                  ) : null}
                  {revealed && i === selected && i !== q.correct_answer ? (
                    <Ionicons name="close-circle" size={22} color={colors.incorrectBorder} />
                  ) : null}
                </View>
              </Card>
            );
          })}
        </View>

        {revealed ? (
          <Card
            background={isCorrect ? colors.correctTint : colors.warningContainer}
            borderColor={isCorrect ? colors.correctBorder : colors.warning}
            style={s.feedbackCard}
          >
            <View style={s.feedbackHeader}>
              <Ionicons
                name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                size={22}
                color={isCorrect ? colors.correctBorder : colors.error}
              />
              <Text style={s.feedbackTitle}>
                {isCorrect ? 'නිවැරදියි' : 'වැරදියි'}
              </Text>
              {!isCorrect ? (
                <Text style={s.correctHint}>
                  නිවැරදි පිළිතුර: {LETTERS[q.correct_answer]}
                </Text>
              ) : null}
            </View>
            {q.explanation_si ? <Text style={s.feedbackBody}>{q.explanation_si}</Text> : null}
          </Card>
        ) : null}
      </ScrollView>

      {revealed ? (
        <View style={s.footer}>
          <Button
            label={isLast ? 'See results' : 'Next question'}
            onPress={advance}
            icon={isLast ? 'trophy-outline' : 'arrow-forward'}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  counter: {
    color: colors.onSurfaceVariant,
    ...type.bodyMedium,
  },

  railTrack: {
    height: 4,
    backgroundColor: colors.surfaceContainer,
  },
  railFill: {
    height: 4,
    backgroundColor: colors.primary,
  },

  content: {
    padding: space.lg,
    paddingBottom: space.xxl,
  },

  questionCard: {
    padding: space.lg,
    marginBottom: space.xl,
  },
  question: {
    color: colors.onSurface,
    ...type.titleMedium,
    fontWeight: '500',
  },

  options: {
    gap: space.md,
  },
  optionCard: {
    borderRadius: radius.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.lg,
    gap: space.md,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...type.labelLarge,
  },
  optionText: {
    flex: 1,
    color: colors.onSurface,
    ...type.bodyLarge,
  },

  feedbackCard: {
    padding: space.lg,
    marginTop: space.xl,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  feedbackTitle: {
    color: colors.onSurface,
    ...type.titleSmall,
  },
  correctHint: {
    color: colors.onSurfaceVariant,
    ...type.bodySmall,
  },
  feedbackBody: {
    color: colors.onSurfaceVariant,
    marginTop: space.md,
    ...type.bodyMedium,
  },

  footer: {
    padding: space.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHigh,
  },
});