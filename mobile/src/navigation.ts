import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Params passed between screens. */
export type RootStackParamList = {
  Home: undefined;
  Topics: { subjectId: string; subjectName: string };
  Practice: { topicId: string; topicName: string };
  Result: { score: number; total: number; topicName: string };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type TopicsScreenProps = NativeStackScreenProps<RootStackParamList, 'Topics'>;
export type PracticeScreenProps = NativeStackScreenProps<RootStackParamList, 'Practice'>;
export type ResultScreenProps = NativeStackScreenProps<RootStackParamList, 'Result'>;