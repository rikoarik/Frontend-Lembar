import { beforeEach, describe, expect, it, vi } from 'vitest';

const { cookieGet, backendFetch } = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  backendFetch: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: cookieGet })),
}));
vi.mock('@/src/lib/api/session', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/src/lib/api/session')>();
  return { ...original, backendFetch };
});

describe('authenticated BFF proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieGet.mockImplementation((name: string) =>
      name === 'lembar_token' ? { value: 'signed-token' } : undefined,
    );
  });

  it('forwards only allowlisted request headers and preserves upstream metadata', async () => {
    backendFetch.mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 'source-1' } }), {
        status: 201,
        headers: { 'content-type': 'application/json', etag: '"source-v1"' },
      }),
    );
    const { proxyAuthenticatedRequest } = await import('../bffProxy');
    const request = new Request('http://localhost/v1/sources/upload-intents', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'idempotency-key': 'idem-1',
        'x-workspace-id': 'workspace-1',
        'x-untrusted-header': 'must-not-forward',
      },
      body: JSON.stringify({ fileName: 'document.pdf' }),
    });

    const response = await proxyAuthenticatedRequest(
      request as never,
      '/v1/sources/upload-intents',
    );
    const forwarded = backendFetch.mock.calls[0]?.[1]?.headers as Headers;

    expect(response.status).toBe(201);
    expect(response.headers.get('etag')).toBe('"source-v1"');
    expect(forwarded.get('idempotency-key')).toBe('idem-1');
    expect(forwarded.get('x-workspace-id')).toBe('workspace-1');
    expect(forwarded.has('x-untrusted-header')).toBe(false);
  });

  it('forwards binary request bytes, content type, and abort signal unchanged', async () => {
    backendFetch.mockResolvedValue(new Response('{}', { status: 200 }));
    const { proxyAuthenticatedRequest } = await import('../bffProxy');
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x00, 0xff, 0xfe, 0x80]);
    const request = new Request('http://localhost/v1/uploads/sources/intake', {
      method: 'PUT',
      headers: { 'content-type': 'application/pdf' },
      body: bytes,
    });

    const response = await proxyAuthenticatedRequest(
      request as never,
      '/v1/uploads/sources/intake',
    );
    const forwarded = backendFetch.mock.calls[0]?.[1];
    const forwardedHeaders = forwarded?.headers as Headers;

    expect(response.status).toBe(200);
    expect(forwardedHeaders.get('content-type')).toBe('application/pdf');
    expect(forwarded?.signal).toBe(request.signal);
    expect(Array.from(new Uint8Array(forwarded?.body as ArrayBuffer))).toEqual(Array.from(bytes));
  });

  it('requires authentication', async () => {
    cookieGet.mockReturnValue(undefined);
    const { proxyAuthenticatedRequest } = await import('../bffProxy');
    const response = await proxyAuthenticatedRequest(
      new Request('http://localhost/v1/sources/source-1') as never,
      '/v1/sources/source-1',
    );

    expect(response.status).toBe(401);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('rejects payloads over the default declared limit before contacting the backend', async () => {
    const { proxyAuthenticatedRequest } = await import('../bffProxy');
    const response = await proxyAuthenticatedRequest(
      new Request('http://localhost/v1/sources/upload-intents', {
        method: 'POST',
        headers: { 'content-length': String(3 * 1024 * 1024) },
        body: '{}',
      }) as never,
      '/v1/sources/upload-intents',
    );

    expect(response.status).toBe(413);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('rejects payloads over the default actual limit without a declared length', async () => {
    const { proxyAuthenticatedRequest } = await import('../bffProxy');
    const response = await proxyAuthenticatedRequest(
      new Request('http://localhost/v1/sources/upload-intents', {
        method: 'POST',
        body: new Uint8Array(2 * 1024 * 1024 + 1),
      }) as never,
      '/v1/sources/upload-intents',
    );

    expect(response.status).toBe(413);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('allows a body at a custom maximum above the default limit', async () => {
    backendFetch.mockResolvedValue(new Response('{}', { status: 200 }));
    const { proxyAuthenticatedRequest } = await import('../bffProxy');
    const bytes = new Uint8Array(2 * 1024 * 1024 + 1);
    const response = await proxyAuthenticatedRequest(
      new Request('http://localhost/v1/uploads/sources/intake', {
        method: 'PUT',
        headers: { 'content-type': 'application/pdf' },
        body: bytes,
      }) as never,
      '/v1/uploads/sources/intake',
      { maxBodyBytes: bytes.byteLength },
    );

    expect(response.status).toBe(200);
    expect(backendFetch).toHaveBeenCalledOnce();
  });

  it('rejects an actual body over a custom maximum', async () => {
    const { proxyAuthenticatedRequest } = await import('../bffProxy');
    const response = await proxyAuthenticatedRequest(
      new Request('http://localhost/v1/uploads/sources/intake', {
        method: 'PUT',
        body: new Uint8Array([0xff, 0xfe, 0x00]),
      }) as never,
      '/v1/uploads/sources/intake',
      { maxBodyBytes: 2 },
    );

    expect(response.status).toBe(413);
    expect(backendFetch).not.toHaveBeenCalled();
  });
});
