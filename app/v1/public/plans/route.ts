import { NextResponse } from 'next/server';
import { backendFetch } from '@/src/lib/api/session';

/**
 * Server-side passthrough for the public plan catalog — the only place a plan
 * price may enter the frontend. Public pages call this through
 * `fetchPublicPlans()`, which reads it on the server and never proxies to the
 * browser (see src/lib/api/plans.ts) so the app's own origin serves the catalog.
 */
export async function GET() {
  try {
    const upstream = await backendFetch('/v1/public/plans', { method: 'GET' });
    const body = await upstream.json().catch(() => null);
    return NextResponse.json(
      body ?? { error: { code: 'UPSTREAM_ERROR', message: 'Respons backend tidak valid.' } },
      { status: upstream.status },
    );
  } catch {
    return NextResponse.json(
      { error: { code: 'NETWORK', message: 'Tidak dapat terhubung.' } },
      { status: 502 },
    );
  }
}
