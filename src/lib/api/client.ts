import createClient from 'openapi-fetch';
import type { paths } from './schema';

// Schema paths already include the `/v1` prefix, so the client base must be
// origin-relative empty string (or absolute origin). Falling back to `/api`
// would produce `/api/v1/...` which does not exist in this app.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL === '/v1'
  ? ''
  : process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});

export type ApiClient = typeof apiClient;
