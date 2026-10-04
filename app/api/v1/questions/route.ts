import { lessons } from '../../../../lib/lesson.ts';
import {
  exercises,
  profileExercises,
} from '../../../../lib/server/questions.ts';
import { demoEnabled, json, readProfile } from '../../../../lib/server/http.ts';

export async function GET(request: Request) {
  if (!demoEnabled()) return json({ error: 'DEMO_DISABLED' }, 503);
  const params = new URL(request.url).searchParams;
  if (params.has('targetLanguage')) {
    const profile = readProfile(request, { requireLevel: true });
    if (!profile) return json({ error: 'INVALID_PROFILE' }, 400);
    try {
      return json({ questions: await profileExercises(profile) });
    } catch (error) {
      console.error('profile_questions_load_failed', error);
      return json({ error: 'INTERNAL_ERROR' }, 500);
    }
  }
  const id = params.get('lessonId');
  if (!lessons.some((lesson) => lesson.id === id))
    return json({ error: 'LESSON_NOT_FOUND' }, 404);
  try {
    return json({ questions: await exercises(id!) });
  } catch (error) {
    console.error('questions_load_failed', error);
    return json({ error: 'INTERNAL_ERROR' }, 500);
  }
}
