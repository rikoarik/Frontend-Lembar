import { catalogMutations } from './catalogMutations';
import type { CatalogError } from './catalogErrors';
import type { components } from '@/src/lib/api/schema';
import { type Result } from '@/src/types/result';

type CatalogOption = components['schemas']['CatalogOption'];

export const catalogService = {
  listGrades(workspaceId: string, signal?: AbortSignal): Promise<Result<CatalogOption[], CatalogError>> {
    return catalogMutations.listGrades(workspaceId, signal);
  },

  listSubjects(
    workspaceId: string,
    gradeId: string,
    curriculumVersionId?: string,
    signal?: AbortSignal,
  ): Promise<Result<CatalogOption[], CatalogError>> {
    return catalogMutations.listSubjects(workspaceId, gradeId, curriculumVersionId, signal);
  },

  listMaterials(
    workspaceId: string,
    gradeId: string,
    subjectId: string,
    curriculumVersionId: string,
    signal?: AbortSignal,
  ): Promise<Result<CatalogOption[], CatalogError>> {
    return catalogMutations.listMaterials(workspaceId, gradeId, subjectId, curriculumVersionId, signal);
  },
};
