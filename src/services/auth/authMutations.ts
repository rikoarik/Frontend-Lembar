import { err, ok, type Result } from '@/src/types/result';
import {
  mapEnvelopeToAuthError,
  networkError,
  timeoutError,
  type AuthErrorEnvelope,
} from './errorMapping';
import type { AuthError } from './authErrors';
import type {
  AuthSuccessPayload,
  InvitationAcceptInput,
  InvitationPreview,
  LoginInput,
  RecoveryRequestInput,
  RegisterInput,
  ResetPasswordInput,
} from '@/src/types/auth';

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

async function parseEnvelope(response: Response): Promise<AuthErrorEnvelope | null> {
  try {
    const body = (await response.json()) as { error?: AuthErrorEnvelope };
    return body?.error ?? null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  method: 'POST' | 'GET',
  body: unknown,
  init: RequestInit = {},
): Promise<Result<T, AuthError>> {
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
  return err(mapEnvelopeToAuthError(envelope, response.status));
}

export const authMutations = {
  login(input: LoginInput, idempotencyKey: string) {
    return request<AuthSuccessPayload>('/auth/login', 'POST', input, {
      idempotencyKey,
    });
  },
  register(input: RegisterInput, idempotencyKey: string) {
    return request<AuthSuccessPayload>('/auth/register', 'POST', input, {
      idempotencyKey,
    });
  },
  recoveryRequest(input: RecoveryRequestInput, idempotencyKey: string) {
    return request<{ ok: true }>('/auth/recovery/request', 'POST', input, {
      idempotencyKey,
    });
  },
  resetPassword(input: ResetPasswordInput, idempotencyKey: string) {
    return request<{ ok: true }>('/auth/recovery/reset', 'POST', input, {
      idempotencyKey,
    });
  },
  getInvitation(token: string) {
    return request<InvitationPreview>(`/auth/invitations/${token}`, 'GET', undefined, {});
  },
  acceptInvitation(input: InvitationAcceptInput, idempotencyKey: string) {
    return request<AuthSuccessPayload>(
      `/auth/invitations/${input.token}/accept`,
      'POST',
      {
        username: input.username,
        email: input.email,
        phone: input.phone,
        password: input.password,
      },
      { idempotencyKey },
    );
  },
};
