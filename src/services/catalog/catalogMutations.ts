import { apiClient } from '@/src/lib/api/client';
import type { components } from '@/src/lib/api/schema';
import { err, ok, type Result } from '@/src/types/result';
import { mapEnvelopeToCatalogError, networkError, timeoutError } from './errorMapping';
import type { CatalogError } from './catalogErrors';

type CatalogOption = components['schemas']['CatalogOption'];

const DEFAULT_TIMEOUT_MS = 15_000;

async function getCatalog<T>(
  path: string,
  headers: Record<string, string>,
  signal?: AbortSignal,
): Promise<Result<T, CatalogError>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }
  let response: Response;
  try {
    response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api'}${path}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'id',
        ...headers,
      },
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
    const body = (await response.json()) as { data: T };
    return ok(body.data);
  }

  try {
    const body = (await response.json()) as { error?: { code?: string; message?: string; requestId?: string; retryable?: boolean } };
    return err(mapEnvelopeToCatalogError(body?.error ?? null, response.status));
  } catch {
    return err(mapEnvelopeToCatalogError(null, response.status));
  }
}

export const catalogMutations = {
  listGrades(
    workspaceId: string,
    signal?: AbortSignal,
  ): Promise<Result<CatalogOption[], CatalogError>> {
    return getCatalog<CatalogOption[]>('/v1/catalog/grades', { 'X-Workspace-Id': workspaceId }, signal);
  },

  listSubjects(
    workspaceId: string,
    gradeId: string,
    curriculumVersionId?: string,
    signal?: AbortSignal,
  ): Promise<Result<CatalogOption[], CatalogError>> {
    const params = new URLSearchParams({ gradeId });
    if (curriculumVersionId) params.set('curriculumVersionId', curriculumVersionId);
    return getCatalog<CatalogOption[]>(
      `/v1/catalog/subjects?${params.toString()}`,
      { 'X-Workspace-Id': workspaceId },
      signal,
    );
  },

  listMaterials(
    workspaceId: string,
    gradeId: string,
    subjectId: string,
    curriculumVersionId: string,
    signal?: AbortSignal,
  ): Promise<Result<CatalogOption[], CatalogError>> {
    const params = new URLSearchParams({ gradeId, subjectId, curriculumVersionId });
    return getCatalog<CatalogOption[]>(
      `/v1/catalog/materials?${params.toString()}`,
      { 'X-Workspace-Id': workspaceId },
      signal,
    );
  },
};
