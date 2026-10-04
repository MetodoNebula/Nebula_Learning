import { evaluate } from '../../../../lib/server/questions.ts';
import { demoEnabled, json, readAnswer } from '../../../../lib/server/http.ts';

export async function POST(request: Request) {
  if (!demoEnabled()) return json({ error: 'DEMO_DISABLED' }, 503);
  let input;
  try {
    input = await readAnswer(request);
  } catch {
    return json({ error: 'INVALID_ANSWER' }, 400);
  }
  try {
    const feedback = await evaluate(input.questionId, input.value);
    return feedback
      ? json(feedback)
      : json({ error: 'QUESTION_NOT_FOUND' }, 404);
  } catch (error) {
    console.error('answer_grade_failed', error);
    return json({ error: 'INTERNAL_ERROR' }, 500);
  }
}
