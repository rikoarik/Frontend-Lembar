import { describe, it, expect } from 'vitest';
import {
  validatePdfUpload,
  sanitizeFileInfo,
  redactTokens,
} from '@/src/features/pdf-source/validation/pdf-validation';

function createMockFile(
  name: string,
  size: number,
  type: string = 'application/pdf',
): File {
  const content = new Uint8Array(size);
  return new File([content], name, { type });
}

describe('validatePdfUpload', () => {
  it('should fail when no file is provided', () => {
    const result = validatePdfUpload({ file: null });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures).toHaveLength(1);
      expect(result.failures[0].field).toBe('file');
    }
  });

  it('should pass for valid PDF file', () => {
    const file = createMockFile('document.pdf', 1024);
    const result = validatePdfUpload({ file });
    expect(result.ok).toBe(true);
  });

  it('should fail for non-PDF content type', () => {
    const file = createMockFile('document.txt', 1024, 'text/plain');
    const result = validatePdfUpload({ file });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures[0].message).toContain('Format file tidak valid');
    }
  });

  it('should fail for non-PDF extension', () => {
    const file = createMockFile('document.txt', 1024, 'application/pdf');
    const result = validatePdfUpload({ file });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures[0].message).toContain('Ekstensi file tidak valid');
    }
  });

  it('should fail for file exceeding 50MB', () => {
    const file = createMockFile('large.pdf', 51 * 1024 * 1024);
    const result = validatePdfUpload({ file });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures[0].message).toContain('Ukuran file melebihi batas');
    }
  });

  it('should fail for empty file', () => {
    const file = createMockFile('empty.pdf', 0);
    const result = validatePdfUpload({ file });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures[0].message).toContain('File kosong');
    }
  });

  it('should accept file at exactly 50MB', () => {
    const file = createMockFile('exact.pdf', 50 * 1024 * 1024);
    const result = validatePdfUpload({ file });
    expect(result.ok).toBe(true);
  });
});

describe('sanitizeFileInfo', () => {
  it('should sanitize filename with special characters', () => {
    const file = createMockFile('test<script>alert(1)</script>.pdf', 1024);
    const result = sanitizeFileInfo(file);
    expect(result.name).not.toContain('<');
    expect(result.name).not.toContain('>');
    expect(result.name).not.toContain('&');
  });

  it('should preserve clean filename', () => {
    const file = createMockFile('document-2024.pdf', 1024);
    const result = sanitizeFileInfo(file);
    expect(result.name).toBe('document-2024.pdf');
  });

  it('should return correct content type', () => {
    const file = createMockFile('test.pdf', 1024);
    const result = sanitizeFileInfo(file);
    expect(result.contentType).toBe('application/pdf');
  });

  it('should return correct size', () => {
    const file = createMockFile('test.pdf', 2048);
    const result = sanitizeFileInfo(file);
    expect(result.sizeBytes).toBe(2048);
  });
});

describe('redactTokens', () => {
  it('should redact JWT tokens', () => {
    const input = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const result = redactTokens(input);
    expect(result).toContain('[redacted]');
    expect(result).not.toContain('eyJ');
  });

  it('should redact Bearer tokens', () => {
    const input = 'Authorization: Bearer abc123def456ghi789jkl012mno345';
    const result = redactTokens(input);
    expect(result).toContain('Bearer [redacted]');
    expect(result).not.toContain('abc123def456');
  });

  it('should redact UUIDs', () => {
    const input = 'User ID: 550e8400-e29b-41d4-a716-446655440000';
    const result = redactTokens(input);
    expect(result).toContain('[id-redacted]');
    expect(result).not.toContain('550e8400');
  });

  it('should preserve normal text', () => {
    const input = 'File berhasil diunggah';
    const result = redactTokens(input);
    expect(result).toBe(input);
  });

  it('should handle multiple tokens in one string', () => {
    const input = 'Token1: abcdefghijklmnopqrstuvwxyz012345.abcdefghijklmnoPQRSTUVWXYZ678901.abcdefghijklmnopqrstuVWXYZ234567 Token2: 550e8400-e29b-41d4-a716-446655440000';
    const result = redactTokens(input);
    expect(result).toContain('[redacted]');
    expect(result).toContain('[id-redacted]');
  });
});
