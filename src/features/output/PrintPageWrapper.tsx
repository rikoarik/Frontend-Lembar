import { Children, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  questionsPerPage?: number;
}

export function PrintPageWrapper({ children, questionsPerPage = 20 }: Props) {
  const items = Children.toArray(children);

  // Split into pages; always at least one page (even when empty)
  const pages: ReactNode[][] = [];
  if (items.length === 0) {
    pages.push([]);
  } else {
    for (let i = 0; i < items.length; i += questionsPerPage) {
      pages.push(items.slice(i, i + questionsPerPage));
    }
  }

  return (
    <div className="print-page-wrapper">
      {pages.map((pageItems, idx) => (
        <div
          key={idx}
          data-page={idx + 1}
          className="print-page"
          style={{
            // A4: 210mm × 297mm; standard print margins give ~170mm × 257mm content area
            width: '210mm',
            minHeight: '297mm',
            padding: '20mm',
            boxSizing: 'border-box',
            // Screen: shadow/border to simulate page
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: '1px solid #e5e7eb',
            background: '#fff',
            marginBottom: '16px',
            // Print: hard page break after every page except the last
            // ponytail: last-page guard via CSS :last-child; works for all major print engines
            pageBreakAfter: idx < pages.length - 1 ? 'always' : 'auto',
          }}
        >
          {pageItems}
        </div>
      ))}
    </div>
  );
}
