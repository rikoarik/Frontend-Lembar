export const OAUTH_STATE_COOKIE = 'lembar_oauth_state';

export function oauthStateCookie(value: string) {
  return {
    name: OAUTH_STATE_COOKIE,
    value,
    path: '/',
    sameSite: 'lax' as const,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60,
  };
}

export function clearOauthStateCookie() {
  return {
    name: OAUTH_STATE_COOKIE,
    value: '',
    path: '/',
    maxAge: 0,
  };
}

export function normalizeGoogleAuthorizationPayload(payload: unknown): {
  url: string;
  state: string;
} | null {
  const root = payload as {
    url?: unknown;
    state?: unknown;
    data?: { url?: unknown; state?: unknown };
  } | null;
  const data = root?.data ?? root;
  if (!data || typeof data.url !== 'string') return null;

  try {
    const url = new URL(data.url);
    if (url.protocol !== 'https:' || url.hostname !== 'accounts.google.com') return null;
    const state =
      typeof data.state === 'string' && data.state
        ? data.state
        : (url.searchParams.get('state') ?? '');
    if (!state) return null;
    return { url: url.toString(), state };
  } catch {
    return null;
  }
}
