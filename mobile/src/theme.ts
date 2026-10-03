/**
 * Google Material Design 3 — Design Tokens
 * Pure React Native. No UI library dependency.
 * Values sourced from the official Material 3 baseline light scheme.
 */

import type { Ionicons } from '@expo/vector-icons';

/** M3 baseline light color scheme (Google brand palette). */
export const colors = {
  // Brand / primary
  primary: '#0b57d0',
  onPrimary: '#ffffff',
  primaryContainer: '#d3e3fd',
  onPrimaryContainer: '#041e49',
  primaryHover: '#0842a0',

  // Neutral
  secondary: '#5f6368',
  onSecondary: '#ffffff',
  secondaryContainer: '#e8eaed',
  onSecondaryContainer: '#202124',

  // Surfaces
  background: '#f8f9fa',
  surface: '#ffffff',
  surfaceContainerLow: '#f8f9fa',
  surfaceContainer: '#f1f3f4',
  surfaceContainerHigh: '#e8eaed',
  onSurface: '#1f1f1f',
  onSurfaceVariant: '#5f6368',

  // Lines
  outline: '#747775',
  outlineVariant: '#c4c7c5',

  // Status
  success: '#146c2e',
  onSuccess: '#ffffff',
  successContainer: '#c8e6c9',
  onSuccessContainer: '#0a3d1c',

  error: '#b3261e',
  onError: '#ffffff',
  errorContainer: '#f9dedc',
  onErrorContainer: '#410e0b',

  warning: '#f9ab00',
  onWarning: '#1f1f1f',
  warningContainer: '#fef7e0',
  onWarningContainer: '#7c5e00',

  // Feedback tints used for answer states
  correctTint: '#e6f4ea',
  correctBorder: '#146c2e',
  incorrectTint: '#fce8e6',
  incorrectBorder: '#b3261e',
  selectedTint: '#e8f0fe',
  selectedBorder: '#0b57d0',
} as const;

/** M3 type scale: [fontSize, lineHeight, fontWeight]. */
export const type = {
  headlineMedium: { fontSize: 28, lineHeight: 36, fontWeight: '700' },
  headlineSmall: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '500' },
  titleMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  titleSmall: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  bodySmall: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
} as const;

/** 4dp base grid. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

/** M3 shape scale. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;

/**
 * Google card elevation.
 * Android reads `elevation`; iOS reads the shadow* properties.
 */
export const elevation = {
  level1: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  level2: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
} as const;

/** Maps the subject `icon` column from the API to an Ionicons glyph. */
export const subjectIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  calculator: 'calculator',
  flask: 'flask',
  book: 'book',
};