import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, type, space, radius } from '../theme';
import type { ResultScreenProps } from '../navigation';
import { Screen, Card, Button, SectionLabel } from '../components/ui';

type Band = {
  headline: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  onAccent: string;
};

function bandFor(percent: number): Band {
  if (percent >= 80) {
    return {
      headline: 'ඉතා හොඳයි',
      icon: 'trophy',
      accent: colors.success,
      onAccent: colors.onSuccess,
    };
  }
  if (percent >= 60) {
    return {
      headline: 'හොඳයි',
      icon: 'thumbs-up',
      accent: colors.primary,
      onAccent: colors.onPrimary,
    };
  }
  if (percent >= 40) {
    return {
      headline: 'තවදුරටත් පුරුදු කරන්න',
      icon: 'fitness',
      accent: colors.warning,
      onAccent: colors.onWarning,
    };
  }
  return {
    headline: 'එහා යන්න එපා',
    icon: 'book',
    accent: colors.error,
    onAccent: colors.onError,
  };
}

export default function ResultScreen({ navigation, route }: ResultScreenProps) {
  const { score, total, topicName } = route.params;

  const percent = Math.round((score / total) * 100);
  const band = bandFor(percent);

  const stats = [
    { icon: 'checkmark-circle', tint: colors.success, value: score, label: 'Correct' },
    { icon: 'close-circle', tint: colors.error, value: total - score, label: 'Incorrect' },
    { icon: 'help-circle', tint: colors.primary, value: total, label: 'Total' },
  ] as const;

  return (
    <Screen>
      <View style={s.content}>
        <Text style={s.topic} numberOfLines={2}>
          {topicName}
        </Text>

        {/* Score dial */}
        <View style={[s.dial, { backgroundColor: band.accent }]}>
          <Ionicons name={band.icon} size={34} color={band.onAccent} />
          <Text style={[s.dialValue, { color: band.onAccent }]}>
            {percent}%
          </Text>
          <Text style={[s.dialFraction, { color: band.onAccent }]}>
            {score} of {total}
          </Text>
        </View>

        <Text style={[s.band, { color: band.accent }]}>{band.headline}</Text>

        <SectionLabel>Score breakdown</SectionLabel>

        <View style={s.statRow}>
          {stats.map((stat) => (
            <Card key={stat.label} style={s.statCard}>
              <View style={s.statInner}>
                <Ionicons name={stat.icon} size={26} color={stat.tint} />
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            </Card>
          ))}
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
    gap: space.lg,
  },
  topic: {
    color: colors.onSurface,
    textAlign: 'center',
    ...type.titleLarge,
  },

  dial: {
    width: 168,
    height: 168,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialValue: {
    ...type.headlineMedium,
    marginTop: space.sm,
  },
  dialFraction: {
    ...type.bodySmall,
    opacity: 0.85,
  },

  band: {
    ...type.headlineSmall,
    textAlign: 'center',
  },

  statRow: {
    flexDirection: 'row',
    gap: space.md,
    alignSelf: 'stretch',
  },
  statCard: {
    flex: 1,
    borderRadius: radius.md,
  },
  statInner: {
    alignItems: 'center',
    paddingVertical: space.lg,
  },
  statValue: {
    color: colors.onSurface,
    marginTop: space.sm,
    ...type.headlineSmall,
  },
  statLabel: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
    ...type.bodySmall,
  },

  footer: {
    padding: space.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHigh,
  },
});