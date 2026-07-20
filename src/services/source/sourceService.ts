import { sourceMutations } from './sourceMutations';
import type {
  SourceDeleteResult,
  SourceError,
  SourceState,
  SourceUploadIntent,
  SourceUploadResult,
} from '@/src/types/source';
import type { Result } from '@/src/types/result';

export const sourceService = {
  createUploadIntent(
    fileName: string,
    sizeBytes: number,
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<Result<SourceUploadIntent, SourceError>> {
    return sourceMutations.createUploadIntent(fileName, sizeBytes, workspaceId, idempotencyKey);
  },

  uploadFile(
    file: File,
    uploadUrl: string,
  ): Promise<Result<SourceUploadResult, SourceError>> {
    return sourceMutations.uploadFile(file, uploadUrl);
  },

  getSource(
    sourceId: string,
    workspaceId: string,
  ): Promise<Result<SourceState, SourceError>> {
    return sourceMutations.getSource(sourceId, workspaceId);
  },

  deleteSource(
    uploadId: string,
    workspaceId: string,
  ): Promise<Result<SourceDeleteResult, SourceError>> {
    return sourceMutations.deleteSource(uploadId, workspaceId);
  },
};
