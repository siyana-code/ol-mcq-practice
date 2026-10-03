import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, SectionList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import apiClient from '../api/client';
import { Subject } from '../types';
import { colors, type, space, radius, subjectIcons } from '../theme';
import type { HomeScreenProps } from '../navigation';
import { Screen, AppBar, Card, StateScreen, SectionLabel } from '../components/ui';
import { useAuth } from '../context/AuthContext';

/** Why a subject cannot be drilled right now, if it cannot. */
type Availability = 'ready' | 'no-questions' | 'no-mcq';

function availability(subject: Subject): Availability {
  if (!subject.is_mcq) return 'no-mcq';
  if ((subject.question_count ?? 0) === 0) return 'no-questions';
  return 'ready';
}

const AVAILABILITY_NOTE: Record<Exclude<Availability, 'ready'>, { si: string; en: string }> = {
  'no-mcq': { si: 'MCQ පත්‍රයක් නොමැත', en: 'No MCQ paper' },
  'no-questions': { si: 'ප්‍රශ්න ඉක්මන්ට එයි', en: 'Questions coming soon' },
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { profile, signOut } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const sections = useMemo(() => {
    const mandatory = subjects.filter((s) => s.category === 'mandatory');
    const optional = subjects.filter((s) => s.category !== 'mandatory');
    return [
      { key: 'mandatory', title: 'Mandatory subjects', si: 'අනිවාසය', data: mandatory },
      { key: 'optional', title: 'Your optional subjects', si: 'ඔබගේ අමරික අනුක්‍රමය', data: optional },
    ].filter((s) => s.data.length > 0);
  }, [subjects]);

  const readyCount = subjects.filter((s) => availability(s) === 'ready').length;

  const renderSubject = ({ item }: { item: Subject }) => {
    const state = availability(item);
    const note = state === 'ready' ? null : AVAILABILITY_NOTE[state];

    return (
      <Card
        onPress={
          state === 'ready'
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
          <View style={[s.iconWell, state !== 'ready' && s.iconWellMuted]}>
            <Ionicons
              name={subjectIcons[item.icon ?? ''] ?? 'book-outline'}
              size={24}
              color={state === 'ready' ? colors.primary : colors.outline}
            />
          </View>

          <View style={s.rowText}>
            <Text
              style={[s.title, state !== 'ready' && s.titleMuted]}
              numberOfLines={1}
            >
              {item.name_si}
            </Text>
            <Text style={s.subtitle} numberOfLines={1}>
              {item.name_en}
            </Text>

            {note ? (
              <View style={s.notePill}>
                <Ionicons name="time-outline" size={13} color={colors.onSurfaceVariant} />
                <Text style={s.noteText}>{note.si}</Text>
              </View>
            ) : (
              <Text style={s.meta}>
                {(item.question_count ?? 0) > 0
                  ? `${item.question_count} question${item.question_count === 1 ? '' : 's'}`
                  : `${item.topics?.length ?? 0} topic${(item.topics?.length ?? 0) === 1 ? '' : 's'}`}
              </Text>
            )}
          </View>

          {state === 'ready' ? (
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
        <AppBar title={profile?.name ?? 'OL MCQ Practice'} onBack={signOut} />
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

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderSubject}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={s.list}
        renderSectionHeader={({ section }) => (
          <View style={s.sectionHeader}>
            <SectionLabel>{section.title}</SectionLabel>
          </View>
        )}
        ListHeaderComponent={
          subjects.length ? (
            <View style={s.summary}>
              <Ionicons
                name={readyCount ? 'library' : 'hourglass-outline'}
                size={18}
                color={readyCount ? colors.success : colors.warning}
              />
              <Text style={s.summaryText}>
                {readyCount
                  ? `${readyCount} subject${readyCount === 1 ? '' : 's'} ready to practise`
                  : 'Past paper questions are being added — check back soon'}
              </Text>
            </View>
          ) : null
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

  list: {
    padding: space.lg,
    paddingBottom: space.xxl,
  },

  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.lg,
    marginBottom: space.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  summaryText: {
    flex: 1,
    color: colors.onSurfaceVariant,
    ...type.bodyMedium,
  },

  sectionHeader: {
    marginBottom: space.md,
    marginTop: space.sm,
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
  iconWellMuted: {
    backgroundColor: colors.surfaceContainer,
  },
  rowText: {
    flex: 1,
    paddingRight: space.sm,
  },
  title: {
    color: colors.onSurface,
    ...type.titleMedium,
  },
  titleMuted: {
    color: colors.onSurfaceVariant,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
    ...type.bodySmall,
  },
  meta: {
    color: colors.outline,
    marginTop: space.xs,
    ...type.bodySmall,
  },
  notePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.xs,
    marginTop: space.sm,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainer,
  },
  noteText: {
    color: colors.onSurfaceVariant,
    ...type.bodySmall,
  },
});