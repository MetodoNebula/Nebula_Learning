import { json } from '../../../lib/server/http.ts';
export function GET() {
  return json({ status: 'ok', service: 'nebula-tech' });
}
