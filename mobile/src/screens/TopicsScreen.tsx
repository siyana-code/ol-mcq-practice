import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import apiClient from '../api/client';
import { Topic } from '../types';
import { colors, type, space } from '../theme';
import type { TopicsScreenProps } from '../navigation';
import { Screen, AppBar, Card, StateScreen } from '../components/ui';

export default function TopicsScreen({ navigation, route }: TopicsScreenProps) {
  const { subjectId, subjectName } = route.params;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get<{ topics: Topic[] }>(`/subjects/${subjectId}`);
      setTopics(data.topics ?? []);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const renderTopic = ({ item }: { item: Topic }) => (
    <Card
      onPress={() =>
        navigation.navigate('Practice', {
          topicId: item.id,
          topicName: item.name_si,
        })
      }
      style={s.card}
    >
      <View style={s.row}>
        <View style={s.rowText}>
          <Text style={s.title} numberOfLines={1}>
            {item.name_si}
          </Text>
          <Text style={s.subtitle} numberOfLines={1}>
            {item.name_en}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.outline} />
      </View>
    </Card>
  );

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
          onAction={fetchTopics}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: space.lg,
  },
  card: {
    marginBottom: space.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.lg,
  },
  rowText: {
    flex: 1,
    paddingRight: space.sm,
  },
  title: {
    color: colors.onSurface,
    ...type.titleMedium,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
    ...type.bodySmall,
  },
});