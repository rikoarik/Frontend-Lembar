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

import { POST, TRIAL_DEVICE_COOKIE } from './route';

const claimRequest = (claimToken = 'one-time-claim-token-with-at-least-32-characters') =>
  new Request('http://localhost/v1/me/plan/trial/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claimToken }),
  });

describe('POST /v1/me/plan/trial/claim', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieGet.mockImplementation((name: string) =>
      name === 'lembar_token' ? { value: 'jwt-secret' } : undefined,
    );
  });

  it('requires an HttpOnly auth cookie', async () => {
    cookieGet.mockReturnValue(undefined);

    const response = await POST(claimRequest());

    expect(response.status).toBe(401);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('creates a secure opaque device cookie and only sends the token upstream', async () => {
    backendFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            trialClaimed: true,
            claimToken: 'must-not-leak',
            deviceToken: 'must-not-leak',
          },
        }),
        {
          status: 201,
          headers: { 'content-type': 'application/json' },
        },
      ),
    );

    const response = await POST(claimRequest());
    const upstreamInit = backendFetch.mock.calls[0][1] as RequestInit;
    const upstreamBody = JSON.parse(String(upstreamInit.body));

    expect(response.status).toBe(201);
    const responseBody = await response.json();
    expect(responseBody).toEqual({ data: { trialClaimed: true } });
    expect(upstreamBody.claimToken).toBe('one-time-claim-token-with-at-least-32-characters');
    expect(upstreamBody.deviceToken).toMatch(/^[0-9a-f-]{36}$/i);
    expect(JSON.stringify(responseBody)).not.toContain(upstreamBody.claimToken);
    expect(JSON.stringify(responseBody)).not.toContain(upstreamBody.deviceToken);
    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain(`${TRIAL_DEVICE_COOKIE}=${upstreamBody.deviceToken}`);
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('Secure');
    expect(setCookie).toContain('SameSite=lax');
    expect(setCookie).toContain(`Max-Age=${60 * 60 * 24 * 400}`);
  });

  it('reuses the opaque device cookie and forwards conflict status and body', async () => {
    cookieGet.mockImplementation((name: string) => {
      if (name === 'lembar_token') return { value: 'jwt-secret' };
      if (name === TRIAL_DEVICE_COOKIE) return { value: 'existing-device-secret' };
      return undefined;
    });
    backendFetch.mockResolvedValue(
      new Response(
        JSON.stringify({ error: { code: 'TRIAL_DEVICE_CONFLICT', message: 'Conflict' } }),
        {
          status: 409,
          headers: { 'content-type': 'application/json' },
        },
      ),
    );

    const response = await POST(claimRequest());

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: { code: 'TRIAL_DEVICE_CONFLICT', message: 'Conflict' },
    });
    expect(JSON.parse(backendFetch.mock.calls[0][1].body)).toEqual({
      claimToken: 'one-time-claim-token-with-at-least-32-characters',
      deviceToken: 'existing-device-secret',
    });
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it('rejects requests that do not come from a valid claim link', async () => {
    const response = await POST(claimRequest('short'));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: { code: 'TRIAL_CLAIM_LINK_REQUIRED' },
    });
    expect(backendFetch).not.toHaveBeenCalled();
  });
});
