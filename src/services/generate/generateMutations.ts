import { err, ok, type Result } from '@/src/types/result';
import type { GenerateError } from './generateErrors';
import { mapEnvelopeToGenerateError, networkError, timeoutError } from './errorMapping';
import type { CompositionValues } from '@/src/features/generate/types';

const DEFAULT_TIMEOUT_MS = 30_000;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1';

type RequestInit = {
  idempotencyKey?: string;
  signal?: AbortSignal;
};

function buildHeaders(init: RequestInit): Headers {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Accept-Language': 'id',
  });
  if (init.idempotencyKey) headers.set('Idempotency-Key', init.idempotencyKey);
  return headers;
}

async function parseEnvelope(response: Response): Promise<Record<string, unknown> | null> {
  try {
    const body = (await response.json()) as { error?: Record<string, unknown> };
    return body?.error ?? null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  method: 'POST',
  body: unknown,
  init: RequestInit = {},
): Promise<Result<T, GenerateError>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  if (init.signal) {
    init.signal.addEventListener('abort', () => controller.abort());
  }
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers: buildHeaders(init),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (cause) {
    clearTimeout(timeoutId);
    if ((cause as { name?: string })?.name === 'AbortError') {
      return err(timeoutError());
    }
    return err(networkError(cause));
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.ok) {
    return ok(((await response.json()) as { data: T }).data);
  }

  const envelope = await parseEnvelope(response);
  return err(mapEnvelopeToGenerateError(envelope, response.status));
}

export type GenerateSubmitResult = {
  status: 'accepted';
  jobId: string;
  assessmentId?: string;
  compositionId?: string;
};

export const generateMutations = {
  /*
   * Mock-first transport for F3-04. Backend contract may refine fields later;
   * frontend only relies on accepted + jobId for progress routing.
   */
  async submitConfiguration(
    values: CompositionValues,
    _workspaceId: string,
    idempotencyKey: string,
  ): Promise<Result<GenerateSubmitResult, GenerateError>> {
    return request<GenerateSubmitResult>('/generate/submit', 'POST', values, { idempotencyKey });
  },
};
