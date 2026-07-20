import type { ReactNode } from 'react';
import A4PreviewFrame from './A4PreviewFrame';

export type OutputSection =
  | 'lembar-soal'
  | 'lembar-jawaban'
  | 'kunci-jawaban'
  | 'pembahasan';

const SECTION_LABELS: Record<OutputSection, string> = {
  'lembar-soal': 'Lembar Soal Siswa',
  'lembar-jawaban': 'Lembar Jawaban',
  'kunci-jawaban': 'Kunci Jawaban',
  pembahasan: 'Pembahasan',
};

/** Teacher-only sections that must never appear in student share context. */
const TEACHER_ONLY_SECTIONS: OutputSection[] = ['kunci-jawaban', 'pembahasan'];

interface OutputPackagePreviewProps {
  /** Ordered list of sections to include. Order follows PRINT-PDF-SPEC package order. */
  sections: OutputSection[];
  /** Section content renderers keyed by section type. */
  content: Partial<Record<OutputSection, ReactNode>>;
  /**
   * When true, teacher-only sections (kunci-jawaban, pembahasan) are
   * excluded regardless of what is in `sections`. Use for student share context.
   */
  isStudentShareContext?: boolean;
  className?: string;
}

// Canonical package order from PRINT-PDF-SPEC §"Output packages"
const CANONICAL_ORDER: OutputSection[] = [
  'lembar-soal',
  'lembar-jawaban',
  'kunci-jawaban',
  'pembahasan',
];

/**
 * OutputPackagePreview — F0-08 print preview foundation.
 *
 * Renders an ordered preview of output package sections inside an A4 frame.
 * Enforces PRINT-PDF-SPEC canonical package order and student-share exclusion.
 *
 * This is a draft preview — not the final PDF artifact.
 */
export default function OutputPackagePreview({
  sections,
  content,
  isStudentShareContext = false,
  className = '',
}: OutputPackagePreviewProps) {
  // Filter to canonical order, exclude teacher-only in student share context
  const orderedSections = CANONICAL_ORDER.filter((s) => {
    if (!sections.includes(s)) return false;
    if (isStudentShareContext && TEACHER_ONLY_SECTIONS.includes(s)) return false;
    return true;
  });

  return (
    <div
      className={`flex flex-col gap-4 ${className}`}
      data-testid="output-package-preview"
    >
      {/* Package manifest */}
      <div className="text-body-xs text-brand-muted" aria-label="Isi paket">
        Termasuk:{' '}
        {orderedSections.map((s) => SECTION_LABELS[s]).join(', ')}
      </div>

      {orderedSections.map((section, idx) => (
        <div key={section} data-testid={`section-${section}`}>
          {/* Page break indicator between sections (not before first) */}
          {idx > 0 && (
            <div
              className="border-t border-dashed border-brand-line my-4 text-center"
              aria-hidden="true"
            >
              <span className="text-label-xs text-brand-muted bg-brand-paper px-2 relative -top-2">
                ganti halaman
              </span>
            </div>
          )}

          <A4PreviewFrame showDraftLabel={idx === 0}>
            <div className="mb-3">
              <h2 className="text-body-sm font-semibold text-brand-ink uppercase tracking-wide">
                {SECTION_LABELS[section]}
              </h2>
            </div>
            {content[section] ?? (
              <p className="text-body-sm text-brand-muted italic">
                Konten {SECTION_LABELS[section].toLowerCase()} akan ditampilkan di sini.
              </p>
            )}
          </A4PreviewFrame>
        </div>
      ))}

      {orderedSections.length === 0 && (
        <p className="text-body-sm text-brand-muted">
          Tidak ada bagian yang dipilih untuk pratinjau.
        </p>
      )}
    </div>
  );
}
