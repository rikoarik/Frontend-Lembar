import {
  authSuccessPayload,
  isMockApiMode,
  mockFail,
  mockNotFound,
  mockOk,
} from '@/src/lib/mock-api/preview';

export async function POST(request: Request) {
  if (!isMockApiMode()) return mockNotFound();

  let body: { identifier?: string; password?: string } = {};
  try {
    body = (await request.json()) as { identifier?: string; password?: string };
  } catch {
    return mockFail('VALIDATION_FAILED', 'Periksa kembali isian formulir.', 400);
  }

  const identifier = String(body.identifier ?? '').trim();
  const password = String(body.password ?? '');

  if (identifier === 'demo' && password === 'demo1234') {
    return mockOk(authSuccessPayload(), { setSession: true });
  }

  return mockFail(
    'INVALID_CREDENTIALS',
    'Username/email/phone dan kata sandi tidak cocok.',
    401,
  );
}
