'use client';

import { Button } from '@/app/components/ui';

function getPaginationRange(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - 1, 1);
  const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftRange = Array.from({ length: 4 }, (_, i) => i + 1);
    return [...leftRange, '...', totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightRange = Array.from({ length: 4 }, (_, i) => totalPages - 3 + i);
    return [1, '...', ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i,
    );
    return [1, '...', ...middleRange, '...', totalPages];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1);
}

export function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  if (totalItems <= 0) return null;
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const paginationRange = getPaginationRange(currentPage, totalPages);

  return (
    <div className="flex items-center justify-between border-t border-[#ddd4c8]/50 bg-[#faf8f5]/60 px-4 py-3 sm:px-6 rounded-b-2xl">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          size="sm"
          variant="secondary"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Sebelumnya
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Berikutnya
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-[12px] text-[#6d665d]">
            Menampilkan <span className="font-semibold text-[#171717]">{start}</span> ke{' '}
            <span className="font-semibold text-[#171717]">{end}</span> dari{' '}
            <span className="font-semibold text-[#171717]">{totalItems}</span> hasil
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-xl shadow-sm bg-white"
            aria-label="Pagination"
          >
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-xl px-2 py-1.5 text-[#6d665d] ring-1 ring-inset ring-[#ddd4c8]/60 hover:bg-[#faf7f2] focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:hover:bg-white"
            >
              <span className="sr-only">Sebelumnya</span>
              <span className="material-symbols-outlined text-[16px]" aria-hidden>
                chevron_left
              </span>
            </button>
            {paginationRange.map((item, idx) => {
              if (item === '...') {
                return (
                  <span
                    key={`dots-${idx}`}
                    className="relative inline-flex items-center px-3 py-1.5 text-[11px] font-semibold text-[#8a8379] ring-1 ring-inset ring-[#ddd4c8]/60 select-none bg-white"
                  >
                    …
                  </span>
                );
              }

              const p = item as number;
              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`relative inline-flex items-center px-3 py-1.5 text-[11px] font-semibold ${
                    isCurrent
                      ? 'z-10 bg-[#171717] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]'
                      : 'text-[#171717] ring-1 ring-inset ring-[#ddd4c8]/60 hover:bg-[#faf7f2] focus:outline-offset-0'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-xl px-2 py-1.5 text-[#6d665d] ring-1 ring-inset ring-[#ddd4c8]/60 hover:bg-[#faf7f2] focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:hover:bg-white"
            >
              <span className="sr-only">Berikutnya</span>
              <span className="material-symbols-outlined text-[16px]" aria-hidden>
                chevron_right
              </span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
