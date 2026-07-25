import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';
import { isMockApiMode } from '@/src/lib/mock-api/preview';

function extractToken(request: NextRequest, jar: Awaited<ReturnType<typeof cookies>>): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match?.[1]) return match[1].trim();
  }

  const cookieToken =
    jar.get(JWT_COOKIE)?.value ||
    jar.get(SESSION_COOKIE)?.value ||
    jar.get('token')?.value ||
    jar.get('jwt')?.value;

  return cookieToken?.trim() || null;
}

async function handleProxy(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  const path = `/v1/admin/${slug.join('/')}`;
  const search = request.nextUrl.search;
  const fullPath = `${path}${search}`;

  const jar = await cookies();
  const token = extractToken(request, jar);

  console.log(`[Admin Proxy ${request.method}] Path:`, fullPath);
  console.log('[Admin Proxy] Token found:', token ? `${token.slice(0, 12)}...` : 'NONE');

  if (!token && !isMockApiMode()) {
    console.warn('[Admin Proxy] Rejected 401: No token found in cookies or Authorization header.');
    return NextResponse.json(
      {
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Token autentikasi tidak ditemukan. Silakan masuk terlebih dahulu.',
          retryable: false,
        },
      },
      { status: 401 },
    );
  }

  // ── Mock API Fallback ────────────────────────────────────────────────
  if (isMockApiMode()) {
    console.log('[Admin Proxy] Mock API Mode active. Returning mock response for path:', path);

    if (path === '/v1/admin/accounts') {
      const q = request.nextUrl.searchParams.get('q') || '';
      const role = request.nextUrl.searchParams.get('role') || '';
      const status = request.nextUrl.searchParams.get('status') || '';
      const pageNum = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
      const limitNum = parseInt(request.nextUrl.searchParams.get('limit') || '10', 10);

      const allRows = [
        { id: 'acc_1', displayName: 'Ops Superadmin', email: 'ops@lembar.id', role: 'superadmin', status: 'aktif', school: 'Lembar HQ' },
        { id: 'acc_2', displayName: 'Demo Guru', email: 'guru@lembar.id', role: 'teacher', status: 'aktif', school: 'SDN Contoh 01' },
        { id: 'acc_3', displayName: 'Admin Sekolah', email: 'admin@lembar.id', role: 'school_admin', status: 'aktif', school: 'SDN Contoh 01' },
        { id: 'acc_4', displayName: 'Budi Santoso', email: 'budi@sdncontoh.sch.id', role: 'teacher', status: 'aktif', school: 'SDN Contoh 01' },
        { id: 'acc_5', displayName: 'Iwan Setiawan', email: 'iwan@sdncontoh.sch.id', role: 'teacher', status: 'baru', school: 'SDN Contoh 02' },
        { id: 'acc_6', displayName: 'Siti Rahma', email: 'siti@sdncontoh.sch.id', role: 'school_admin', status: 'ditangguhkan', school: 'SDN Contoh 02' },
        { id: 'acc_7', displayName: 'Ahmad Dahlan', email: 'ahmad@sdncontoh.sch.id', role: 'teacher', status: 'aktif', school: 'SDN Contoh 01' },
        { id: 'acc_8', displayName: 'Dewi Sartika', email: 'dewi@smpn01.sch.id', role: 'teacher', status: 'aktif', school: 'SMPN 01 Kota' },
        { id: 'acc_9', displayName: 'R.A. Kartini', email: 'kartini@smpn01.sch.id', role: 'school_admin', status: 'aktif', school: 'SMPN 01 Kota' },
        { id: 'acc_10', displayName: 'Ki Hajar Dewantara', email: 'kihajar@sma1.sch.id', role: 'teacher', status: 'aktif', school: 'SMAN 01 Merdeka' },
        { id: 'acc_11', displayName: 'Bambang Pamungkas', email: 'bambang@sma1.sch.id', role: 'teacher', status: 'baru', school: 'SMAN 01 Merdeka' },
        { id: 'acc_12', displayName: 'Cut Nyak Dien', email: 'cutnyak@sdn03.sch.id', role: 'school_admin', status: 'aktif', school: 'SDN 03 Bandung' },
        { id: 'acc_13', displayName: 'Pangeran Diponegoro', email: 'diponegoro@sdn03.sch.id', role: 'teacher', status: 'aktif', school: 'SDN 03 Bandung' },
        { id: 'acc_14', displayName: 'Mohammad Hatta', email: 'hatta@lembar.id', role: 'superadmin', status: 'aktif', school: 'Lembar HQ' },
        { id: 'acc_15', displayName: 'Soekarno Hatta', email: 'soekarno@lembar.id', role: 'superadmin', status: 'aktif', school: 'Lembar HQ' },
        { id: 'acc_16', displayName: 'Megawati Soekarnoputri', email: 'megawati@sdn04.sch.id', role: 'teacher', status: 'ditangguhkan', school: 'SDN 04 Jakarta' },
        { id: 'acc_17', displayName: 'Gus Dur Wahid', email: 'gusdur@sdn04.sch.id', role: 'teacher', status: 'aktif', school: 'SDN 04 Jakarta' },
        { id: 'acc_18', displayName: 'Habibie Research', email: 'habibie@smpn02.sch.id', role: 'school_admin', status: 'aktif', school: 'SMPN 02 Surabaya' },
        { id: 'acc_19', displayName: 'Sutan Sjahrir', email: 'sjahrir@smpn02.sch.id', role: 'teacher', status: 'baru', school: 'SMPN 02 Surabaya' },
        { id: 'acc_20', displayName: 'Tan Malaka', email: 'tanmalaka@smpn02.sch.id', role: 'teacher', status: 'aktif', school: 'SMPN 02 Surabaya' },
        { id: 'acc_21', displayName: 'Jendral Soedirman', email: 'soedirman@sman02.sch.id', role: 'school_admin', status: 'aktif', school: 'SMAN 02 Jogja' },
        { id: 'acc_22', displayName: 'Pattimura Maluku', email: 'pattimura@sman02.sch.id', role: 'teacher', status: 'aktif', school: 'SMAN 02 Jogja' },
        { id: 'acc_23', displayName: 'Teuku Umar', email: 'teukuumar@sdn05.sch.id', role: 'teacher', status: 'ditangguhkan', school: 'SDN 05 Aceh' },
        { id: 'acc_24', displayName: 'Martha Christina', email: 'martha@sdn05.sch.id', role: 'teacher', status: 'aktif', school: 'SDN 05 Aceh' },
        { id: 'acc_25', displayName: 'I Gusti Ngurah Rai', email: 'ngurahrai@sdn06.sch.id', role: 'teacher', status: 'baru', school: 'SDN 06 Bali' },
        { id: 'acc_26', displayName: 'Frans Kaisiepo', email: 'frans@sdn07.sch.id', role: 'teacher', status: 'aktif', school: 'SDN 07 Papua' },
      ];

      const filtered = allRows.filter((r) => {
        const matchQ =
          !q ||
          r.displayName.toLowerCase().includes(q.toLowerCase()) ||
          r.email.toLowerCase().includes(q.toLowerCase());
        const matchRole = !role || r.role === role;
        const matchStatus = !status || r.status === status;
        return matchQ && matchRole && matchStatus;
      });

      const pages = Math.ceil(filtered.length / limitNum);
      const slice = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return NextResponse.json({
        data: slice,
        meta: {
          total: filtered.length,
          page: pageNum,
          limit: limitNum,
          pages: Math.max(1, pages),
        },
      });
    }

    if (path.startsWith('/v1/admin/accounts/bulk/')) {
      const ids = ((await request.json().catch(() => ({})))?.ids || []) as string[];
      const results = ids.map((id) => ({ id, success: true }));
      return NextResponse.json({
        data: {
          results,
          succeeded: ids.length,
          failed: 0,
        },
      });
    }

    if (path.startsWith('/v1/admin/accounts/') && path.endsWith('/suspend')) {
      const id = path.split('/')[4];
      return NextResponse.json({ data: { id, suspended: true } });
    }

    if (path.startsWith('/v1/admin/accounts/') && path.endsWith('/unsuspend')) {
      const id = path.split('/')[4];
      return NextResponse.json({ data: { id, suspended: false } });
    }

    if (path.startsWith('/v1/admin/accounts/') && path.endsWith('/reset-password')) {
      const id = path.split('/')[4];
      return NextResponse.json({ data: { id, resetSent: true } });
    }

    if (path.startsWith('/v1/admin/accounts/') && path.endsWith('/roles')) {
      const id = path.split('/')[4];
      return NextResponse.json({ data: { id, roles: ['teacher'] } });
    }

    if (path === '/v1/admin/accounts/invite') {
      const body = await request.json().catch(() => ({}));
      return NextResponse.json(
        { data: { email: body.email || 'guru@sekolah.sch.id', invited: true } },
        { status: 201 },
      );
    }

    if (request.method === 'PATCH' && path.startsWith('/v1/admin/accounts/')) {
      const id = path.split('/')[4];
      const body = ((await request.json().catch(() => ({}))) || {}) as { name?: string; phone?: string };
      return NextResponse.json({
        data: {
          id,
          email: 'kartini.wahyuni@smanusantara.sch.id',
          name: body.name || 'Kartini Wahyuni',
          username: 'kartini_wahyuni',
          phone: body.phone ?? null,
          roles: ['teacher'],
          role: 'teacher',
          status: 'ditangguhkan',
          school: 'SMA Nusantara',
          schoolSlug: 'sma-nusantara',
          workspaceId: 'ws_kartini',
          billing: {
            state: 'blocked',
            plan: 'free',
            seats: 60,
            renewsAt: '2026-07-27T10:00:00Z',
          },
          stats: {
            jobsTotal: 0,
            quotaUsed: 0,
          },
          createdAt: '2026-01-15T08:30:00Z',
          updatedAt: new Date().toISOString(),
          lastLoginAt: null,
          auditLog: [
            {
              id: 'audit_1',
              action: 'account.impersonate',
              at: '2026-07-25T17:54:23Z',
              by: 'ops@lembar.id',
            },
          ],
        },
      });
    }

    if (path.startsWith('/v1/admin/accounts/')) {
      const id = path.split('/')[4];
      return NextResponse.json({
        data: {
          id,
          email: 'kartini.wahyuni@smanusantara.sch.id',
          name: 'Kartini Wahyuni',
          username: 'kartini_wahyuni',
          phone: null,
          roles: ['teacher'],
          role: 'teacher',
          status: 'ditangguhkan',
          school: 'SMA Nusantara',
          schoolSlug: 'sma-nusantara',
          workspaceId: 'ws_kartini',
          billing: {
            state: 'blocked',
            plan: 'free',
            seats: 60,
            renewsAt: '2026-07-27T10:00:00Z',
          },
          stats: {
            jobsTotal: 0,
            quotaUsed: 0,
          },
          createdAt: '2026-01-15T08:30:00Z',
          updatedAt: '2026-07-25T17:54:23Z',
          lastLoginAt: null,
          auditLog: [
            {
              id: 'audit_1',
              action: 'account.impersonate',
              at: '2026-07-25T17:54:23Z',
              by: 'ops@lembar.id',
            },
          ],
        },
      });
    }

    // Default mock response for other endpoints (dashboard, schools, jobs, quality-reports, billing, flags, prompts, audit)
    if (path === '/v1/admin/dashboard') {
      return NextResponse.json({
        data: {
          users: 42,
          schools: 5,
          jobsActive: 3,
          qualityOpen: 2,
          flagsEnabled: 4,
        },
      });
    }

    if (path === '/v1/admin/schools') {
      return NextResponse.json({
        data: [
          {
            id: 'sch_1',
            name: 'SDN Contoh 01',
            plan: 'active',
            teachers: 12,
            seats: 20,
            renewsAt: '2026-12-31',
            owner: 'admin@lembar.id',
          },
        ],
      });
    }

    if (path.startsWith('/v1/admin/jobs')) {
      return NextResponse.json({
        data: [
          {
            id: 'job_8f2a',
            type: 'GENERATE_ASSESSMENT',
            tenant: 'SDN Contoh 01',
            status: 'running',
            progress: '65%',
            updatedAt: '2 menit lalu',
          },
        ],
      });
    }

    return NextResponse.json({ data: [] });
  }

  let body: unknown = undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.json();
    } catch {
      body = undefined;
    }
  }

  console.log(`[Admin Proxy] Forwarding to backend: Authorization Bearer ${token?.slice(0, 10)}...`);
  const upstream = await backendFetch(fullPath, {
    method: request.method,
    token,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await upstream.json().catch(() => null);
  console.log('[Admin Proxy] Backend response status:', upstream.status);

  if (!upstream.ok) {
    console.error('[Admin Proxy] Backend error response:', payload);
    return NextResponse.json(
      payload ?? { error: { code: 'UPSTREAM_ERROR', message: 'Gagal mengambil data dari server.' } },
      { status: upstream.status },
    );
  }

  return NextResponse.json(payload ?? { data: null }, { status: 200 });
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const PUT = handleProxy;
