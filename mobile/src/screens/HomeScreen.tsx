import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import apiClient from '../api/client';
import { Subject } from '../types';
import { colors, type, space, radius, subjectIcons } from '../theme';
import type { HomeScreenProps } from '../navigation';
import { Screen, AppBar, Card, StateScreen } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { profile, signOut } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get<Subject[]>('/profile/my-subjects');
      setSubjects(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const renderSubject = ({ item }: { item: Subject }) => {
    const drillable = item.is_mcq && (item.topics?.length ?? 0) > 0;

    return (
      <Card
        onPress={
          drillable
            ? () =>
                navigation.navigate('Topics', {
                  subjectId: item.id,
                  subjectName: item.name_si,
                })
            : undefined
        }
        style={s.card}
      >
        <View style={s.row}>
          <View style={s.iconWell}>
            <Ionicons
              name={subjectIcons[item.icon ?? ''] ?? 'book-outline'}
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
            {item.category !== 'mandatory' ? (
              <View style={s.tag}>
                <Text style={s.tagText}>
                  {item.category === 'basket1' ? 'Basket 1' : `Basket ${item.category.slice(-1)}`}
                </Text>
              </View>
            ) : null}
            {!drillable ? (
              <Text style={s.note}>
                {item.is_mcq ? 'No questions yet' : 'No MCQ paper'}
              </Text>
            ) : null}
          </View>

          {drillable ? (
            <Ionicons name="chevron-forward" size={20} color={colors.outline} />
          ) : null}
        </View>
      </Card>
    );
  };

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
        <AppBar title="OL MCQ Practice" onBack={signOut} />
        <StateScreen
          icon="cloud-offline-outline"
          title="Couldn't load your subjects"
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
      <AppBar
        title={profile?.name ?? 'OL MCQ Practice'}
        trailing={
          <View style={s.headerActions}>
            <Ionicons
              name="options-outline"
              size={24}
              color={colors.onSurfaceVariant}
              onPress={() => navigation.navigate('Profile', { blocking: false })}
            />
            <Ionicons
              name="log-out-outline"
              size={24}
              color={colors.onSurfaceVariant}
              onPress={signOut}
            />
          </View>
        }
      />

      <FlatList
        data={subjects}
        renderItem={renderSubject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        ListHeaderComponent={
          <Text style={s.greeting}>
            Your exam subjects{profile?.mother_language ? ` — ${profile.mother_language}` : ''}
          </Text>
        }
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: space.lg },

  greeting: {
    color: colors.onSurfaceVariant,
    marginBottom: space.lg,
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
  tag: {
    alignSelf: 'flex-start',
    marginTop: space.sm,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.secondaryContainer,
  },
  tagText: {
    color: colors.onSecondaryContainer,
    ...type.labelLarge,
    fontSize: 11,
  },
  note: {
    color: colors.outline,
    marginTop: space.xs,
    ...type.bodySmall,
  },
});