'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { RoleSwitcher } from '@/src/features/admin/RoleSwitcher';

type PlanUsage = {
  generationsUsedThisMonth: number;
  monthlyLimit: number | null;
};

export function formatQuota(plan: PlanUsage): { label: string; percent: number } {
  const { generationsUsedThisMonth: used, monthlyLimit: limit } = plan;
  return {
    label: `${used}/${limit ?? '∞'}`,
    percent: limit ? Math.min(100, Math.round((used / limit) * 100)) : 0,
  };
}

function isPlanUsage(value: unknown): value is PlanUsage {
  if (!value || typeof value !== 'object') return false;
  const plan = value as Record<string, unknown>;
  return (
    typeof plan['generationsUsedThisMonth'] === 'number' &&
    (typeof plan['monthlyLimit'] === 'number' || plan['monthlyLimit'] === null)
  );
}

type TopBarProps = {
  workspaceName: string;
  onOpenMobileNav: () => void;
  onOpenSwitcher: () => void;
  displayName: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
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
  collapsed = false,
  onToggleCollapse,
}: TopBarProps) {
  const pathname = usePathname() ?? '/app';
  const title = titleFromPath(pathname);
  const [plan, setPlan] = useState<PlanUsage | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/v1/me/plan', { credentials: 'include', signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: unknown) => {
        const data = (body as { data?: unknown } | null)?.data;
        if (isPlanUsage(data)) setPlan(data);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [workspaceName]);

  const quota = plan ? formatQuota(plan) : null;

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

        <div className="flex items-center gap-2.5">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 text-[16px] font-semibold tracking-[-0.02em] text-[#171717]"
          >
            <span
              aria-hidden="true"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#a3202b] text-white"
            >
              <span className="material-symbols-outlined text-[18px]">layers</span>
            </span>
            <span className="font-bold">lembar</span>
          </Link>

          {onToggleCollapse ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
              title={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
              className="hidden md:inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6d665d] hover:bg-[#f0ebe3] hover:text-[#171717] transition-colors"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                {collapsed ? 'side_navigation' : 'menu_open'}
              </span>
            </button>
          ) : null}
        </div>

        <span className="hidden md:block h-4 w-px bg-[#e6dfd4]" />

        <h1 className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[#171717]">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <RoleSwitcher />
        {quota ? (
          <Link
            href="/app/pengaturan/langganan"
            className="hidden h-9 items-center gap-2 rounded-lg border border-[#e6dfd4] bg-white px-3 text-[12px] font-medium text-[#171717] hover:bg-[#f3eee6] sm:inline-flex"
            aria-label={`Kuota: ${quota.label} lembar terpakai`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[#8a8379]">
              data_usage
            </span>
            <span className="text-[#8a8379]">{quota.label}</span>
            <span
              className="h-1.5 w-16 rounded-full bg-[#e6dfd4] overflow-hidden"
              role="progressbar"
              aria-valuenow={plan?.generationsUsedThisMonth}
              aria-valuemin={0}
              aria-valuemax={plan?.monthlyLimit ?? undefined}
            >
              <span
                className="block h-full rounded-full bg-[#a3202b]"
                style={{ width: `${quota.percent}%` }}
              />
            </span>
          </Link>
        ) : null}
        <div
          className="hidden h-9 max-w-[180px] items-center gap-1.5 rounded-lg border border-[#e6dfd4] bg-white px-2.5 text-[12px] font-medium text-[#171717] md:inline-flex md:max-w-[220px]"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[#8a8379]">
            person
          </span>
          <span className="truncate">{workspaceName}</span>
        </div>
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label={`Menu workspace, saat ini ${workspaceName}`}
          className="inline-flex h-9 max-w-[160px] items-center gap-1.5 rounded-lg border border-[#e6dfd4] bg-white px-2.5 text-[12px] font-medium text-[#171717] hover:bg-[#f3eee6] md:hidden"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[#8a8379]">
            person
          </span>
          <span className="truncate">{workspaceName}</span>
        </button>
      </div>
    </header>
  );
}
