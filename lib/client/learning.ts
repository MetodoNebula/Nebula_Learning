import { authenticate, lessons, type LearningProfile } from '../lesson.ts';
import type { LearningClient, Records } from '../contracts.ts';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch('/api/v1/' + path, {
    ...init,
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('Learning service unavailable');
  return response.json();
}

// Deliberately device-local demo identity/progress. All consumers use asynchronous
// methods so real session and progress endpoints can replace this adapter later.
export function createLearningClient(): LearningClient {
  let currentUser: string | null = null;
  const users: Record<string, string> = {};
  function readUsers() {
    try {
      Object.assign(
        users,
        JSON.parse(localStorage.getItem('nebula-users-v1') ?? '{}'),
      );
    } catch {
      /* Optional storage. */
    }
    return users;
  }
  function writeUsers() {
    try {
      localStorage.setItem('nebula-users-v1', JSON.stringify(users));
    } catch {
      /* Optional storage. */
    }
  }
  function setSession(username: string) {
    currentUser = username;
    try {
      sessionStorage.setItem('nebula-user', currentUser);
    } catch {
      /* Optional storage. */
    }
    return currentUser;
  }
  const scores: Records = {};
  return {
    async session() {
      try {
        currentUser = sessionStorage.getItem('nebula-user') || null;
      } catch {
        /* Optional storage. */
      }
      return currentUser;
    },
    async login(username, password) {
      const clean = username.trim();
      if (authenticate(clean, password)) return setSession('Alex');
      if (!clean || readUsers()[clean] !== password) return null;
      return setSession(clean);
    },
    async signup(username, password) {
      const clean = username.trim();
      if (clean.length < 2 || password.length < 4) return null;
      const saved = readUsers();
      saved[clean] = password;
      writeUsers();
      return setSession(clean);
    },
    async logout() {
      currentUser = null;
      try {
        sessionStorage.removeItem('nebula-user');
      } catch {
        /* Optional storage. */
      }
    },
    async records() {
      const knownKeys = lessons.map((lesson) => lesson.id);
      try {
        const rawKeys = localStorage.getItem('nebula-record-keys-v1');
        if (rawKeys) knownKeys.push(...JSON.parse(rawKeys));
      } catch {
        /* Optional storage. */
      }
      for (const key of new Set(knownKeys)) {
        try {
          const raw = localStorage.getItem('nebula-best-v2-' + key);
          const value = Number(raw);
          if (raw !== null && Number.isInteger(value) && value >= 0)
            scores[key] = value;
        } catch {
          /* Optional storage. */
        }
      }
      return { ...scores };
    },
    async saveRecord(id: string, score: number, maxScore?: number) {
      const limit =
        maxScore ??
        lessons.find((lesson) => lesson.id === id)?.count ??
        Number.MAX_SAFE_INTEGER;
      if (!Number.isInteger(score) || score < 0 || score > limit)
        throw new Error('Invalid score');
      await this.records();
      const best = Math.max(scores[id] ?? 0, score);
      scores[id] = best;
      try {
        localStorage.setItem('nebula-best-v2-' + id, String(best));
        const rawKeys = localStorage.getItem('nebula-record-keys-v1');
        const keys = rawKeys ? JSON.parse(rawKeys) : [];
        if (!keys.includes(id))
          localStorage.setItem(
            'nebula-record-keys-v1',
            JSON.stringify([...keys, id]),
          );
      } catch {
        /* Optional storage. */
      }
      return best;
    },
    async questions(input) {
      const query =
        typeof input === 'string'
          ? 'lessonId=' + encodeURIComponent(input)
          : profileQuery(input);
      const data = await request<{
        questions: Awaited<ReturnType<LearningClient['questions']>>;
      }>('questions?' + query);
      return data.questions;
    },
    async availability(profile) {
      const data = await request<{
        levels: Awaited<ReturnType<LearningClient['availability']>>;
      }>('availability?' + profileQuery(profile));
      return data.levels;
    },
    grade(questionId, value) {
      return request('grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, value }),
      });
    },
  };
}

function profileQuery(profile: LearningProfile) {
  const params = new URLSearchParams({
    nativeLanguage: profile.nativeLanguage,
    targetLanguage: profile.targetLanguage,
    level: String(profile.level),
    answerMode: profile.answerMode ?? 'auto',
    filter: profile.filter ?? 'all',
  });
  return params.toString();
}
