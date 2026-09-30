'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { RoleSwitcher } from '@/src/features/admin/RoleSwitcher';
import { LocaleSwitcher } from '@/src/i18n/LocaleSwitcher';
import { useLocaleFormat } from '@/src/i18n/useLocaleFormat';

type PlanUsage = {
  plan: 'free' | 'pro' | 'plus';
  tokenUsedThisMonth: number;
  tokenMonthlyLimit: number | null;
};

/** Translate function shape used by the label helpers below. */
export type Translate = (key: string, values?: Record<string, string | number>) => string;

export function entitlementCta(plan: Pick<PlanUsage, 'plan'>, t: Translate) {
  if (plan.plan === 'plus') return { label: t('plan.plus'), icon: 'verified' };
  if (plan.plan === 'pro') return { label: t('plan.pro'), icon: 'verified' };
  return { label: t('plan.upgradePro'), icon: 'workspace_premium' };
}

export function formatQuota(
  plan: Pick<PlanUsage, 'tokenUsedThisMonth' | 'tokenMonthlyLimit'>,
  formatNumber: (value: number) => string,
): {
  label: string;
  percent: number;
} {
  const { tokenUsedThisMonth: used, tokenMonthlyLimit: limit } = plan;
  return {
    label: `${formatNumber(used)}/${limit === null ? '∞' : formatNumber(limit)}`,
    percent:
      limit === null
        ? 0
        : limit <= 0
          ? used > 0
            ? 100
            : 0
          : Math.min(100, Math.round((used / limit) * 100)),
  };
}

function isPlanUsage(value: unknown): value is PlanUsage {
  if (!value || typeof value !== 'object') return false;
  const plan = value as Record<string, unknown>;
  return (
    (plan['plan'] === 'free' || plan['plan'] === 'pro' || plan['plan'] === 'plus') &&
    typeof plan['tokenUsedThisMonth'] === 'number' &&
    (typeof plan['tokenMonthlyLimit'] === 'number' || plan['tokenMonthlyLimit'] === null)
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

/** Route → i18n key for the page title shown in the top bar. */
export function titleKeyFromPath(pathname: string): string {
  if (pathname === '/app') return 'nav.beranda';
  if (pathname.startsWith('/app/generate')) return 'nav.buatLembar';
  if (pathname.startsWith('/app/riwayat')) return 'nav.riwayat';
  if (pathname.startsWith('/app/bank-soal')) return 'nav.bankSoal';
  if (pathname.startsWith('/app/template')) return 'nav.template';
  if (pathname.startsWith('/app/bantuan')) return 'nav.bantuan';
  if (pathname.startsWith('/app/review')) return 'titles.tinjau';
  if (pathname.startsWith('/app/output')) return 'titles.output';
  if (pathname.startsWith('/app/pengaturan/langganan/trial')) return 'titles.trialConfirmation';
  if (pathname.startsWith('/app/pengaturan')) return 'titles.settings';
  if (pathname.startsWith('/app/kelas')) return 'nav.kelas';
  if (pathname.startsWith('/app/analitik')) return 'nav.analitik';
  if (pathname.startsWith('/app/jobs')) return 'titles.jobProgress';
  if (pathname.startsWith('/app/onboarding')) return 'titles.onboarding';
  if (pathname.startsWith('/app/assessments')) return 'titles.assessments';
  return 'brand';
}

export function TopBar({
  workspaceName,
  onOpenMobileNav,
  onOpenSwitcher,
  displayName,
  collapsed = false,
  onToggleCollapse,
}: TopBarProps) {
  const t = useTranslations('appShell');
  const { number } = useLocaleFormat();
  const pathname = usePathname() ?? '/app';
  const title = t(titleKeyFromPath(pathname));
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

  const quota = plan ? formatQuota(plan, number) : null;
  const entitlement = plan ? entitlementCta(plan, t) : null;

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#e6dfd4] bg-[#fbf8f2]/95 px-4 backdrop-blur md:px-6"
      role="banner"
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#e6dfd4] bg-white text-[#171717] hover:bg-[#f3eee6] md:hidden"
          aria-label={t('nav.openMobile')}
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
            <span className="font-bold">{t('brand')}</span>
          </Link>

          {onToggleCollapse ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
              title={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
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
        <LocaleSwitcher className="hidden lg:inline-flex items-center gap-2 text-sm" />
        <RoleSwitcher />
        {quota ? (
          <Link
            href="/app/pengaturan/langganan"
            className="hidden h-9 items-center gap-2 rounded-lg border border-[#e6dfd4] bg-white px-3 text-[12px] font-medium text-[#171717] hover:bg-[#f3eee6] sm:inline-flex"
            aria-label={t('plan.quotaAria', { label: quota.label })}
          >
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[16px] text-[#8a8379]"
            >
              data_usage
            </span>
            <span className="text-[#8a8379]">{quota.label}</span>
            <span
              className="h-1.5 w-16 rounded-full bg-[#e6dfd4] overflow-hidden"
              role="progressbar"
              aria-valuenow={plan?.tokenUsedThisMonth}
              aria-valuemin={0}
              aria-valuemax={plan?.tokenMonthlyLimit ?? undefined}
              aria-label={t('plan.quotaProgressAria')}
            >
              <span
                className="block h-full rounded-full bg-[#a3202b]"
                style={{ width: `${quota.percent}%` }}
              />
            </span>
          </Link>
        ) : null}
        {entitlement ? (
          <Link
            href="/app/pengaturan/langganan"
            className="hidden h-9 max-w-[180px] items-center gap-1.5 rounded-lg border border-[#e6dfd4] bg-white px-2.5 text-[12px] font-medium text-[#171717] hover:bg-[#f3eee6] md:inline-flex md:max-w-[220px]"
          >
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[16px] text-[#8a8379]"
            >
              {entitlement.icon}
            </span>
            <span className="truncate">{entitlement.label}</span>
          </Link>
        ) : null}
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label={t('nav.workspaceMenu', { name: workspaceName })}
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
