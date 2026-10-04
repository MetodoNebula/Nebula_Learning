import { levelAvailability } from '../../../../lib/server/questions.ts';
import { demoEnabled, json, readProfile } from '../../../../lib/server/http.ts';

export async function GET(request: Request) {
  if (!demoEnabled()) return json({ error: 'DEMO_DISABLED' }, 503);
  const profile = readProfile(request);
  if (!profile) return json({ error: 'INVALID_PROFILE' }, 400);
  try {
    return json({ levels: await levelAvailability(profile) });
  } catch (error) {
    console.error('availability_load_failed', error);
    return json({ error: 'INTERNAL_ERROR' }, 500);
  }
}
