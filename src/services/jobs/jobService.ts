import { err, ok, type Result } from '@/src/types/result';
import type { JobSnapshot } from '@/src/features/jobs/types';
import type { JobError } from './jobErrors';
import { jobNetworkError, jobTimeoutError, mapJobEnvelope } from './errorMapping';

const DEFAULT_TIMEOUT_MS = 20_000;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1';

async function parseEnvelope(response: Response) {
  try {
    const body = (await response.json()) as { error?: Record<string, unknown> };
    return (body?.error as { code?: string; message?: string; requestId?: string; retryable?: boolean }) ?? null;
  } catch {
    return null;
  }
}

async function requestJson<T>(
  path: string,
  method: 'GET' | 'POST',
  body?: unknown,
): Promise<Result<T, JobError>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'id',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    if (response.ok) {
      const json = (await response.json()) as { data: T };
      return ok(json.data);
    }
    const envelope = await parseEnvelope(response);
    return err(mapJobEnvelope(envelope, response.status));
  } catch (cause) {
    if ((cause as { name?: string })?.name === 'AbortError') return err(jobTimeoutError());
    return err(jobNetworkError(cause));
  } finally {
    clearTimeout(timeoutId);
  }
}

export const jobService = {
  getJob(jobId: string): Promise<Result<JobSnapshot, JobError>> {
    return requestJson<JobSnapshot>(`/jobs/${encodeURIComponent(jobId)}`, 'GET');
  },

  cancelJob(jobId: string): Promise<Result<JobSnapshot, JobError>> {
    return requestJson<JobSnapshot>(`/jobs/${encodeURIComponent(jobId)}/cancel`, 'POST', {});
  },
};
