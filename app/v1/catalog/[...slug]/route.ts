import type { NextRequest } from 'next/server';
import { proxyAuthenticatedRequest } from '@/src/lib/api/bffProxy';

async function proxy(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  const path = `/v1/catalog/${slug.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;
  return proxyAuthenticatedRequest(request, path);
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
