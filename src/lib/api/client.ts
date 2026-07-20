import createClient from 'openapi-fetch';
import type { paths } from './schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});

export type ApiClient = typeof apiClient;
