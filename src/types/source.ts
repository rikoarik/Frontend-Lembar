export type SourceStatus = 'uploading' | 'processing' | 'ready' | 'failed' | 'deleted';

export type SourceUploadIntent = {
  sourceId: string;
  uploadUrl: string;
  expiresAt: string;
};

export type SourceUploadResult = {
  uploadId: string;
  status: 'received' | 'verified' | 'rejected' | 'deleted';
  byteSize: number;
  contentType: 'application/pdf';
  maxBytes: number;
};

export type SourceState = {
  id: string;
  type: 'catalog' | 'pdf';
  status: SourceStatus;
  fileName: string;
  pageCount?: number | null;
  failureCode?: string | null;
};

export type SourceDeleteResult = {
  uploadId: string;
  status: 'deleted';
  bytesRemoved: boolean;
};

export type SourceError = {
  code: string;
  safeMessage: string;
  retryable: boolean;
};
