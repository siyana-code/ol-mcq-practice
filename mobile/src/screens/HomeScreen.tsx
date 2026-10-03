import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import apiClient from '../api/client';
import { Subject } from '../types';
import { colors, type, space, radius, subjectIcons } from '../theme';
import type { HomeScreenProps } from '../navigation';
import { Screen, Card, StateScreen } from '../components/ui';

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get<Subject[]>('/subjects');
      setSubjects(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const renderSubject = ({ item }: { item: Subject }) => (
    <Card
      onPress={() =>
        navigation.navigate('Topics', {
          subjectId: item.id,
          subjectName: item.name_si,
        })
      }
      style={s.card}
    >
      <View style={s.row}>
        <View style={s.iconWell}>
          <Ionicons
            name={subjectIcons[item.icon] ?? 'book'}
            size={24}
            color={colors.primary}
          />
        </View>
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
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <StateScreen
          icon="cloud-offline-outline"
          title="Couldn't load subjects"
          body={error}
          actionLabel="Try again"
          onAction={fetchSubjects}
          tone="error"
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={s.header}>
        <Text style={s.headerTitle}>OL MCQ Practice</Text>
        <Text style={s.headerSubtitle}>සාමාන්‍ය පෙළ විභාග පුරුදු</Text>
      </View>

      <FlatList
        data={subjects}
        renderItem={renderSubject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <StateScreen
            icon="file-tray-outline"
            title="No subjects yet"
            body="Subjects will appear here once they're added."
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

  header: {
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    paddingBottom: space.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  headerTitle: {
    color: colors.onSurface,
    ...type.headlineMedium,
  },
  headerSubtitle: {
    color: colors.onSurfaceVariant,
    marginTop: space.xs,
    ...type.bodyMedium,
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
  iconWell: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
    marginRight: space.lg,
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