import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import apiClient from '../api/client';
import { Subject, Topic } from '../types';
import { colors, type, space, radius } from '../theme';
import type { TopicsScreenProps } from '../navigation';
import { Screen, AppBar, Card, StateScreen } from '../components/ui';

export default function TopicsScreen({ navigation, route }: TopicsScreenProps) {
  const { subjectId, subjectName } = route.params;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubject = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get<Subject>(`/subjects/${subjectId}`);
      setSubject(data);
      setTopics(data.topics ?? []);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchSubject();
  }, [fetchSubject]);

  const readyCount = useMemo(
    () => topics.filter((t) => (t.question_count ?? 0) > 0).length,
    [topics],
  );

  const renderTopic = ({ item }: { item: Topic }) => {
    const count = item.question_count ?? 0;
    const ready = count > 0;

    return (
      <Card
        onPress={
          ready
            ? () =>
                navigation.navigate('Practice', {
                  topicId: item.id,
                  topicName: item.name_si,
                })
            : undefined
        }
        style={s.card}
      >
        <View style={s.row}>
          <View style={[s.iconWell, !ready && s.iconWellMuted]}>
            <Ionicons
              name={ready ? 'play' : 'hourglass-outline'}
              size={20}
              color={ready ? colors.onPrimary : colors.outline}
            />
          </View>

          <View style={s.rowText}>
            <Text style={[s.title, !ready && s.titleMuted]} numberOfLines={1}>
              {item.name_si}
            </Text>
            <Text style={s.subtitle} numberOfLines={1}>
              {item.name_en}
            </Text>
          </View>

          {ready ? (
            <>
              <Text style={s.count}>{count}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.outline} />
            </>
          ) : (
            <Text style={s.pending}>ඉක්මන්ට</Text>
          )}
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <Screen>
        <AppBar title={subjectName} onBack={() => navigation.goBack()} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <AppBar title={subjectName} onBack={() => navigation.goBack()} />
        <StateScreen
          icon="cloud-offline-outline"
          title="Couldn't load topics"
          body={error}
          actionLabel="Try again"
          onAction={fetchSubject}
          tone="error"
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppBar title={subjectName} onBack={() => navigation.goBack()} />

      <FlatList
        data={topics}
        renderItem={renderTopic}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        ListHeaderComponent={
          topics.length ? (
            <View style={s.banner}>
              <Ionicons
                name={readyCount ? 'checkmark-circle' : 'hourglass-outline'}
                size={18}
                color={readyCount ? colors.success : colors.warning}
              />
              <Text style={s.bannerText}>
                {readyCount
                  ? `${readyCount} of ${topics.length} topics ready`
                  : 'Questions for this subject are being added'}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <StateScreen
            icon="library-outline"
            title="No topics yet"
            body="Topics for this subject haven't been added."
          />
        }
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: {
    padding: space.lg,
    paddingBottom: space.xxl,
  },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: space.md,
    padding: space.lg,
    marginBottom: space.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  bannerText: {
    flex: 1,
    color: colors.onSurfaceVariant,
    ...type.bodyMedium,
  },

  card: {
    marginBottom: space.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.lg,
    gap: space.md,
  },
  iconWell: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  iconWellMuted: {
    backgroundColor: colors.surfaceContainer,
  },
  rowText: {
    flex: 1,
  },
  title: {
    color: colors.onSurface,
    ...type.bodyLarge,
  },
  titleMuted: {
    color: colors.onSurfaceVariant,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
    ...type.bodySmall,
  },
  count: {
    color: colors.onSurfaceVariant,
    ...type.titleSmall,
  },
  pending: {
    color: colors.outline,
    ...type.bodySmall,
  },
});