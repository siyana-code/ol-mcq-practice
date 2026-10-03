import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';

import apiClient from '../api/client';
import { colors, type, space, subjectIcons } from '../theme';
import type {
  BasketKey,
  MotherLanguage,
  Religion,
  Subject,
  SubjectCategory,
} from '../types';
import type { ProfileScreenProps } from '../navigation';
import { Screen, AppBar, Button, OptionRow, SectionLabel, StateScreen } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const MOTHER_LANGUAGES: { value: MotherLanguage; si: string; en: string }[] = [
  { value: 'sinhala', si: 'සිංහල', en: 'Sinhala' },
  { value: 'tamil', si: 'දෙමළ', en: 'Tamil' },
];

const RELIGIONS: { value: Religion; si: string; en: string }[] = [
  { value: 'buddhism', si: 'බුද්ධ ධර්මය', en: 'Buddhism' },
  { value: 'christianity', si: 'ක්‍රිස්තු ධර්මය', en: 'Christianity' },
  { value: 'islam', si: 'ඉස්ලාම් ධර්මය', en: 'Islam' },
  { value: 'shaivism', si: 'ශෛව ධර්මය', en: 'Shaivism' },
];

const BASKETS: { key: BasketKey; label: string; hint: string }[] = [
  { key: 'basket1', label: 'Basket 1', hint: 'Pick one subject' },
  { key: 'basket2', label: 'Basket 2', hint: 'Pick one subject' },
  { key: 'basket3', label: 'Basket 3', hint: 'Pick one subject' },
];

const CATEGORY_OF: Record<BasketKey, SubjectCategory> = {
  basket1: 'basket1',
  basket2: 'basket2',
  basket3: 'basket3',
};

export default function ProfileScreen({ navigation, route }: ProfileScreenProps) {
  const { blocking } = route.params;
  const { profile, saveProfile, saveSubjects, signOut } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [mother, setMother] = useState<MotherLanguage | null>(
    profile?.mother_language ?? null,
  );
  const [religion, setReligion] = useState<Religion | null>(profile?.religion ?? null);
  const [picks, setPicks] = useState<Record<BasketKey, string | null>>({
    basket1: profile?.selections.basket1?.id ?? null,
    basket2: profile?.selections.basket2?.id ?? null,
    basket3: profile?.selections.basket3?.id ?? null,
  });

  const loadSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const { data } = await apiClient.get<Subject[]>('/subjects', {
        params: { all: true },
      });
      setSubjects(data);
    } catch (err: any) {
      setLoadError(err?.message ?? 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const byBasket = useMemo(
    () =>
      BASKETS.reduce(
        (acc, b) => {
          acc[b.key] = subjects.filter((s) => s.category === CATEGORY_OF[b.key]);
          return acc;
        },
        {} as Record<BasketKey, Subject[]>,
      ),
    [subjects],
  );

  const ready = !!mother && !!religion && BASKETS.every((b) => !!picks[b.key]);

  async function save() {
    if (!mother || !religion) return;
    setSaving(true);
    setSaveError(null);
    try {
      await saveProfile({ mother_language: mother, religion });
      await saveSubjects({
        basket1: picks.basket1!,
        basket2: picks.basket2!,
        basket3: picks.basket3!,
      });

      // Onboarding drops the student into Home; a later edit just returns them
      // to wherever they came from.
      if (blocking) {
        navigation.dispatch(
          CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }),
        );
      } else {
        navigation.goBack();
      }
    } catch (err: any) {
      setSaveError(err?.response?.data?.error ?? 'Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Screen>
        <AppBar title="Your subjects" />
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (loadError) {
    return (
      <Screen>
        <AppBar title="Your subjects" />
        <StateScreen
          icon="cloud-offline-outline"
          title="Couldn't load subjects"
          body={loadError}
          actionLabel="Try again"
          onAction={loadSubjects}
          tone="error"
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppBar title="Your subjects" />
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.intro}>
          Tell us how your exam is structured. We will build your practice list from
          this.
        </Text>

        {/* Mother language */}
        <SectionLabel>Mother language / මවභාෂාව</SectionLabel>
        <View style={s.group}>
          {MOTHER_LANGUAGES.map((m) => (
            <OptionRow
              key={m.value}
              label={m.si}
              caption={m.en}
              selected={mother === m.value}
              onPress={() => setMother(m.value)}
            />
          ))}
        </View>

        {/* Religion */}
        <SectionLabel>Religion / ධර්මය</SectionLabel>
        <View style={s.group}>
          {RELIGIONS.map((r) => (
            <OptionRow
              key={r.value}
              label={r.si}
              caption={r.en}
              selected={religion === r.value}
              onPress={() => setReligion(r.value)}
            />
          ))}
        </View>

        {/* Optional baskets */}
        {BASKETS.map((basket) => (
          <View key={basket.key}>
            <SectionLabel>
              {basket.label} — {basket.hint}
            </SectionLabel>
            <View style={s.group}>
              {byBasket[basket.key].map((subject) => (
                <OptionRow
                  key={subject.id}
                  label={subject.name_si}
                  caption={subject.name_en}
                  icon={(subject.icon as keyof typeof Ionicons.glyphMap) ?? 'book-outline'}
                  selected={picks[basket.key] === subject.id}
                  onPress={() =>
                    setPicks((prev) => ({ ...prev, [basket.key]: subject.id }))
                  }
                />
              ))}
            </View>
          </View>
        ))}

        {saveError ? (
          <View style={s.alert}>
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text style={s.alertText}>{saveError}</Text>
          </View>
        ) : null}

        {saving ? (
          <ActivityIndicator color={colors.primary} style={s.busy} />
        ) : (
          <Button
            label="Save and continue"
            onPress={save}
            disabled={!ready}
            icon="checkmark-circle-outline"
          />
        )}

        {!ready ? (
          <Text style={s.hint}>
            Pick your mother language, religion, and one subject from each basket.
          </Text>
        ) : null}

        <Button label="Sign out" onPress={signOut} variant="text" />
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: {
    padding: space.lg,
    paddingBottom: space.xxl,
  },
  intro: {
    color: colors.onSurfaceVariant,
    marginBottom: space.xl,
    ...type.bodyMedium,
  },
  group: {
    marginTop: space.sm,
    marginBottom: space.xl,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.errorContainer,
    borderRadius: space.sm,
    padding: space.md,
    marginBottom: space.lg,
  },
  alertText: {
    flex: 1,
    color: colors.onErrorContainer,
    ...type.bodyMedium,
  },
  busy: { marginVertical: space.xl },
  hint: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: space.md,
    ...type.bodySmall,
  },
});