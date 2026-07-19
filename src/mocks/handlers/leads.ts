import { HttpResponse, delay, http } from 'msw';

type LeadErrorBody = {
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
    retryable?: boolean;
  };
};

type LeadSuccessBody = {
  data: { leadId: string; receivedAt: string };
};

function ok(data: LeadSuccessBody['data']): HttpResponse<LeadSuccessBody> {
  return HttpResponse.json<LeadSuccessBody>({ data }, { status: 200 });
}

function fail(
  code: string,
  message: string,
  status: number,
  fieldErrors?: Record<string, string[]>,
  retryAfterSeconds?: number,
): HttpResponse<LeadErrorBody> {
  const body: LeadErrorBody = {
    error: {
      code,
      message,
      fieldErrors,
      retryable:
        code === 'RATE_LIMITED' ||
        code === 'MAINTENANCE_MODE' ||
        code === 'SERVICE_UNAVAILABLE',
    },
  };
  const headers: Record<string, string> = {};
  if (retryAfterSeconds !== undefined) {
    headers['Retry-After'] = String(retryAfterSeconds);
  }
  return HttpResponse.json<LeadErrorBody>(body, { status, headers });
}

type LeadPayload = {
  name?: string;
  email?: string;
  phone?: string;
  school?: string;
  role?: string;
  teacherCount?: number;
  goal?: string;
  consent?: boolean;
};

const ALLOWED_ROLES = new Set([
  'kepala_sekolah',
  'guru',
  'kurikulum',
  'lainnya',
]);

// MSW handler for the school lead submission. Documents the local payload shape
// and the rate-limit / validation responses expected by the FE.
//
// Contract (local-only):
//   POST /v1/leads/school
//   Body: {
//     name: string,
//     email?: string,
//     phone?: string,
//     school: string,
//     role: 'kepala_sekolah' | 'guru' | 'kurikulum' | 'lainnya',
//     teacherCount: number,
//     goal?: string,
//     consent: true
//   }
//   Success: 200 { data: { leadId, receivedAt } }
//   Failure modes: 400 VALIDATION_FAILED, 429 RATE_LIMITED (Retry-After: 60),
//                  503 MAINTENANCE_MODE.
export const leadHandlers = [
  http.post<never, LeadPayload>('/v1/leads/school', async ({ request }) => {
    await delay(160);
    const body = (await request.json()) as LeadPayload;
    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim();
    const phone = String(body.phone ?? '').trim();
    const school = String(body.school ?? '').trim();
    const role = String(body.role ?? '');
    const teacherCount = Number(body.teacherCount);
    const consent = body.consent === true;

    if (!name || !school || (!email && !phone) || !consent) {
      const fieldErrors: Record<string, string[]> = {};
      if (!name) fieldErrors.name = ['Nama wajib diisi.'];
      if (!school) fieldErrors.school = ['Sekolah wajib diisi.'];
      if (!email && !phone)
        fieldErrors.contact = ['Masukkan email atau nomor telepon kerja.'];
      if (!consent) fieldErrors.consent = ['Persetujuan wajib dicentang.'];
      return fail(
        'VALIDATION_FAILED',
        'Periksa kembali isian formulir.',
        400,
        fieldErrors,
      );
    }

    if (!ALLOWED_ROLES.has(role)) {
      return fail(
        'VALIDATION_FAILED',
        'Peran tidak dikenali.',
        400,
        { role: ['Pilih peran yang tersedia.'] },
      );
    }

    if (!Number.isFinite(teacherCount) || teacherCount <= 0) {
      return fail(
        'VALIDATION_FAILED',
        'Perkiraan jumlah guru tidak valid.',
        400,
        { teacherCount: ['Perkiraan jumlah guru tidak valid.'] },
      );
    }

    if (email === 'rate-limited@sekolah.id' || phone === '0000000000') {
      return fail(
        'RATE_LIMITED',
        'Terlalu banyak permintaan.',
        429,
        undefined,
        60,
      );
    }

    return ok({
      leadId: 'lead_demo',
      receivedAt: new Date().toISOString(),
    });
  }),
];
