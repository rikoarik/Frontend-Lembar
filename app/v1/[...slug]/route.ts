import { NextResponse } from 'next/server';

/**
 * Catch-all for unmatched `/v1/*` paths.
 *
 * Without this, an unknown `/v1/*` path falls through to the Next.js page
 * renderer and answers `200 text/html` (the app shell), so a client that
 * mistypes an endpoint parses HTML as JSON instead of seeing a clear 404.
 * Specific `app/v1/**` route handlers take precedence over this catch-all.
 */
function notFound(method: string, pathname: string) {
  return NextResponse.json(
    {
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${method} ${pathname} tidak ditemukan.`,
        retryable: false,
      },
    },
    { status: 404 },
  );
}

export function GET(request: Request) {
  return notFound('GET', new URL(request.url).pathname);
}
export function POST(request: Request) {
  return notFound('POST', new URL(request.url).pathname);
}
export function PUT(request: Request) {
  return notFound('PUT', new URL(request.url).pathname);
}
export function PATCH(request: Request) {
  return notFound('PATCH', new URL(request.url).pathname);
}
export function DELETE(request: Request) {
  return notFound('DELETE', new URL(request.url).pathname);
}
export function HEAD(request: Request) {
  return notFound('HEAD', new URL(request.url).pathname);
}
