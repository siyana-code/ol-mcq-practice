import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PracticeMode } from './api/practice';

/** Params passed between screens. */
export type RootStackParamList = {
  Home: undefined;
  Topics: { subjectId: string; subjectName: string };
  PracticeSetup: {
    subjectId: string;
    subjectName: string;
    topicId: string;
    topicName: string;
    questionCount: number;
  };
  Practice: {
    sessionId: string;
    subjectName: string;
    topicName: string;
    mode: PracticeMode;
    /** 0 means untimed. */
    totalSeconds: number;
  };
  Result: {
    mode: PracticeMode;
    percentage: number;
    correct: number;
    skipped: number;
    total: number;
    elapsedSeconds: number;
    topicName: string;
    subjectName: string;
    reviewCount: number;
  };
  /**
   * `blocking` marks first-run onboarding: the student cannot leave until a
   * mother language, religion, and all three basket picks are saved.
   */
  Profile: { blocking: boolean };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type TopicsScreenProps = NativeStackScreenProps<RootStackParamList, 'Topics'>;
export type PracticeSetupScreenProps = NativeStackScreenProps<RootStackParamList, 'PracticeSetup'>;
export type PracticeScreenProps = NativeStackScreenProps<RootStackParamList, 'Practice'>;
export type ResultScreenProps = NativeStackScreenProps<RootStackParamList, 'Result'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;