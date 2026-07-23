import { getShare } from '@/src/features/share/mockShareStore';
import { isMockApiMode, mockFail, mockNotFound, mockOk } from '@/src/lib/mock-api/preview';

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  if (!isMockApiMode()) return mockNotFound();
  const { token } = await context.params;
  const share = getShare(token);
  if (!share) return mockFail('RESOURCE_NOT_FOUND', 'Tautan bagikan tidak ditemukan.', 404);
  if (share.status === 'revoked') {
    return mockFail('SHARE_REVOKED', 'Tautan bagikan sudah dicabut.', 410);
  }
  if (share.status === 'expired') {
    return mockFail('SHARE_EXPIRED', 'Tautan bagikan sudah kedaluwarsa.', 410);
  }
  return mockOk({
    title: share.title,
    sheets: share.packageLabels.map((label, index) => ({
      id: `s${index + 1}`,
      label,
      url: '#',
    })),
  });
}
