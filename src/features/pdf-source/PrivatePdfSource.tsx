'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Panel } from '@/app/components/ui/Panel';
import { usePdfSourceUpload } from './state/usePdfSourceUpload';
import {
  sanitizeFileInfo,
  validatePdfUpload,
  redactTokens,
} from './validation/pdf-validation';
import type { SourceError } from '@/src/types/source';

type PrivatePdfSourceProps = {
  workspaceId: string;
  onSuccess?: (sourceId: string) => void;
  className?: string;
};

const ACCEPTED_FILE_TYPES = '.pdf,application/pdf';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function ErrorDisplay({
  error,
  onRetry,
  retryable,
}: {
  error: SourceError;
  onRetry?: () => void;
  retryable: boolean;
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-lg border border-brand-danger/30 bg-brand-danger-soft p-4"
    >
      <p className="text-body-sm text-brand-danger">{redactTokens(error.safeMessage)}</p>
      {retryable && onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="mt-3"
        >
          Coba lagi
        </Button>
      )}
    </div>
  );
}

function UploadProgress({ progress }: { progress: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progress unggah"
      className="w-full"
    >
      <div className="h-2 w-full overflow-hidden rounded-full bg-brand-paper">
        <div
          className="h-full rounded-full bg-brand-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-body-sm text-brand-ink-muted">
        Mengunggah... {progress}%
      </p>
    </div>
  );
}

function ProcessingState() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex flex-col items-center gap-3 p-4"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
      <p className="text-body-sm text-brand-ink-muted">
        Memproses dokumen PDF...
      </p>
    </div>
  );
}

function SuccessState({
  fileName,
  pageCount,
  onDelete,
  isDeleting,
}: {
  fileName: string;
  pageCount?: number | null;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col gap-4 rounded-lg border border-brand-success/30 bg-brand-success-soft p-4"
    >
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-brand-success"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <div className="flex-1">
          <p className="text-body-sm font-medium text-brand-success">
            Dokumen berhasil diproses
          </p>
          <p className="mt-1 text-body-sm text-brand-ink-muted">
            {fileName}
            {pageCount != null && ` · ${pageCount} halaman`}
          </p>
        </div>
      </div>
      <Button
        variant="danger"
        size="sm"
        onClick={onDelete}
        loading={isDeleting}
        loadingLabel="Menghapus..."
        className="self-start"
      >
        Hapus dokumen
      </Button>
    </div>
  );
}

function DeleteConfirmation({
  onConfirm,
  onCancel,
  isDeleting,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
      className="rounded-lg border border-brand-danger/30 bg-brand-danger-soft p-4"
    >
      <h3 id="delete-confirm-title" className="text-body-sm font-semibold text-brand-danger">
        Hapus dokumen?
      </h3>
      <p className="mt-2 text-body-sm text-brand-ink-muted">
        Dokumen akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
      </p>
      <div className="mt-4 flex gap-3">
        <Button
          variant="danger"
          size="sm"
          onClick={onConfirm}
          loading={isDeleting}
          loadingLabel="Menghapus..."
        >
          Ya, hapus
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onCancel}
          disabled={isDeleting}
        >
          Batal
        </Button>
      </div>
    </div>
  );
}

function EmptyState({
  onFileSelect,
  disabled,
}: {
  onFileSelect: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-paper">
        <svg
          className="h-6 w-6 text-brand-ink-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 16V4m0 0L8 8m4-4l4 4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-body-sm font-medium text-brand-ink">
          Unggah dokumen PDF
        </p>
        <p className="mt-1 text-body-sm text-brand-ink-muted">
          Format PDF, maksimal 50 MB
        </p>
      </div>
      <Button
        variant="primary"
        size="md"
        onClick={onFileSelect}
        disabled={disabled}
      >
        Pilih file
      </Button>
    </div>
  );
}

export function PrivatePdfSource({
  workspaceId,
  onSuccess,
  className,
}: PrivatePdfSourceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const upload = usePdfSourceUpload({
    workspaceId,
    onSuccess: (source) => {
      onSuccess?.(source.id);
    },
  });

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      setValidationError(null);

      if (!file) return;

      const validation = validatePdfUpload({ file });
      if (!validation.ok) {
        setValidationError(validation.failures[0]?.message ?? 'File tidak valid.');
        return;
      }

      const sanitized = sanitizeFileInfo(file);
      void upload.upload(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [upload],
  );

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    await upload.deleteSource();
    setShowDeleteConfirm(false);
  }, [upload]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const file = event.dataTransfer.files[0];
      if (!file) return;

      const validation = validatePdfUpload({ file });
      if (!validation.ok) {
        setValidationError(validation.failures[0]?.message ?? 'File tidak valid.');
        return;
      }

      setValidationError(null);
      void upload.upload(file);
    },
    [upload],
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const isBusy =
    upload.phase === 'requesting' ||
    upload.phase === 'uploading' ||
    upload.phase === 'processing' ||
    upload.isDeleting;

  const renderContent = () => {
    if (showDeleteConfirm && upload.sourceState) {
      return (
        <DeleteConfirmation
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={upload.isDeleting}
        />
      );
    }

    if (upload.phase === 'done' && upload.sourceState) {
      return (
        <SuccessState
          fileName={upload.sourceState.fileName}
          pageCount={upload.sourceState.pageCount}
          onDelete={handleDeleteClick}
          isDeleting={upload.isDeleting}
        />
      );
    }

    if (upload.phase === 'processing') {
      return <ProcessingState />;
    }

    if (upload.phase === 'uploading' || upload.phase === 'requesting') {
      return <UploadProgress progress={upload.progress} />;
    }

    if (upload.error) {
      return (
        <ErrorDisplay
          error={upload.error}
          onRetry={upload.retry}
          retryable={upload.error.retryable}
        />
      );
    }

    if (validationError) {
      return (
        <div className="flex flex-col gap-4">
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-lg border border-brand-danger/30 bg-brand-danger-soft p-4"
          >
            <p className="text-body-sm text-brand-danger">{validationError}</p>
          </div>
          <EmptyState onFileSelect={handleFileSelect} disabled={isBusy} />
        </div>
      );
    }

    return (
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="rounded-lg border-2 border-dashed border-brand-line hover:border-brand-accent transition-colors"
      >
        <EmptyState onFileSelect={handleFileSelect} disabled={isBusy} />
      </div>
    );
  };

  return (
    <Panel
      title="Sumber PDF Pribadi"
      description="Unggah dokumen PDF untuk digunakan sebagai sumber."
      className={className}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Pilih file PDF"
        tabIndex={-1}
      />
      {renderContent()}
      {upload.deleteError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-4 rounded-lg border border-brand-danger/30 bg-brand-danger-soft p-4"
        >
          <p className="text-body-sm text-brand-danger">
            {redactTokens(upload.deleteError.safeMessage)}
          </p>
        </div>
      )}
    </Panel>
  );
}
