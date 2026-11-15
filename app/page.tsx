'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Languages,
  Sparkles,
  Target,
  LogOut,
  Eye,
  EyeOff,
  Orbit,
  RotateCcw,
  BookOpen,
  PencilLine,
  ListChecks,
  ImageIcon,
  TextCursorInput,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  defaultLearningProfile,
  languageOptions,
  languages,
  languagePair,
  profileKey,
  type Answer,
  type AnswerMode,
  type ContentFilter,
  type LearningProfile,
  type QuestionType,
} from '@/lib/lesson';
import { accentKeys, dictionaries, languageName, uiLanguage } from '@/lib/i18n';
import type { Exercise, Feedback, LevelAvailability } from '@/lib/contracts';
import { createLearningClient } from '@/lib/client/learning';

const answerModes: AnswerMode[] = ['auto', 'write', 'select', 'mixed'];
const contentFilters: { id: ContentFilter; label: string }[] = [
  { id: 'all', label: 'Todos los formatos' },
  { id: 'Z', label: 'Z · opción múltiple' },
  { id: 'C', label: 'C · completar' },
  { id: 'T', label: 'T · traducción y respuesta escrita' },
];
const kindIcon: Record<string, typeof ImageIcon> = {
  naming: ImageIcon,
  translation: Languages,
  choice: ListChecks,
  cloze: TextCursorInput,
};

const demoUsers: { name: string; profile: LearningProfile }[] = [
  {
    name: 'Alex',
    profile: {
      nativeLanguage: '3',
      targetLanguage: '1',
      level: 1,
      answerMode: 'auto',
    },
  },
  {
    name: 'Giulia',
    profile: {
      nativeLanguage: '4',
      targetLanguage: '3',
      level: 2,
      answerMode: 'auto',
    },
  },
  {
    name: 'Mira',
    profile: {
      nativeLanguage: 'other',
      targetLanguage: '1',
      level: 1,
      answerMode: 'auto',
    },
  },
];

