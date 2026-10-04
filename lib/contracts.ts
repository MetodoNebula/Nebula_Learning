import type {
  ExerciseKind,
  MatchQuality,
} from './content/format.ts';
import type { LearningProfile, Question } from './lesson.ts';

// Versioned boundary shared by the UI and HTTP API. Solutions stay on the server.
export type Exercise = Omit<
  Question,
  'answer' | 'acceptedAnswers' | 'explanation'
>;
export type Feedback = {
  correct: boolean;
  /** 'accent' means the word was right but written without its diacritics. */
  quality: MatchQuality;
  answer: string;
  accepted: string[];
  explanation: string;
};
export type Records = Record<string, number>;
export type LevelAvailability = {
  level: number;
  count: number;
  available: boolean;
  kinds?: Partial<Record<ExerciseKind, number>>;
};
export interface LearningClient {
  session(): Promise<string | null>;
  login(username: string, password: string): Promise<string | null>;
  signup(username: string, password: string): Promise<string | null>;
  logout(): Promise<void>;
  records(): Promise<Records>;
  saveRecord(deckId: string, score: number, maxScore?: number): Promise<number>;
  questions(input: string | LearningProfile): Promise<Exercise[]>;
  availability(profile: LearningProfile): Promise<LevelAvailability[]>;
  grade(questionId: string, value: string): Promise<Feedback>;
}
