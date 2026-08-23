import type { PrintMetadata } from '@/src/features/output/types';

const STORAGE_KEY = 'lembar.print-template.v1';

export function loadPrintTemplate(): Partial<PrintMetadata> {
  if (typeof window === 'undefined') return {};
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as unknown;
    return value && typeof value === 'object' ? (value as Partial<PrintMetadata>) : {};
  } catch {
    return {};
  }
}

export function savePrintTemplate(metadata: PrintMetadata): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
  } catch {
    // Storage can be unavailable or full; printing must remain usable in-memory.
  }
}
