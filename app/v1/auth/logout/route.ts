import { isMockApiMode, mockOk } from '@/src/lib/mock-api/preview';
import { mockNotFound } from '@/src/lib/mock-api/preview';

export async function POST() {
  if (!isMockApiMode()) return mockNotFound();
  return mockOk({ loggedOut: true }, { clearSession: true });
}
