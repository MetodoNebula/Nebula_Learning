import bank from '../../data/questions.json' with { type: 'json' };
import {
  answerQuality,
  getLessonQuestions,
  type LearningProfile,
  type Question,
} from '../lesson.ts';
import type { Exercise, Feedback, LevelAvailability } from '../contracts.ts';
import {
  findContentQuestion,
  getLevelAvailability,
  getProfileQuestions,
} from './content.ts';

export interface QuestionRepository {
  forLesson(id: string): Promise<Question[]>;
  forProfile(profile: LearningProfile): Promise<Question[]>;
  levels(profile: LearningProfile): Promise<LevelAvailability[]>;
  find(id: string): Promise<Question | undefined>;
}

// Immutable seed adapter: replace here with a database/CMS, without changing the API or UI.
export const questionRepository: QuestionRepository = {
  async forLesson(id) {
    return getLessonQuestions(bank as Question[], id);
  },
  async forProfile(profile) {
    return getProfileQuestions(profile);
  },
  async levels(profile) {
    return getLevelAvailability(profile);
  },
  async find(id) {
    return (
      (bank as Question[]).find((q) => q.id === id) ?? findContentQuestion(id)
    );
  },
};

export async function exercises(
  id: string,
  repository = questionRepository,
): Promise<Exercise[]> {
  return (await repository.forLesson(id)).map(
    ({
      answer: _answer,
      acceptedAnswers: _acceptedAnswers,
      explanation: _explanation,
      ...question
    }) => question,
  );
}

export async function profileExercises(
  profile: LearningProfile,
  repository = questionRepository,
): Promise<Exercise[]> {
  return (await repository.forProfile(profile)).map(
    ({
      answer: _answer,
      acceptedAnswers: _acceptedAnswers,
      explanation: _explanation,
      ...question
    }) => question,
  );
}

export async function levelAvailability(
  profile: LearningProfile,
  repository = questionRepository,
) {
  return repository.levels(profile);
}

export async function evaluate(
  id: string,
  value: string,
  repository = questionRepository,
): Promise<Feedback | null> {
  const question = await repository.find(id);
  if (!question) return null;
  const quality = answerQuality(question, value);
  return {
    correct: quality !== 'none',
    quality,
    answer: question.answer,
    accepted: (question.acceptedAnswers ?? [question.answer]).filter(
      (answer) => answer !== question.answer,
    ),
    explanation: question.explanation,
  };
}
