export type ValidationFailure = { field: string; message: string };
export type ValidationResult =
  | { ok: true; value: undefined; failures: [] }
  | { ok: false; failures: ValidationFailure[] };

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const ALLOWED_CONTENT_TYPES = ['application/pdf'] as const;
const ALLOWED_EXTENSIONS = ['.pdf'] as const;

export type PdfUploadInput = {
  file: File | null;
};

function empty(): ValidationResult {
  return { ok: true, value: undefined, failures: [] };
}

function failed(failures: ValidationFailure[]): ValidationResult {
  return { ok: false, failures };
}

function push(out: ValidationFailure[], field: string, message: string) {
  out.push({ field, message });
}

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.slice(lastDot).toLowerCase();
}

export function validatePdfUpload(input: PdfUploadInput): ValidationResult {
  const failures: ValidationFailure[] = [];

  if (!input.file) {
    push(failures, 'file', 'Pilih file PDF untuk diunggah.');
    return failed(failures);
  }

  const { file } = input;

  if (!ALLOWED_CONTENT_TYPES.includes(file.type as (typeof ALLOWED_CONTENT_TYPES)[number])) {
    push(
      failures,
      'file',
      'Format file tidak valid. Hanya file PDF yang dapat diunggah.',
    );
  }

  const ext = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
    push(
      failures,
      'file',
      'Ekstensi file tidak valid. File harus berekstensi .pdf.',
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const maxSizeMB = MAX_FILE_SIZE_BYTES / (1024 * 1024);
    push(
      failures,
      'file',
      `Ukuran file melebihi batas maksimal ${maxSizeMB} MB.`,
    );
  }

  if (file.size === 0) {
    push(failures, 'file', 'File kosong. Pilih file PDF yang valid.');
  }

  return failures.length > 0 ? failed(failures) : empty();
}

export type SanitizedFileInfo = {
  name: string;
  sizeBytes: number;
  contentType: 'application/pdf';
};

export function sanitizeFileInfo(file: File): SanitizedFileInfo {
  return {
    name: file.name.replace(/[<>&"']/g, ''),
    sizeBytes: file.size,
    contentType: 'application/pdf',
  };
}

export function redactTokens(text: string): string {
  return text
    .replace(/[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, '[redacted]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]')
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[id-redacted]');
}
