import { NextResponse } from 'next/server';
import { backendFetch } from '@/src/lib/api/session';

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
