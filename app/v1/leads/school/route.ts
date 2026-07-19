import { NextResponse } from 'next/server';

const ALLOWED_ROLES = new Set(['kepala_sekolah', 'guru', 'kurikulum', 'lainnya']);

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

function fail(
  code: string,
  message: string,
  status: number,
  fieldErrors?: Record<string, string[]>,
  retryAfterSeconds?: number,
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        fieldErrors,
        retryable: code === 'RATE_LIMITED' || code === 'MAINTENANCE_MODE',
      },
    },
    {
      status,
      headers:
        retryAfterSeconds === undefined ? undefined : { 'Retry-After': String(retryAfterSeconds) },
    },
  );
}

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_API_MODE === 'live') {
    return fail('RESOURCE_NOT_FOUND', 'Sumber tidak ditemukan.', 404);
  }

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
    if (!email && !phone) fieldErrors.contact = ['Masukkan email atau nomor telepon kerja.'];
    if (!consent) fieldErrors.consent = ['Persetujuan wajib dicentang.'];
    return fail('VALIDATION_FAILED', 'Periksa kembali isian formulir.', 400, fieldErrors);
  }

  if (!ALLOWED_ROLES.has(role)) {
    return fail('VALIDATION_FAILED', 'Peran tidak dikenali.', 400, {
      role: ['Pilih peran yang tersedia.'],
    });
  }

  if (!Number.isFinite(teacherCount) || teacherCount <= 0) {
    return fail('VALIDATION_FAILED', 'Perkiraan jumlah guru tidak valid.', 400, {
      teacherCount: ['Perkiraan jumlah guru tidak valid.'],
    });
  }

  if (email === 'rate-limited@sekolah.id' || phone === '0000000000') {
    return fail('RATE_LIMITED', 'Terlalu banyak permintaan.', 429, undefined, 60);
  }

  return NextResponse.json({
    data: { leadId: 'lead_demo', receivedAt: new Date(0).toISOString() },
  });
}
