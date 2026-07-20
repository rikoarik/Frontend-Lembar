import { generateMutations, type GenerateSubmitResult } from './generateMutations';
import type { GenerateError } from './generateErrors';
import type { Result } from '@/src/types/result';
import type { CompositionValues } from '@/src/features/generate/types';

export const generateService = {
  submitConfiguration(
    values: CompositionValues,
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<Result<GenerateSubmitResult, GenerateError>> {
    return generateMutations.submitConfiguration(values, workspaceId, idempotencyKey);
  },
};
