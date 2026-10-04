import {
  matchAnswer,
  normalizeAnswerText,
  type ExerciseKind,
  type HintKind,
  type MatchQuality,
} from './content/format.ts';

/** Exercise formats found in the imported drop plus the legacy seed bank. */
export type QuestionType =
  | ExerciseKind
  | 'image'
  | 'audio'
  | 'fill'
  | 'incorrect'
  | 'odd'
  | 'truefalse'
  | 'order';
/** How the learner answers: free text, or pick one of the shown options. */
export type AnswerMode = 'auto' | 'write' | 'select' | 'mixed';
export type Question = {
  id: string;
  type: QuestionType;
  /** Resolved for this question; 'auto'/'mixed' are request-level only. */
  answerMode?: 'write' | 'select';
  /** True when the options were derived from the level pool, not authored. */
  optionsGenerated?: boolean;
  lessonId: string;
  tokens?: string[];
  category: string;
  shortLabel: string;
  prompt: string;
  instruction: string;
  answer: string;
  acceptedAnswers?: string[];
  options?: string[];
  image?: string;
  mediaFile?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  alt?: string;
  audio?: string;
  transcript?: string;
  sentence?: string;
  sentenceBefore?: string;
  sentenceAfter?: string;
  hint?: string;
  hintKind?: HintKind;
  explanation: string;
  review: string;
  level?: number;
  sourceLanguage?: LanguageId;
  targetLanguage?: LanguageId;
  sourceCode?: string;
  family?: string;
  route?: string;
};
export type Answer = {
  questionId: string;
  value: string;
  correct: boolean;
  quality?: MatchQuality;
  /** The canonical answer, known only once the server has graded. */
  solution?: string;
  explanation?: string;
};
export function normalizeAnswer(value: string) {
  return normalizeAnswerText(value);
}
export function answerQuality(question: Question, value: string): MatchQuality {
  return matchAnswer(value, [
    question.answer,
    ...(question.acceptedAnswers ?? []),
  ]);
}
export function gradeAnswer(question: Question, value: string) {
  return answerQuality(question, value) !== 'none';
}
// Public credentials: this local demonstration is not real authentication.
export function authenticate(username: string, password: string) {
  return username.trim().toLowerCase() === 'demo' && password === 'Nebula123!';
}

export type { LanguageId, MatchQuality } from './content/format.ts';
export { languageTags } from './content/format.ts';
type LanguageId = '1' | '2' | '3' | '4' | '5';
export type NativeLanguageId = LanguageId | 'other';
export type LearningProfile = {
  nativeLanguage: NativeLanguageId;
  targetLanguage: LanguageId;
  level: number;
  answerMode?: AnswerMode;
};
/** Endonyms, so every learner recognises their own language in the picker. */
export const languages: Record<
  LanguageId,
  { name: string; endonym: string; tag: string; flag: string }
> = {
  '1': { name: 'Inglés', endonym: 'English', tag: 'en', flag: '/assets/flags/gb.svg' },
  '2': { name: 'Francés', endonym: 'Français', tag: 'fr', flag: '/assets/flags/fr.svg' },
  '3': { name: 'Español', endonym: 'Español', tag: 'es', flag: '/assets/flags/es.svg' },
  '4': { name: 'Italiano', endonym: 'Italiano', tag: 'it', flag: '/assets/flags/it.svg' },
  '5': { name: 'Alemán', endonym: 'Deutsch', tag: 'de', flag: '/assets/flags/de.svg' },
};
export const languageOptions = (Object.keys(languages) as LanguageId[]).map(
  (id) => ({ id, ...languages[id] }),
);
export const defaultLearningProfile: LearningProfile = {
  nativeLanguage: '3',
  targetLanguage: '1',
  level: 1,
  answerMode: 'auto',
};
export function languagePair(profile: LearningProfile) {
  const source =
    profile.nativeLanguage === 'other'
      ? profile.targetLanguage
      : profile.nativeLanguage;
  return `${source}${profile.targetLanguage}` as const;
}
export function profileKey(profile: LearningProfile) {
  return `pair-${languagePair(profile)}-level-${profile.level}`;
}
export function profileTitle(profile: LearningProfile) {
  const target = languages[profile.targetLanguage].name;
  const source =
    profile.nativeLanguage === 'other'
      ? 'modo unilingüe'
      : `desde ${languages[profile.nativeLanguage].name}`;
  return `${target} ${source}`;
}

export const lessons = [
  {
    id: 'first-steps',
    level: 'A1',
    title: 'Erste Schritte',
    subtitle: 'Wörter für deinen Alltag',
    description: 'Sieh genau hin, höre zu und bilde deine ersten Sätze.',
    count: 8,
    minutes: 4,
    accent: 'green',
    tags: ['Bilder und Audio', 'Einfache Sätze'],
  },
  {
    id: 'word-detective',
    level: 'A1',
    title: 'Wortdetektiv',
    subtitle: 'Entdecke die kleinen Unterschiede',
    description: 'Finde Ausreißer, entdecke Fehler und ordne Wörter zu Sätzen.',
    count: 8,
    minutes: 4,
    accent: 'purple',
    tags: ['Finde den Ausreißer', 'Entdecke den Fehler'],
  },
  {
    id: 'verbs-a2',
    level: 'A2',
    title: 'Verben in Aktion',
    subtitle: 'Von der Gegenwart in die Vergangenheit',
    description:
      'Eine kurze Einführung und acht Aufgaben zu Gewohnheiten, Handlungen und Vergangenheitsformen.',
    count: 8,
    minutes: 6,
    accent: 'blue',
    tags: ['Verben kurz erklärt', 'A2-Übungen'],
  },
] as const;
export type LessonId = (typeof lessons)[number]['id'];
export function getLessonQuestions(data: Question[], lessonId: string) {
  const lesson = lessons.find((item) => item.id === lessonId);
  const result = data.filter((q) => q.lessonId === lessonId);
  if (
    !lesson ||
    result.length !== lesson.count ||
    new Set(result.map((q) => q.id)).size !== result.length
  )
    throw new Error('Invalid lesson');
  return result;
}
