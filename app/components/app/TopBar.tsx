'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

type TopBarProps = {
  workspaceName: string;
  onOpenMobileNav: () => void;
  onOpenSwitcher: () => void;
  displayName: string;
};

function titleFromPath(pathname: string): string {
  if (pathname === '/app') return 'Beranda';
  if (pathname.startsWith('/app/generate')) return 'Buat lembar';
  if (pathname.startsWith('/app/riwayat')) return 'Riwayat';
  if (pathname.startsWith('/app/bank-soal')) return 'Bank soal';
  if (pathname.startsWith('/app/template')) return 'Template';
  if (pathname.startsWith('/app/bantuan')) return 'Bantuan';
  if (pathname.startsWith('/app/review')) return 'Tinjau';
  if (pathname.startsWith('/app/output')) return 'Output';
  if (pathname.startsWith('/app/pengaturan')) return 'Pengaturan';
  if (pathname.startsWith('/app/kelas')) return 'Kelas';
  if (pathname.startsWith('/app/analitik')) return 'Analitik';
  return 'lembar';
}

export function TopBar({
  workspaceName,
  onOpenMobileNav,
  onOpenSwitcher,
  displayName,
}: TopBarProps) {
  const pathname = usePathname() ?? '/app';
  const title = titleFromPath(pathname);

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#e6dfd4] bg-[#fbf8f2]/95 px-4 backdrop-blur md:px-6"
      role="banner"
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#e6dfd4] bg-white text-[#171717] hover:bg-[#f3eee6] md:hidden"
          aria-label="Buka navigasi"
          onClick={onOpenMobileNav}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
            menu
          </span>
        </button>
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#a3202b] text-white"
          >
            <span className="material-symbols-outlined text-[16px]">layers</span>
          </span>
          <h1 className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[#171717]">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/app/pengaturan/langganan"
          className="hidden h-9 items-center gap-2 rounded-lg border border-[#e6dfd4] bg-white px-3 text-[12px] font-medium text-[#171717] hover:bg-[#f3eee6] sm:inline-flex"
          aria-label="Kuota: 12 dari 50 lembar terpakai"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[#8a8379]">
            data_usage
          </span>
          <span className="text-[#8a8379]">12/50</span>
          <span
            className="h-1.5 w-16 rounded-full bg-[#e6dfd4] overflow-hidden"
            role="progressbar"
            aria-valuenow={12}
            aria-valuemin={0}
            aria-valuemax={50}
          >
            <span className="block h-full w-[24%] rounded-full bg-[#a3202b]" />
          </span>
        </Link>
        <button
          type="button"
          onClick={onOpenSwitcher}
          aria-label={`Ganti workspace, saat ini ${workspaceName}`}
          className="inline-flex h-9 max-w-[180px] items-center gap-1.5 rounded-lg border border-[#e6dfd4] bg-white px-2.5 text-[12px] font-medium text-[#171717] hover:bg-[#f3eee6] md:max-w-[220px]"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[#8a8379]">
            workspaces
          </span>
          <span className="truncate">{workspaceName}</span>
        </button>
      </div>
    </header>
  );
}
