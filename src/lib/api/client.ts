import createClient from 'openapi-fetch';
import type { paths } from './schema';

// Schema paths already include the `/v1` prefix.
// Browser uses same-origin BFF (/v1/*). Server components also call same-origin
// absolute app URL so cookies can be attached correctly in production.
function resolveBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!configured || configured === '/v1') {
    if (typeof window === 'undefined') {
      return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    }
    return '';
  }
  return configured;
}

export const apiClient = createClient<paths>({
  baseUrl: resolveBaseUrl(),
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});

export type ApiClient = typeof apiClient;
