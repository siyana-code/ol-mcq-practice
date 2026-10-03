import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Params passed between screens. */
export type RootStackParamList = {
  Home: undefined;
  Topics: { subjectId: string; subjectName: string };
  Practice: { topicId: string; topicName: string };
  Result: { score: number; total: number; topicName: string };
  /**
   * `blocking` marks first-run onboarding: the student cannot leave until a
   * mother language, religion, and all three basket picks are saved.
   */
  Profile: { blocking: boolean };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type TopicsScreenProps = NativeStackScreenProps<RootStackParamList, 'Topics'>;
export type PracticeScreenProps = NativeStackScreenProps<RootStackParamList, 'Practice'>;
export type ResultScreenProps = NativeStackScreenProps<RootStackParamList, 'Result'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;