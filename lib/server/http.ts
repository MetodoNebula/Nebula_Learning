import type {
  AnswerMode,
  ContentFilter,
  LanguageId,
  LearningProfile,
  NativeLanguageId,
} from '../lesson.ts';

const answerModes: AnswerMode[] = ['auto', 'write', 'select', 'mixed'];
const filters: ContentFilter[] = ['all', 'Z', 'C', 'T'];

/** Reads and validates the learning route from the query string. */
export function readProfile(
  request: Request,
  { requireLevel = false } = {},
): LearningProfile | null {
  const params = new URL(request.url).searchParams;
  const nativeLanguage = params.get('nativeLanguage');
  const targetLanguage = params.get('targetLanguage');
  const answerMode = params.get('answerMode') ?? 'auto';
  const filter = params.get('filter') ?? 'all';
  if (nativeLanguage !== 'other' && !/^[1-5]$/.test(nativeLanguage ?? ''))
    return null;
  if (!/^[1-5]$/.test(targetLanguage ?? '')) return null;
  if (!answerModes.includes(answerMode as AnswerMode)) return null;
  if (!filters.includes(filter as ContentFilter)) return null;
  const level = Number(params.get('level'));
  if (requireLevel && !(Number.isInteger(level) && level >= 1 && level <= 9))
    return null;
  return {
    nativeLanguage: nativeLanguage as NativeLanguageId,
    targetLanguage: targetLanguage as LanguageId,
    level: requireLevel ? level : 1,
    answerMode: answerMode as AnswerMode,
    filter: filter as ContentFilter,
  };
}

export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

// A production runtime must explicitly opt into publicly accessible demo APIs.
export function demoEnabled() {
  return (
    process.env.NEBULA_DEMO_ENABLED === 'true' ||
    (process.env.NODE_ENV !== 'production' &&
      process.env.NEBULA_DEMO_ENABLED !== 'false')
  );
}

export async function readAnswer(
  request: Request,
): Promise<{ questionId: string; value: string }> {
  if (
    request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !==
    'application/json'
  )
    throw new Error('Invalid content type');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Missing body');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 4096) {
        await reader.cancel();
        throw new Error('Body too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  const data = JSON.parse(new TextDecoder().decode(bytes));
  if (
    !data ||
    typeof data.questionId !== 'string' ||
    !data.questionId ||
    data.questionId.length > 100 ||
    typeof data.value !== 'string' ||
    data.value.length > 500
  )
    throw new Error('Invalid answer');
  return { questionId: data.questionId, value: data.value };
}
