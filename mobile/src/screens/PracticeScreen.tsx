import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  practiceApi,
  type AnswerResult,
  type PracticeMode,
  type SessionResult,
  type StudentQuestion,
} from '../api/practice';
import { colors, type, space, radius } from '../theme';
import type { PracticeScreenProps } from '../navigation';
import { Screen, AppBar, Card, Button, StateScreen } from '../components/ui';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

function mmss(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function PracticeScreen({ navigation, route }: PracticeScreenProps) {
  const {
    sessionId,
    subjectName,
    topicName,
    mode,
    totalSeconds,
  } = route.params;

  const [questions, setQuestions] = useState<StudentQuestion[]>([]);
  const [cursor, setCursor] = useState(0);
  const [revealed, setRevealed] = useState<Record<string, AnswerResult>>({});
  const [busy, setBusy] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);

  // Wall-clock, so the count stays honest if the JS thread stalls.
  const startedAt = useRef(Date.now());
  const [remaining, setRemaining] = useState(totalSeconds);

  const load = useCallback(async () => {
    try {
      setBusy(true);
      setError(null);
      const { questions: qs } = await practiceApi.questions(sessionId);
      setQuestions(qs);
      // Resume on the first unanswered question.
      const next = qs.findIndex((q) => q.selected_answer === null);
      setCursor(next === -1 ? 0 : next);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Could not load this session');
    } finally {
      setBusy(false);
    }
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (mode !== 'timed' || !totalSeconds) return;
    const tick = setInterval(() => {
      const left = Math.max(
        0,
        totalSeconds - Math.floor((Date.now() - startedAt.current) / 1000),
      );
      setRemaining(left);
      if (left === 0) {
        clearInterval(tick);
        // Running out of time ends the attempt, exactly as an exam would.
        void end('completed');
      }
    }, 1000);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, totalSeconds]);

  const elapsed = () => Math.floor((Date.now() - startedAt.current) / 1000);

  async function end(status: 'completed' | 'abandoned') {
    if (ending) return;
    setEnding(true);
    try {
      const result: SessionResult = await practiceApi.finish(sessionId, {
        elapsed_seconds: elapsed(),
        status,
      });
      navigation.replace('Result', {
        mode: result.mode,
        percentage: result.percentage ?? 0,
        correct: result.correct_count,
        skipped: result.skipped_count,
        total: result.total_questions,
        elapsedSeconds: result.elapsed_seconds ?? 0,
        topicName,
        subjectName,
        reviewCount: result.review?.length ?? 0,
      });
    } catch {
      setEnding(false);
      setError('Could not save your marks. Try again.');
    }
  }

  async function choose(optionIndex: number) {
    if (submitting || revealed[questions[cursor].id]) return;
    setSubmitting(true);
    try {
      const res = await practiceApi.answer(sessionId, {
        question_id: questions[cursor].id,
        selected_answer: optionIndex,
        time_taken: elapsed(),
      });
      setRevealed((prev) => ({ ...prev, [questions[cursor].id]: res }));
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questions[cursor].id ? { ...q, selected_answer: optionIndex } : q,
        ),
      );
    } catch {
      setError('Could not submit that answer');
    } finally {
      setSubmitting(false);
    }
  }

  async function skip() {
    if (submitting || revealed[questions[cursor].id]) return;
    setSubmitting(true);
    try {
      const res = await practiceApi.answer(sessionId, {
        question_id: questions[cursor].id,
        selected_answer: null,
      });
      setRevealed((prev) => ({ ...prev, [questions[cursor].id]: res }));
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questions[cursor].id ? { ...q, selected_answer: null } : q,
        ),
      );
    } catch {
      setError('Could not skip that question');
    } finally {
      setSubmitting(false);
    }
  }

  const answeredCount = useMemo(
    () => questions.filter((q) => q.selected_answer !== null).length,
    [questions],
  );

  if (busy) {
    return (
      <Screen>
        <AppBar title={topicName} onBack={() => navigation.goBack()} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (error && questions.length === 0) {
    return (
      <Screen>
        <AppBar title={topicName} onBack={() => navigation.goBack()} />
        <StateScreen
          icon="cloud-offline-outline"
          title="Couldn't load this session"
          body={error}
          actionLabel="Try again"
          onAction={load}
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
          body="No questions are available for this session."
          actionLabel="Go back"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  const q = questions[cursor];
  const result = revealed[q.id];
  const shown = result;
  const isLast = cursor + 1 >= questions.length;

  return (
    <Screen>
      <AppBar
        title={topicName}
        onBack={() => navigation.goBack()}
        trailing={
          mode === 'timed' ? (
            <View style={s.timer}>
              <Ionicons
                name="timer-outline"
                size={15}
                color={remaining < 60 ? colors.error : colors.onSurfaceVariant}
              />
              <Text
                style={[
                  s.timerText,
                  remaining < 60 && s.timerTextWarn,
                ]}
              >
                {mmss(remaining)}
              </Text>
            </View>
          ) : (
            <Text style={s.counter}>
              {cursor + 1}/{questions.length}
            </Text>
          )
        }
      />

      {/* Progress: answered vs total, so "how far am I" is always visible. */}
      <View style={s.railTrack}>
        <View
          style={[
            s.railFill,
            { width: `${(answeredCount / questions.length) * 100}%` },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.metaRow}>
          <Text style={s.meta}>
            Question {cursor + 1} of {questions.length}
          </Text>
          {mode === 'untimed' ? (
            <Text style={s.meta}>{answeredCount} answered</Text>
          ) : null}
        </View>

        <Card style={s.questionCard}>
          <Text style={s.question}>{q.question_text_si}</Text>
        </Card>

        <View style={s.options}>
          {q.options.map((option, i) => {
            const isChosen = q.selected_answer === i;
            const isKey = shown && shown.correct_index === i;
            const isWrongPick = shown && isChosen && !shown.is_correct;

            return (
              <Card
                key={i}
                onPress={() => choose(i)}
                background={
                  isKey
                    ? colors.correctTint
                    : isWrongPick
                      ? colors.incorrectTint
                      : isChosen
                        ? colors.selectedTint
                        : colors.surface
                }
                borderColor={
                  isKey
                    ? colors.correctBorder
                    : isWrongPick
                      ? colors.incorrectBorder
                      : isChosen
                        ? colors.selectedBorder
                        : colors.outlineVariant
                }
                borderWidth={isKey || isWrongPick ? 2 : 1}
                style={s.optionCard}
              >
                <View style={s.optionRow}>
                  <Text style={s.optionLetter}>{LETTERS[i]}</Text>
                  <Text style={s.optionText}>{option.text_si}</Text>
                  {isKey ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.correctBorder}
                    />
                  ) : null}
                  {isWrongPick ? (
                    <Ionicons
                      name="close-circle"
                      size={22}
                      color={colors.incorrectBorder}
                    />
                  ) : null}
                </View>
              </Card>
            );
          })}
        </View>

        {shown ? (
          <Card style={s.feedbackCard} background={colors.surfaceContainer}>
            <View style={s.feedbackHeader}>
              <Ionicons
                name={shown.is_skipped ? 'arrow-redo-outline' : shown.is_correct ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={
                  shown.is_skipped
                    ? colors.onSurfaceVariant
                    : shown.is_correct
                      ? colors.correctBorder
                      : colors.error
                }
              />
              <Text style={s.feedbackTitle}>
                {shown.is_skipped
                  ? 'මඟ හැර දැම්මා'
                  : shown.is_correct
                    ? 'නිවැරදියි'
                    : 'වැරදියි'}
              </Text>
              {!shown.is_correct && !shown.is_skipped ? (
                <Text style={s.correctHint}>
                  නිවැරදි: {LETTERS[shown.correct_index]}
                </Text>
              ) : null}
            </View>
            {shown.explanation_si ? (
              <Text style={s.feedbackBody}>{shown.explanation_si}</Text>
            ) : null}
          </Card>
        ) : null}
      </ScrollView>

      {/* Navigation: free movement, plus explicit skip and end. */}
      <View style={s.footer}>
        <View style={s.navRow}>
          <Button
            label="Back"
            icon="arrow-back"
            variant="tonal"
            onPress={() => setCursor((c) => Math.max(0, c - 1))}
            disabled={cursor === 0}
          />
          {shown && !isLast ? (
            <Button label="Next" icon="arrow-forward" onPress={() => setCursor((c) => c + 1)} />
          ) : null}
          {!shown ? (
            <Button
              label="Skip"
              icon="arrow-redo-outline"
              variant="tonal"
              onPress={skip}
              disabled={submitting}
            />
          ) : null}
        </View>

        <View style={s.endRow}>
          <Button
            label="End session and see marks"
            icon="flag-outline"
            variant="text"
            onPress={() => end(isLast ? 'completed' : 'abandoned')}
            disabled={ending}
          />
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  timer: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  timerText: { color: colors.onSurfaceVariant, ...type.titleSmall },
  timerTextWarn: { color: colors.error },
  counter: { color: colors.onSurfaceVariant, ...type.bodyMedium },

  railTrack: { height: 4, backgroundColor: colors.surfaceContainer },
  railFill: { height: 4, backgroundColor: colors.primary },

  content: { padding: space.lg, paddingBottom: space.xxl },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  meta: { color: colors.onSurfaceVariant, ...type.bodySmall },

  questionCard: { padding: space.lg, marginBottom: space.lg },
  question: { color: colors.onSurface, ...type.titleMedium },

  options: { gap: space.md },
  optionCard: { borderRadius: radius.md },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.lg,
    gap: space.md,
  },
  optionLetter: {
    color: colors.onSurfaceVariant,
    minWidth: 20,
    ...type.titleSmall,
  },
  optionText: { flex: 1, color: colors.onSurface, ...type.bodyLarge },

  feedbackCard: { padding: space.lg, marginTop: space.xl },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  feedbackTitle: { color: colors.onSurface, ...type.titleSmall },
  correctHint: { color: colors.onSurfaceVariant, ...type.bodySmall },
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
  navRow: { gap: space.md },
  endRow: { marginTop: space.sm },
});