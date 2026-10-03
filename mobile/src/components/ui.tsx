import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, type, space, radius, elevation } from '../theme';

/* ------------------------------------------------------------------ */
/* AppBar                                                              */
/* ------------------------------------------------------------------ */

interface AppBarProps {
  title: string;
  onBack?: () => void;
  /** Trailing content, e.g. a "3/20" progress label. */
  trailing?: React.ReactNode;
}

export function AppBar({ title, onBack, trailing }: AppBarProps) {
  return (
    <View style={s.appBar}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
      ) : null}
      <Text style={s.appBarTitle} numberOfLines={1}>
        {title}
      </Text>
      {trailing ? <View style={s.appBarTrailing}>{trailing}</View> : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  /** Optional override for border color / width (used for answer states). */
  borderColor?: string;
  borderWidth?: number;
  background?: string;
  style?: ViewStyle;
}

export function Card({
  children,
  onPress,
  borderColor = colors.outlineVariant,
  borderWidth = 1,
  background = colors.surface,
  style,
}: CardProps) {
  const content = (
    <View
      style={[
        s.card,
        elevation.level1,
        {
          backgroundColor: background,
          borderColor,
          borderWidth,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && s.pressedCard]}
      accessibilityRole="button"
    >
      {content}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'tonal' | 'text';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'filled',
  icon,
  disabled,
}: ButtonProps) {
  const palette = {
    filled: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
    tonal: { bg: colors.primaryContainer, fg: colors.onPrimaryContainer, border: colors.primaryContainer },
    text: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        s.button,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: disabled ? 0.38 : 1,
        },
        pressed && !disabled && s.pressed,
      ]}
    >
      {icon ? <Ionicons name={icon} size={20} color={palette.fg} /> : null}
      <Text style={[s.buttonLabel, { color: palette.fg }]}>{label}</Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Section heading                                                      */
/* ------------------------------------------------------------------ */

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={s.sectionLabel}>{children}</Text>;
}

/* ------------------------------------------------------------------ */
/* Empty / error state                                                  */
/* ------------------------------------------------------------------ */

interface StateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'neutral' | 'error';
}

export function StateScreen({
  icon,
  title,
  body,
  actionLabel,
  onAction,
  tone = 'neutral',
}: StateProps) {
  const tint = tone === 'error' ? colors.error : colors.onSurfaceVariant;
  return (
    <View style={s.state}>
      <View
        style={[
          s.stateIcon,
          { backgroundColor: tone === 'error' ? colors.errorContainer : colors.surfaceContainer },
        ]}
      >
        <Ionicons name={icon} size={32} color={tint} />
      </View>
      <Text style={s.stateTitle}>{title}</Text>
      {body ? <Text style={s.stateBody}>{body}</Text> : null}
      {actionLabel && onAction ? (
        <View style={s.stateAction}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Text field                                                           */
/* ------------------------------------------------------------------ */

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  error?: string | null;
  editable?: boolean;
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  editable = true,
}: FieldProps) {
  const [focused, setFocused] = React.useState(false);
  const borderColor = error
    ? colors.error
    : focused
      ? colors.primary
      : colors.outlineVariant;

  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.outline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        editable={editable}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[s.input, { borderColor, borderWidth: focused || error ? 2 : 1 }]}
      />
      {error ? <Text style={s.fieldError}>{error}</Text> : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Selectable row (radio-in-card)                                      */
/* ------------------------------------------------------------------ */

interface OptionRowProps {
  label: string;
  caption?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}

export function OptionRow({ label, caption, icon, selected, onPress }: OptionRowProps) {
  return (
    <Card
      onPress={onPress}
      background={selected ? colors.selectedTint : colors.surface}
      borderColor={selected ? colors.selectedBorder : colors.outlineVariant}
      borderWidth={selected ? 2 : 1}
      style={s.optionRow}
    >
      <View style={s.optionRowInner}>
        {icon ? (
          <View style={[s.optionIcon, selected && s.optionIconSelected]}>
            <Ionicons
              name={icon}
              size={20}
              color={selected ? colors.onPrimary : colors.onSurfaceVariant}
            />
          </View>
        ) : null}
        <View style={s.optionLabels}>
          <Text style={s.optionLabel}>{label}</Text>
          {caption ? <Text style={s.optionCaption}>{caption}</Text> : null}
        </View>
        <Ionicons
          name={selected ? 'radio-button-on' : 'radio-button-off'}
          size={22}
          color={selected ? colors.primary : colors.outline}
        />
      </View>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Screen wrapper                                                       */
/* ------------------------------------------------------------------ */

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={s.screen} edges={['top', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingHorizontal: space.sm,
    paddingVertical: space.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  appBarTitle: {
    flex: 1,
    marginLeft: space.sm,
    color: colors.onSurface,
    ...type.titleLarge,
  },
  appBarTrailing: {
    marginLeft: space.sm,
  },

  card: {
    borderRadius: radius.md,
  },
  pressedCard: {
    opacity: 0.7,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    height: 48,
    paddingHorizontal: space.xxl,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  buttonLabel: {
    ...type.labelLarge,
  },

  sectionLabel: {
    color: colors.onSurfaceVariant,
    ...type.titleSmall,
  },

  field: {
    marginBottom: space.lg,
  },
  fieldLabel: {
    color: colors.onSurfaceVariant,
    marginBottom: space.xs,
    ...type.titleSmall,
  },
  input: {
    height: 52,
    borderRadius: radius.sm,
    paddingHorizontal: space.lg,
    color: colors.onSurface,
    backgroundColor: colors.surface,
    ...type.bodyLarge,
  },
  fieldError: {
    color: colors.error,
    marginTop: space.xs,
    ...type.bodySmall,
  },

  optionRow: {
    marginBottom: space.sm,
  },
  optionRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.lg,
    gap: space.md,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
  },
  optionIconSelected: {
    backgroundColor: colors.primary,
  },
  optionLabels: {
    flex: 1,
  },
  optionLabel: {
    color: colors.onSurface,
    ...type.bodyLarge,
  },
  optionCaption: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
    ...type.bodySmall,
  },

  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xxl,
  },
  stateIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xl,
  },
  stateTitle: {
    ...type.titleLarge,
    color: colors.onSurface,
    textAlign: 'center',
  },
  stateBody: {
    ...type.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: space.sm,
  },
  stateAction: {
    marginTop: space.xxl,
  },
});