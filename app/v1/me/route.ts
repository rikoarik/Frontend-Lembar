import { cookies } from 'next/headers';
import { isMockApiMode, mePayload, mockFail, mockNotFound, mockOk } from '@/src/lib/mock-api/preview';

export async function GET() {
  if (!isMockApiMode()) return mockNotFound();

  const jar = await cookies();
  if (!jar.has('lembar_session')) {
    return mockFail('AUTH_REQUIRED', 'Silakan masuk terlebih dahulu.', 401);
  }

  return mockOk(mePayload());
}