export default function Home() {
  const [learning] = useState(createLearningClient);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState('');
  const checkingRef = useRef(false);
  const operation = useRef(0);
  const [view, setView] = useState<'home' | 'login' | 'lesson' | 'results'>(
    'login',
  );
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [user, setUser] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [questions, setQuestions] = useState<Exercise[]>([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [checked, setChecked] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [profile, setProfile] = useState<LearningProfile>(
    defaultLearningProfile,
  );
  const [lessonId, setLessonId] = useState(profileKey(defaultLearningProfile));
  const [records, setRecords] = useState<Record<string, number>>({});
  const [levels, setLevels] = useState<LevelAvailability[]>([]);
  const [availabilityError, setAvailabilityError] = useState('');
  const [improved, setImproved] = useState(false);
  const [setupStep, setSetupStep] = useState<1 | 2 | 3>(1);

  // The interface follows the language the learner speaks. "Another language"
  // says nothing about what they read, so the last real choice is kept.
  const [reader, setReader] = useState(uiLanguage(defaultLearningProfile.nativeLanguage));
  const t = useMemo(() => dictionaries[reader], [reader]);
  const route = languagePair(profile);
  const best = records[lessonId] ?? null;
  const title = useRef<HTMLHeadingElement>(null);
  const answerInput = useRef<HTMLInputElement>(null);
  const q = questions[index];
  const score = answers.filter((a) => a.correct).length;
  const selectedLevel = levels.find((item) => item.level === profile.level);
  const hasSelectedContent = selectedLevel?.available ?? false;
  const targetName = languageName(profile.targetLanguage, reader);
  const answerTag = q?.targetLanguage
    ? languages[q.targetLanguage].tag
    : languages[profile.targetLanguage].tag;
  const promptTag = q?.sourceLanguage ? languages[q.sourceLanguage].tag : undefined;
  const keys = accentKeys[q?.targetLanguage ?? profile.targetLanguage];

  useEffect(() => {
    let active = true;
    Promise.all([learning.session(), learning.records()])
      .then(([session, saved]) => {
        if (!active) return;
        setUser(session ?? '');
        setRecords(saved);
        if (session) setView('home');
      })
      .catch(() => {
        if (active) setLoadError(t.genericError);
      });
    return () => {
      active = false;
    };
  }, [learning, t]);

  // Only the language pair changes which levels exist, so the level and the
  // answering mode deliberately stay out of the dependency list.
  const { nativeLanguage, targetLanguage, filter } = profile;
  useEffect(() => {
    let active = true;
    learning
      .availability({ nativeLanguage, targetLanguage, level: 1, filter })
      .then((data) => {
        if (!active) return;
        setAvailabilityError('');
        setLevels(data);
        setProfile((previous) => {
          if (data.find((item) => item.level === previous.level)?.available)
            return previous;
          const first = data.find((item) => item.available);
          if (!first) return previous;
          const updated = { ...previous, level: first.level };
          setLessonId(profileKey(updated));
          return updated;
        });
      })
      .catch(() => {
        if (active) setAvailabilityError(t.genericError);
      });
    return () => {
      active = false;
    };
  }, [learning, nativeLanguage, targetLanguage, filter, t]);

  useEffect(() => {
    title.current?.focus();
  }, [view, index]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (view !== 'lesson' || !viewport) return;
    const syncHeight = () =>
      document.documentElement.style.setProperty(
        '--lesson-viewport-height',
        `${viewport.height}px`,
      );
    syncHeight();
    viewport.addEventListener('resize', syncHeight);
    return () => {
      viewport.removeEventListener('resize', syncHeight);
      document.documentElement.style.removeProperty('--lesson-viewport-height');
    };
  }, [view]);

  function goHome() {
    operation.current += 1;
    checkingRef.current = false;
    setChecking(false);
    setLoading(false);
    setFeedbackOpen(false);
    setView('home');
  }

  async function startLesson() {
    setLoadError('');
    if (!hasSelectedContent) {
      setLoadError(t.noContent);
      return;
    }
    setLessonId(profileKey(profile));
    if (!user) setView('login');
    else await loadLesson();
  }

  async function loadLesson() {
    const currentOperation = ++operation.current;
    const deckId = profileKey(profile);
    setLoading(true);
    setLoadError('');
    try {
      const data = await learning.questions(profile);
      if (currentOperation !== operation.current) return;
      if (!data.length) {
        setLoadError(t.noContent);
        return;
      }
      setLessonId(deckId);
      setQuestions(data);
      setFeedbackOpen(false);
      setIndex(0);
      setAnswers([]);
      setSelected('');
      setChecked(false);
      setFeedback(null);
      setCheckError('');
      setChecking(false);
      checkingRef.current = false;
      setView('lesson');
    } catch {
      if (currentOperation !== operation.current) return;
      setLoadError(t.loadFailed);
    } finally {
      if (currentOperation === operation.current) setLoading(false);
    }
  }

  async function login(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const currentOperation = ++operation.current;
    setLoading(true);
    let session;
    try {
      session =
        authMode === 'signup'
          ? await learning.signup(username, password)
          : await learning.login(username, password);
    } catch {
      if (currentOperation !== operation.current) return;
      setLoginError(t.genericError);
      setLoading(false);
      return;
    }
    if (currentOperation !== operation.current) return;
    if (!session) {
      setLoading(false);
      setLoginError(authMode === 'signup' ? t.signupError : t.loginError);
      return;
    }
    setUser(session);
    setPassword('');
    setLoginError('');
    setLoading(false);
    setView('home');
  }

  async function logout() {
    try {
      await learning.logout();
    } catch {
      setLoadError(t.genericError);
      return;
    }
    setUser('');
    setUsername('');
    setPassword('');
    goHome();
  }

  async function checkAnswer(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checked || checkingRef.current || checking || !selected.trim()) return;
    checkingRef.current = true;
    setChecking(true);
    setCheckError('');
    const currentOperation = operation.current;
    try {
      const result = await learning.grade(q.id, selected);
      if (currentOperation !== operation.current) return;
      setFeedback(result);
      setAnswers((previous) => [
        ...previous.slice(0, index),
        {
          questionId: q.id,
          value: selected,
          correct: result.correct,
          quality: result.quality,
          solution: result.answer,
        },
      ]);
      setChecked(true);
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
      setFeedbackOpen(true);
    } catch {
      if (currentOperation === operation.current) setCheckError(t.genericError);
    } finally {
      if (currentOperation === operation.current) {
        checkingRef.current = false;
        setChecking(false);
      }
    }
  }

  function submitAnswerWithEnter(event: React.KeyboardEvent<HTMLFormElement>) {
    if (
      event.key !== 'Enter' ||
      checked ||
      checkingRef.current ||
      checking ||
      !selected.trim()
    )
      return;
    event.preventDefault();
    event.currentTarget.requestSubmit();
  }

  function editAnswer() {
    if (checkingRef.current) return;
    setFeedbackOpen(false);
    if (checked) setAnswers((previous) => previous.slice(0, index));
    setChecked(false);
    requestAnimationFrame(() => answerInput.current?.focus());
  }

  async function next() {
    if (loading) return;
    const currentOperation = operation.current;
    setFeedbackOpen(false);
    if (index === questions.length - 1) {
      setLoading(true);
      const previousBest = records[lessonId];
      setImproved(score > 0 && (previousBest === undefined || score > previousBest));
      try {
        const record = await learning.saveRecord(
          lessonId,
          score,
          questions.length,
        );
        if (currentOperation !== operation.current) return;
        setRecords((previous) => ({ ...previous, [lessonId]: record }));
      } catch {
        if (currentOperation !== operation.current) return;
        setLoadError(t.genericError);
      }
      setLoading(false);
      setView('results');
    } else {
      setIndex(index + 1);
      setSelected('');
      setChecked(false);
      setFeedback(null);
      setCheckError('');
    }
  }

  function updateProfile(next_: Partial<LearningProfile>) {
    if (next_.nativeLanguage && next_.nativeLanguage !== 'other')
      setReader(next_.nativeLanguage);
    setProfile((previous) => {
      const updated = { ...previous, ...next_ };
      setLessonId(profileKey(updated));
      return updated;
    });
    setLoadError('');
  }

  function chooseNativeLanguage(nativeLanguage: LearningProfile['nativeLanguage']) {
    updateProfile({ nativeLanguage });
    setSetupStep(2);
  }

  function chooseTargetLanguage(targetLanguage: LearningProfile['targetLanguage']) {
    updateProfile({ targetLanguage });
    setSetupStep(3);
  }

  function insertCharacter(character: string) {
    const field = answerInput.current;
    if (!field) {
      setSelected(selected + character);
      return;
    }
    const start = field.selectionStart ?? selected.length;
    const end = field.selectionEnd ?? start;
    const value = selected.slice(0, start) + character + selected.slice(end);
    setSelected(value);
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(start + character.length, start + character.length);
    });
  }

  const writeField = (id: string, label: string) => (
    <input
      ref={answerInput}
      id={id}
      aria-label={label}
      lang={answerTag}
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      enterKeyHint="done"
      spellCheck={false}
      value={selected}
      onChange={(event) => setSelected(event.target.value)}
      disabled={checked || checking}
      placeholder="…"
      required
    />
  );

  const accentRow = keys.length > 0 && !checked && (
    <div className="accent-row" aria-label={t.accentHelper}>
      {keys.map((character) => (
        <button
          type="button"
          key={character}
          tabIndex={-1}
          disabled={checked || checking}
          onClick={() => insertCharacter(character)}
        >
          {character}
        </button>
      ))}
    </div>
  );

  function renderStage() {
    if (!q) return null;
    // Real dimensions keep the aspect ratio and reserve the right space; the
    // CSS caps how large the picture may actually get.
    const picture = q.image && (
      <Image
        unoptimized
        src={q.image}
        alt={t.pictureAlt}
        width={q.mediaWidth ?? 640}
        height={q.mediaHeight ?? 480}
        sizes="(max-width: 760px) 90vw, 420px"
      />
    );
    if (q.type === 'naming' || q.type === 'choice')
      return <div className="image-stage">{picture}</div>;
    return (
      <div className="prompt-stage">
        {picture && <div className="image-stage small">{picture}</div>}
        {q.type === 'translation' && q.sentence && (
          <p className="source-word" lang={promptTag}>
            {q.sentence}
          </p>
        )}
        {q.type === 'cloze' && q.sentence && (
          <p className="source-word small" lang={promptTag}>
            {q.sentence}
          </p>
        )}
      </div>
    );
  }

  function renderAnswerArea() {
    if (!q) return null;
    if (q.type === 'cloze' && q.answerMode !== 'select')
      return (
        <div className="fill-stage">
          <label htmlFor="answer-field" className="sentence" lang={answerTag}>
            {q.sentenceBefore}
            {writeField('answer-field', t.typeHere)}
            {q.sentenceAfter}
          </label>
          {accentRow}
        </div>
      );
    if (q.answerMode === 'select' && q.options?.length)
      return (
        <RadioGroup
          className="answers-grid"
          aria-label={t.chooseOne}
          value={selected}
          onValueChange={(value) => setSelected(String(value))}
          disabled={checked || checking}
        >
          {q.options.map((option, optionIndex) => (
            <label
              key={option}
              className={
                'answer-option ' +
                (selected === option ? 'selected ' : '') +
                (checked && option === feedback?.answer ? 'correct-option ' : '') +
                (checked && selected === option && option !== feedback?.answer
                  ? 'wrong-option'
                  : '')
              }
            >
              <RadioGroupItem value={option} aria-label={option} />
              <span className="option-letter">
                {String.fromCharCode(65 + optionIndex)}
              </span>
              <span lang={answerTag}>{option}</span>
              {checked && option === feedback?.answer && <Check size={20} />}
            </label>
          ))}
        </RadioGroup>
      );
    return (
      <div className="write-stage">
        <label htmlFor="answer-field">{t.typeHere}</label>
        {writeField('answer-field', t.typeHere)}
        {accentRow}
      </div>
    );
  }

  const feedbackTitle = !feedback
    ? ''
    : feedback.quality === 'exact'
      ? t.correctTitle
      : feedback.quality === 'accent'
        ? t.accentTitle
        : t.wrongTitle;

  return (
    <div
      lang={t.tag}
      className={'app-shell' + (view === 'lesson' ? ' lesson-shell' : '')}
    >
      {view !== 'lesson' && (
        <header className="topbar">
          <button className="brand" onClick={goHome} aria-label="Nebula Tech">
            <span className="brand-icon">
              <Orbit size={26} />
            </span>
            <span>
              Nebula<span className="brand-light">Tech</span>
              <small>{t.tagline.toLocaleUpperCase(t.tag)}</small>
            </span>
          </button>
          <div className="header-right">
            <span className="demo-label">
              <span /> DEMO
            </span>
            {user ? (
              <button className="account" onClick={logout} aria-label={t.signOut}>
                <span className="avatar">{user.slice(0, 1).toUpperCase()}</span>
                <span>{user}</span>
                <LogOut size={17} />
              </button>
            ) : (
              <button className="text-button" onClick={() => setView('login')}>
                {t.signIn} <ArrowRight size={16} />
              </button>
            )}
          </div>
        </header>
      )}

      {view === 'home' && (
        <main className="learning-hub">
          <section className="hub-welcome">
            <div>
              <div className="eyebrow mint">{t.routeBadge(route)}</div>
              <h1 ref={title} tabIndex={-1}>
                {t.menuHeading(user || 'demo')}
              </h1>
              <p>{t.menuLead}</p>
            </div>
            <div className="hub-orbit">
              <Image
                unoptimized
                src="/assets/rocket.svg"
                alt=""
                width="100"
                height="100"
              />
              <span>
                {t.routeBadge(route)}
                <br />
                {t.levelLabel} {profile.level}
              </span>
            </div>
          </section>

          <section className="lesson-catalog" aria-labelledby="config-title">
            <div className="catalog-heading">
              <h2 id="config-title">{t.routeBadge(route)}</h2>
              <span>
                {profile.nativeLanguage === 'other'
                  ? t.otherLanguage
                  : `${languageName(profile.nativeLanguage, reader)} → ${targetName}`}
              </span>
            </div>
            <div className="profile-config">
              <div className="setup-progress" aria-label="Configuración">
                <span className={setupStep === 1 ? 'active' : ''}>1 · {t.youSpeak}</span>
                <span className={setupStep === 2 ? 'active' : ''}>2 · {t.youLearn}</span>
                <span className={setupStep === 3 ? 'active' : ''}>3 · {t.levelLabel}</span>
              </div>
              {setupStep === 1 && <fieldset className="language-picker">
                <legend>{t.youSpeak}</legend>
                <div className="language-flags">
                  {languageOptions.map((language) => (
                    <button
                      key={language.id}
                      type="button"
                      className="language-flag"
                      aria-pressed={profile.nativeLanguage === language.id}
                      onClick={() => chooseNativeLanguage(language.id)}
                    >
                      <Image
                        className="language-flag-symbol"
                        src={language.flag}
                        alt=""
                        width={38}
                        height={27}
                      />
                      <span>{language.endonym}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="language-flag other-language"
                    aria-pressed={profile.nativeLanguage === 'other'}
                    onClick={() => chooseNativeLanguage('other')}
                  >
                    <Orbit size={25} aria-hidden="true" />
                    <span>{t.otherLanguage}</span>
                  </button>
                </div>
              </fieldset>}
              {setupStep === 2 && <fieldset className="language-picker">
                <legend>{t.youLearn}</legend>
                <div className="language-flags">
                  {languageOptions.map((language) => (
                    <button
                      key={language.id}
                      type="button"
                      className="language-flag"
                      aria-pressed={profile.targetLanguage === language.id}
                      onClick={() => chooseTargetLanguage(language.id)}
                    >
                      <Image
                        className="language-flag-symbol"
                        src={language.flag}
                        alt=""
                        width={38}
                        height={27}
                      />
                      <span>{language.endonym}</span>
                    </button>
                  ))}
                </div>
                <button type="button" className="text-button" onClick={() => setSetupStep(1)}>
                  <ArrowLeft size={16} /> {t.backToMenu}
                </button>
              </fieldset>}
              {setupStep === 3 && <>
              <button type="button" className="text-button setup-back" onClick={() => setSetupStep(2)}>
                <ArrowLeft size={16} /> {t.backToMenu}
              </button>
              <label>
                {t.levelLabel}
                <select
                  value={profile.level}
                  onChange={(event) =>
                    updateProfile({ level: Number(event.target.value) })
                  }
                >
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((level) => {
                    const availability = levels.find(
                      (item) => item.level === level,
                    );
                    const count = availability?.count ?? 0;
                    return (
                      <option
                        key={level}
                        value={level}
                        disabled={!availability?.available}
                      >
                        {count
                          ? t.levelOption(level, count)
                          : t.levelEmpty(level)}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label>
                {t.answerModeLabel}
                <select
                  value={profile.answerMode ?? 'auto'}
                  onChange={(event) =>
                    updateProfile({ answerMode: event.target.value as AnswerMode })
                  }
                >
                  {answerModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {t.answerModes[mode]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Filtro de ejercicio
                <select
                  value={profile.filter ?? 'all'}
                  onChange={(event) =>
                    updateProfile({ filter: event.target.value as ContentFilter })
                  }
                >
                  {contentFilters.map((filter) => (
                    <option key={filter.id} value={filter.id}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="route-summary">
                <span className="level-badge">{t.routeBadge(route)}</span>
                <p>{t.answerModeHelp[profile.answerMode ?? 'auto']}</p>
              </div>
              <button
                className="primary"
                disabled={loading || !hasSelectedContent}
                onClick={() => startLesson()}
              >
                {loading ? t.loadingLabel : t.start}
                <ArrowRight size={19} />
              </button>
              </>}
            </div>
            {(loadError || availabilityError || !hasSelectedContent) && (
              <p role="alert" className="availability-note">
                {loadError || availabilityError || t.noContent}
              </p>
            )}
          </section>

          <section className="lesson-catalog" aria-labelledby="formats-title">
            <div className="catalog-heading">
              <h2 id="formats-title">{t.formatBreakdown}</h2>
              <span>{t.exerciseCount(selectedLevel?.count ?? 0)}</span>
            </div>
            <div className="format-cards">
              {(
                ['naming', 'translation', 'choice', 'cloze'] as QuestionType[]
              ).map((kind) => {
                const Icon = kindIcon[kind];
                const count =
                  (selectedLevel?.kinds as Record<string, number> | undefined)?.[
                    kind
                  ] ?? 0;
                return (
                  <article
                    key={kind}
                    className={'format-card' + (count ? '' : ' empty')}
                  >
                    <span className="format-icon">
                      <Icon size={20} />
                    </span>
                    <strong>
                      {t.typeName[kind as 'naming' | 'translation' | 'choice' | 'cloze']}
                    </strong>
                    <span className="format-count">{count}</span>
                    <p>
                      {t.instructionFor(kind, targetName)}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="lesson-catalog" aria-labelledby="demo-title">
            <div className="catalog-heading">
              <h2 id="demo-title">{t.demoProfiles}</h2>
              <span>{t.demoProfilesLead}</span>
            </div>
            <div className="lesson-cards demo-grid">
              {demoUsers.map((demo, i) => {
                const demoRoute = languagePair(demo.profile);
                return (
                  <article
                    className={
                      'course-card ' +
                      (i === 1 ? 'course-purple' : i === 2 ? 'course-blue' : '')
                    }
                    key={demo.name}
                  >
                    <div className="course-top">
                      <span className="level-badge">
                        {t.levelLabel} {demo.profile.level}
                      </span>
                      <span className="course-index">0{i + 1}</span>
                    </div>
                    <div className="course-symbol">
                      {i === 0 ? (
                        <Languages size={32} />
                      ) : i === 1 ? (
                        <Target size={32} />
                      ) : (
                        <BookOpen size={32} />
                      )}
                    </div>
                    <p className="course-kicker">{t.routeBadge(demoRoute)}</p>
                    <h3>{demo.name}</h3>
                    <p className="course-description">
                      {demo.profile.nativeLanguage === 'other'
                        ? t.otherLanguage
                        : `${languageName(demo.profile.nativeLanguage, reader)} → ${languageName(demo.profile.targetLanguage, reader)}`}
                    </p>
                    <div className="course-details">
                      <span>{t.levelLabel} {demo.profile.level}</span>
                      {records[profileKey(demo.profile)] !== undefined && (
                        <span className="mint">
                          {t.bestShort(records[profileKey(demo.profile)])}
                        </span>
                      )}
                    </div>
                    <button
                      className="primary"
                      disabled={loading}
                      onClick={() => updateProfile(demo.profile)}
                    >
                      {t.start}
                      <ArrowRight size={19} />
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        </main>
      )}

      {view === 'login' && (
        <main className="center-main">
          <section className="login-card">
            <button className="back-button" onClick={goHome}>
              <ArrowLeft size={17} /> {t.backToMenu}
            </button>
            <span className="large-icon">
              <Orbit size={32} />
            </span>
            <div className="eyebrow mint">{t.tagline}</div>
            <h1 ref={title} tabIndex={-1}>
              {authMode === 'signup' ? t.createAccount : t.signIn}
            </h1>
            <p className="muted">{t.localAccountNote}</p>
            <div className="auth-switch">
              <button
                type="button"
                className={authMode === 'signup' ? 'active' : ''}
                onClick={() => {
                  setAuthMode('signup');
                  setLoginError('');
                }}
              >
                {t.createTab}
              </button>
              <button
                type="button"
                className={authMode === 'login' ? 'active' : ''}
                onClick={() => {
                  setAuthMode('login');
                  setLoginError('');
                }}
              >
                {t.signInTab}
              </button>
            </div>
            <form onSubmit={login} className="login-form">
              <label htmlFor="username">{t.username}</label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <label htmlFor="password">{t.password}</label>
              <div className="password-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={
                    authMode === 'signup' ? 'new-password' : 'current-password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {loginError && (
                <p className="error" role="alert">
                  {loginError}
                </p>
              )}
              {loadError && (
                <p role="alert" className="error">
                  {loadError}
                </p>
              )}
              <button className="primary" disabled={loading}>
                {t.continueLabel}
                <ArrowRight size={19} />
              </button>
            </form>
            <div className="demo-account">
              <span>demo</span>
              <p>
                demo · <strong>Nebula123!</strong>
              </p>
              <button
                className="text-button mint"
                onClick={() => {
                  setAuthMode('login');
                  setUsername('demo');
                  setPassword('Nebula123!');
                  setLoginError('');
                }}
              >
                {t.fillDemo} <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </main>
      )}

      {view === 'lesson' && q && (
        <main className="lesson-main">
          <div className="lesson-heading">
            <button
              className="icon-button"
              onClick={goHome}
              aria-label={t.leaveLesson}
            >
              <X size={22} />
            </button>
            <div className="progress-wrap">
              <div className="progress-label">
                <span>
                  {t.routeBadge(route)} · {t.levelLabel} {profile.level}
                </span>
                <span>{t.progress(index + 1, questions.length)}</span>
              </div>
              <Progress
                value={(answers.length / questions.length) * 100}
                aria-label={t.progress(answers.length, questions.length)}
              />
            </div>
            <span className="points">
              <Sparkles size={18} /> {score * 10}
              <span>{t.points}</span>
            </span>
          </div>
          <section className={'question-card question-' + q.type}>
            <div className="question-meta">
              <span className="pill">
                {
                  t.typeName[
                    q.type as 'naming' | 'translation' | 'choice' | 'cloze'
                  ]
                }
              </span>
              <span className="small muted">
                {q.sourceCode} · {q.route}
              </span>
            </div>
            <h1 ref={title} tabIndex={-1}>
              {t.promptFor(
                q.type === 'choice' && q.answerMode === 'write'
                  ? 'naming'
                  : q.type,
                targetName,
              )}
            </h1>
            <p className="muted question-instruction">
              {q.answerMode === 'select' && q.type !== 'choice'
                ? t.selectInstruction(targetName)
                : t.instructionFor(
                    q.type === 'choice' && q.answerMode === 'write'
                      ? 'naming'
                      : q.type,
                    targetName,
                  )}
            </p>
            <form onSubmit={checkAnswer} onKeyDown={submitAnswerWithEnter}>
              <div className="exercise-content">
                {renderStage()}
                {q.hint && q.type !== 'cloze' && (
                  <p className={'hint-chip hint-' + (q.hintKind ?? 'none')}>
                    <span>{t.hintLabel[q.hintKind ?? 'none']}</span>
                    <em lang={answerTag}>{q.hint}</em>
                  </p>
                )}
                {q.optionsGenerated && (
                  <p className="small muted generated-note">
                    {t.generatedOptions}
                  </p>
                )}
                {renderAnswerArea()}
              </div>
              <div className="answer-footer">
                {checkError && (
                  <p
                    role="alert"
                    className="form-error"
                    style={{ gridColumn: '1 / -1' }}
                  >
                    {checkError}
                  </p>
                )}
                <button
                  className="secondary edit-answer"
                  type="button"
                  onClick={editAnswer}
                  disabled={checking || !selected.trim()}
                >
                  {t.edit}
                </button>
                {checked ? (
                  <button
                    type="button"
                    className="primary"
                    onClick={() => setFeedbackOpen(true)}
                  >
                    {t.seeSolution} <ArrowRight size={19} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="primary"
                    disabled={checking || !selected.trim()}
                  >
                    {checking ? t.checking : t.check} <ArrowRight size={19} />
                  </button>
                )}
              </div>
            </form>
          </section>
          <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
            <DialogContent
              className="lesson-dialog"
              showCloseButton={false}
              finalFocus={title}
            >
              <span
                className={
                  'modal-result-icon ' +
                  (answers[index]?.correct ? 'good' : 'incorrect')
                }
                aria-hidden="true"
              >
                {answers[index]?.correct ? (
                  <Check size={32} />
                ) : (
                  <PencilLine size={32} />
                )}
              </span>
              <DialogTitle className="modal-title">{feedbackTitle}</DialogTitle>
              <DialogDescription className="modal-description">
                {[
                  feedback?.quality === 'accent'
                    ? t.accentNote(feedback.answer)
                    : feedback?.correct
                      ? null
                      : t.expected(feedback?.answer ?? ''),
                  feedback?.accepted?.length
                    ? t.alsoAccepted(feedback.accepted.join(', '))
                    : null,
                  !feedback?.correct && selected ? t.yourAnswer(selected) : null,
                ]
                  .filter(Boolean)
                  .join(' ') || t.expected(feedback?.answer ?? '')}
              </DialogDescription>
              <div className="modal-actions">
                <button type="button" className="primary" onClick={next}>
                  {index === questions.length - 1 ? t.seeResult : t.next}
                  <ArrowRight size={19} />
                </button>
                <button type="button" className="secondary" onClick={editAnswer}>
                  {t.edit}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      )}

      {view === 'results' && (
        <main className="results-main">
          <section className="results-card">
            <Image
              unoptimized
              src="/assets/trophy.svg"
              width="104"
              height="104"
              alt=""
            />
            <div className="eyebrow mint">{t.routeBadge(route)}</div>
            <h1 ref={title} tabIndex={-1}>
              {t.resultHeading(score, questions.length)}
            </h1>
            <p className="muted">{t.resultLead}</p>
            <div className="result-stats">
              <div>
                <strong>{score * 10}</strong>
                <span>{t.statPoints}</span>
              </div>
              <div>
                <strong>
                  {score}/{questions.length}
                </strong>
                <span>{t.statCorrect}</span>
              </div>
              <div>
                <strong>
                  {best ?? score}/{questions.length}
                </strong>
                <span>
                  {improved ? t.newRecord : t.statBest}
                </span>
              </div>
            </div>
            <h2>{t.reviewTitle}</h2>
            <div className="review-list">
              {questions.map((item, i) => {
                const solution = answers[i]?.solution ?? item.review;
                return (
                  <div className="review-row" key={item.id}>
                    <span className={answers[i]?.correct ? 'mint' : 'amber'}>
                      {answers[i]?.correct ? (
                        <Check size={20} />
                      ) : (
                        <RotateCcw size={19} />
                      )}
                    </span>
                    <div>
                      <strong lang={languages[item.targetLanguage ?? profile.targetLanguage].tag}>
                        {item.sentence ? `${item.sentence} → ${solution}` : solution}
                      </strong>
                      {answers[i] && !answers[i].correct && (
                        <p className="your-answer">
                          {t.yourAnswer(answers[i].value)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="results-actions">
              <button
                className="primary"
                onClick={() => loadLesson()}
                disabled={loading}
              >
                <RotateCcw size={18} />
                {t.again}
              </button>
              <button className="secondary" onClick={goHome}>
                {t.backToMenu}
              </button>
            </div>
            {loadError && (
              <p role="alert" className="error">
                {loadError}
              </p>
            )}
          </section>
        </main>
      )}
      {view !== 'lesson' && (
        <footer className="footer">
          <span>
            NEBULA TECH <span className="footer-dot">/</span> {t.tagline}
          </span>
          <span>
            <a href="https://openmoji.org/">OpenMoji · CC BY-SA 4.0</a>
          </span>
        </footer>
      )}
    </div>
  );
}
