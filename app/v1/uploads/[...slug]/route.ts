import type { NextRequest } from 'next/server';
import { proxyAuthenticatedRequest } from '@/src/lib/api/bffProxy';

const MAX_UPLOAD_BODY_BYTES = 50 * 1024 * 1024;

async function proxy(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  const path = `/v1/uploads/${slug.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;
  return proxyAuthenticatedRequest(request, path, { maxBodyBytes: MAX_UPLOAD_BODY_BYTES });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
