import { err, ok, type Result } from '@/src/types/result';
import type {
  SourceDeleteResult,
  SourceError,
  SourceState,
  SourceUploadIntent,
  SourceUploadResult,
} from '@/src/types/source';
import {
  mapEnvelopeToSourceError,
  networkError,
  timeoutError,
} from './sourceErrors';

const DEFAULT_TIMEOUT_MS = 30_000;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1';

type RequestInit = {
  idempotencyKey?: string;
  signal?: AbortSignal;
  workspaceId?: string;
};

function buildHeaders(init: RequestInit, contentType?: string): Headers {
  const headers = new Headers({
    Accept: 'application/json',
    'Accept-Language': 'id',
  });
  if (contentType) headers.set('Content-Type', contentType);
  if (init.idempotencyKey) headers.set('Idempotency-Key', init.idempotencyKey);
  if (init.workspaceId) headers.set('X-Workspace-Id', init.workspaceId);
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
  method: 'GET' | 'POST',
  body: unknown | undefined,
  init: RequestInit = {},
  contentType?: string,
): Promise<Result<T, SourceError>> {
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
      headers: buildHeaders(init, contentType),
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
  return err(mapEnvelopeToSourceError(envelope, response.status));
}

async function uploadRequest<T>(
  path: string,
  file: File,
  uploadUrl: string,
  init: RequestInit = {},
): Promise<Result<T, SourceError>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60_000);
  if (init.signal) {
    init.signal.addEventListener('abort', () => controller.abort());
  }

  let response: Response;
  try {
    response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/pdf',
      },
      body: file,
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
    return ok((await response.json()) as T);
  }

  const envelope = await parseEnvelope(response);
  return err(mapEnvelopeToSourceError(envelope, response.status));
}

export const sourceMutations = {
  async createUploadIntent(
    fileName: string,
    sizeBytes: number,
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<Result<SourceUploadIntent, SourceError>> {
    return request<SourceUploadIntent>(
      '/sources/upload-intents',
      'POST',
      {
        fileName,
        contentType: 'application/pdf',
        sizeBytes,
      },
      { workspaceId, idempotencyKey },
    );
  },

  async uploadFile(
    file: File,
    uploadUrl: string,
  ): Promise<Result<SourceUploadResult, SourceError>> {
    return uploadRequest<SourceUploadResult>('/uploads/sources/intake', file, uploadUrl);
  },

  async getSource(
    sourceId: string,
    workspaceId: string,
  ): Promise<Result<SourceState, SourceError>> {
    return request<SourceState>(
      `/sources/${sourceId}`,
      'GET',
      undefined,
      { workspaceId },
    );
  },

  async deleteSource(
    uploadId: string,
    workspaceId: string,
  ): Promise<Result<SourceDeleteResult, SourceError>> {
    return request<SourceDeleteResult>(
      `/uploads/sources/${uploadId}/delete`,
      'POST',
      undefined,
      { workspaceId },
    );
  },
};
