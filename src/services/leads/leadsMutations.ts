import { err, ok, type Result } from '@/src/types/result';
import type { LeadError } from './leadsErrors';
import {
  mapEnvelopeToLeadError,
  networkError,
  timeoutError,
  type LeadErrorEnvelope,
} from './errorMapping';
import type { SchoolLeadInput, SchoolLeadSuccess } from '@/src/types/leads';

const DEFAULT_TIMEOUT_MS = 15_000;
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

async function parseEnvelope(response: Response): Promise<LeadErrorEnvelope | null> {
  try {
    const body = (await response.json()) as { error?: LeadErrorEnvelope };
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
): Promise<Result<T, LeadError>> {
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
  return err(mapEnvelopeToLeadError(envelope, response.status));
}

export const leadsMutations = {
  submitSchoolLead(input: SchoolLeadInput, idempotencyKey: string) {
    const payload = {
      name: input.name.trim(),
      email: input.email?.trim() || undefined,
      phone: input.phone?.trim() || undefined,
      school: input.school.trim(),
      role: input.role,
      teacherCount: input.teacherCount,
      goal: input.goal?.trim() || undefined,
      consent: input.consent,
    };
    return request<SchoolLeadSuccess>('/leads/school', 'POST', payload, {
      idempotencyKey,
    });
  },
};
