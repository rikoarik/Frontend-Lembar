import type { ReactNode } from 'react';

interface A4PreviewFrameProps {
  children: ReactNode;
  /** Whether to show the draft watermark label. Always true for browser preview. */
  showDraftLabel?: boolean;
  className?: string;
}

/**
 * A4PreviewFrame — F0-08 print preview foundation.
 *
 * Renders a browser-side approximate preview at ISO A4 proportions
 * (210×297mm, 14mm margins). This is labeled "Pratinjau draft" per
 * PRINT-PDF-SPEC.md canonical artifact rule — it is NOT the final output.
 *
 * Final print/download uses the immutable backend PDF artifact.
 * Do not use this frame as a second renderer for final output.
 */
export default function A4PreviewFrame({
  children,
  showDraftLabel = true,
  className = '',
}: A4PreviewFrameProps) {
  return (
    <div
      className={`relative flex flex-col items-center ${className}`}
      data-testid="a4-preview-frame"
    >
      {showDraftLabel && (
        <div
          className="mb-2 self-start px-2 py-0.5 rounded text-label-xs font-medium bg-amber-100 text-amber-800 border border-amber-300 select-none"
          aria-label="Ini adalah pratinjau draft, bukan dokumen final"
          data-testid="draft-label"
        >
          Pratinjau draft
        </div>
      )}

      {/* A4 frame — physical dimensions via CSS custom properties */}
      <div
        className="relative bg-white shadow-md overflow-hidden"
        style={{
          width: 'var(--print-page-width)',          // 210mm
          minHeight: 'var(--print-page-height)',     // 297mm
          paddingTop: 'var(--print-margin-top)',     // 14mm
          paddingRight: 'var(--print-margin-right)', // 14mm
          paddingBottom: 'var(--print-margin-bottom)', // 14mm
          paddingLeft: 'var(--print-margin-left)',   // 14mm
          fontSize: 'var(--print-font-size)',        // 10.5pt
          lineHeight: 'var(--print-line-height)',    // 1.4
          boxSizing: 'border-box',
        }}
        role="region"
        aria-label="Pratinjau halaman A4"
        data-testid="a4-page"
      >
        {children}
      </div>
    </div>
  );
}
