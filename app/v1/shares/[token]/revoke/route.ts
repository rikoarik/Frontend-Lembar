import { revokeShare } from '@/src/features/share/mockShareStore';
import { isMockApiMode, mockFail, mockNotFound, mockOk } from '@/src/lib/mock-api/preview';

export async function POST(_request: Request, context: { params: Promise<{ token: string }> }) {
  if (!isMockApiMode()) {
    return mockFail(
      'FEATURE_UNAVAILABLE',
      'Revoke share publik belum tersambung ke backend live.',
      501,
    );
  }
  const { token } = await context.params;
  const share = revokeShare(token);
  if (!share) return mockFail('RESOURCE_NOT_FOUND', 'Tautan bagikan tidak ditemukan.', 404);
  return mockOk(share);
}
