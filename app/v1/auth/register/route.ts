import {
  authSuccessPayload,
  isMockApiMode,
  mockFail,
  mockNotFound,
  mockOk,
} from '@/src/lib/mock-api/preview';

export async function POST(request: Request) {
  if (!isMockApiMode()) return mockNotFound();

  let body: {
    username?: string;
    email?: string;
    phone?: string;
    password?: string;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return mockFail('VALIDATION_FAILED', 'Periksa kembali isian formulir.', 400);
  }

  if (!body.username || !body.email || !body.phone || !body.password) {
    return mockFail('VALIDATION_FAILED', 'Lengkapi semua isian.', 400, {
      username: body.username ? [] : ['Wajib diisi.'],
      email: body.email ? [] : ['Wajib diisi.'],
      phone: body.phone ? [] : ['Wajib diisi.'],
      password: body.password ? [] : ['Wajib diisi.'],
    });
  }

  if (body.email === 'demo@example.com') {
    return mockFail('DUPLICATE_RESOURCE', 'Email sudah terdaftar.', 409, {
      email: ['Email sudah terdaftar.'],
    });
  }

  return mockOk(authSuccessPayload(), { setSession: true });
}
