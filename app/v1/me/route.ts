import { cookies } from 'next/headers';
import { findMockAccountBySession, mePayloadFor } from '@/src/lib/mock-api/accounts';
import { isMockApiMode, mePayload, mockFail, mockNotFound, mockOk } from '@/src/lib/mock-api/preview';

export async function GET() {
  if (!isMockApiMode()) return mockNotFound();

  const jar = await cookies();
  const session = jar.get('lembar_session')?.value;
  if (!session) {
    return mockFail('AUTH_REQUIRED', 'Silakan masuk terlebih dahulu.', 401);
  }

  const account = findMockAccountBySession(session);
  if (!account) {
    // Keep legacy demo session working.
    if (session === 'demo') return mockOk(mePayload());
    return mockFail('AUTH_REQUIRED', 'Sesi tidak valid. Masuk ulang.', 401);
  }

  return mockOk(mePayloadFor(account));
}
