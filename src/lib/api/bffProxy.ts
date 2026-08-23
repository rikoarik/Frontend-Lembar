import 'server-only';

import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

const DEFAULT_MAX_BODY_BYTES = 2 * 1024 * 1024;

type ProxyOptions = {
  maxBodyBytes: number;
};
const REQUEST_HEADERS = [
  'accept-language',
  'content-type',
  'idempotency-key',
  'if-match',
  'x-workspace-id',
] as const;
const RESPONSE_HEADERS = [
  'cache-control',
  'content-disposition',
  'content-type',
  'etag',
  'location',
  'retry-after',
] as const;

function error(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message, retryable: status >= 500 } }, { status });
}

export async function proxyAuthenticatedRequest(
  request: NextRequest,
  backendPath: string,
  options?: ProxyOptions,
): Promise<NextResponse> {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
  if (!token) return error('AUTH_REQUIRED', 'Silakan masuk terlebih dahulu.', 401);

  const maxBodyBytes = options?.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declaredLength) && declaredLength > maxBodyBytes) {
    return error('PAYLOAD_TOO_LARGE', 'Payload terlalu besar.', 413);
  }

  const headers = new Headers();
  for (const name of REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  let body: ArrayBuffer | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const requestBody = await request.arrayBuffer();
    if (requestBody.byteLength > maxBodyBytes) {
      return error('PAYLOAD_TOO_LARGE', 'Payload terlalu besar.', 413);
    }
    if (requestBody.byteLength > 0) body = requestBody;
  }

  try {
    const upstream = await backendFetch(backendPath, {
      method: request.method,
      token,
      headers,
      body,
      signal: request.signal,
    });
    const responseHeaders = new Headers();
    for (const name of RESPONSE_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return error('UPSTREAM_UNAVAILABLE', 'Layanan backend tidak dapat dihubungi.', 502);
  }
}
