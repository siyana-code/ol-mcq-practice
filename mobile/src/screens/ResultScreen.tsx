import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, type, space, radius } from '../theme';
import type { ResultScreenProps } from '../navigation';
import { Screen, Card, Button, SectionLabel } from '../components/ui';

function bandFor(percent: number) {
  if (percent >= 80) {
    return {
      headline: 'ඉතා හොඳයි',
      en: 'Excellent',
      icon: 'trophy' as const,
      accent: colors.success,
      onAccent: colors.onSuccess,
    };
  }
  if (percent >= 60) {
    return {
      headline: 'හොඳයි',
      en: 'Good job',
      icon: 'thumbs-up' as const,
      accent: colors.primary,
      onAccent: colors.onPrimary,
    };
  }
  if (percent >= 40) {
    return {
      headline: 'තවදුරටත් පුරුදු කරන්න',
      en: 'Keep practising',
      icon: 'fitness' as const,
      accent: colors.warning,
      onAccent: colors.onWarning,
    };
  }
  return {
    headline: 'එහා යන්න එපා',
    en: "Don't give up",
    icon: 'book' as const,
    accent: colors.error,
    onAccent: colors.onError,
  };
}

function duration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (!m) return `${s}s`;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export default function ResultScreen({ navigation, route }: ResultScreenProps) {
  const {
    percentage,
    correct,
    skipped,
    total,
    elapsedSeconds,
    topicName,
    mode,
  } = route.params;

  const band = bandFor(percentage);
  const attempted = correct + skipped;

  const stats = [
    { icon: 'checkmark-circle', tint: colors.success, value: correct, label: 'Correct' },
    { icon: 'arrow-redo-outline', tint: colors.outline, value: skipped, label: 'Skipped' },
    { icon: 'help-circle', tint: colors.primary, value: total, label: 'Total' },
  ] as const;

  return (
    <Screen>
      <View style={s.content}>
        <Text style={s.topic} numberOfLines={2}>
          {topicName}
        </Text>

        <View style={[s.dial, { backgroundColor: band.accent }]}>
          <Ionicons name={band.icon} size={32} color={band.onAccent} />
          <Text style={[s.dialValue, { color: band.onAccent }]}>{percentage}%</Text>
          <Text style={[s.dialFraction, { color: band.onAccent }]}>
            {correct} of {total}
          </Text>
        </View>

        <Text style={[s.band, { color: band.accent }]}>{band.headline}</Text>
        <Text style={s.bandEn}>{band.en}</Text>

        <SectionLabel>Score breakdown</SectionLabel>

        <View style={s.statRow}>
          {stats.map((stat) => (
            <Card key={stat.label} style={s.statCard}>
              <View style={s.statInner}>
                <Ionicons name={stat.icon} size={24} color={stat.tint} />
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            </Card>
          ))}
        </View>

        <View style={s.metaRow}>
          <View style={s.metaItem}>
            <Ionicons
              name={mode === 'timed' ? 'timer-outline' : 'walk-outline'}
              size={16}
              color={colors.onSurfaceVariant}
            />
            <Text style={s.metaText}>
              {mode === 'timed' ? 'Timed' : 'Untimed'} · {duration(elapsedSeconds)}
            </Text>
          </View>
          {skipped > 0 ? (
            <View style={s.metaItem}>
              <Ionicons name="information-circle-outline" size={16} color={colors.onSurfaceVariant} />
              <Text style={s.metaText}>
                {attempted} of {total} attempted
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={s.footer}>
        <Button
          label="Back to home"
          icon="home-outline"
          onPress={() => navigation.navigate('Home')}
        />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
    gap: space.md,
  },
  topic: {
    color: colors.onSurface,
    textAlign: 'center',
    ...type.titleLarge,
  },

  dial: {
    width: 160,
    height: 160,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialValue: { ...type.headlineMedium, marginTop: space.sm },
  dialFraction: { ...type.bodySmall, opacity: 0.85 },

  band: { ...type.headlineSmall, textAlign: 'center' },
  bandEn: { color: colors.onSurfaceVariant, ...type.bodyMedium, marginBottom: space.md },

  statRow: {
    flexDirection: 'row',
    gap: space.md,
    alignSelf: 'stretch',
  },
  statCard: { flex: 1, borderRadius: radius.md },
  statInner: { alignItems: 'center', paddingVertical: space.lg },
  statValue: { color: colors.onSurface, marginTop: space.sm, ...type.headlineSmall },
  statLabel: { color: colors.onSurfaceVariant, marginTop: 2, ...type.bodySmall },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.lg,
    marginTop: space.sm,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  metaText: { color: colors.onSurfaceVariant, ...type.bodySmall },

  footer: {
    padding: space.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHigh,
  },
});