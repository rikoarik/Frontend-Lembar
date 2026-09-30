'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { AdminBadge, AdminShell } from '@/src/features/admin/AdminChrome';
import { AdminPanelProvider } from '@/src/features/admin/adminPanelState';
import { OPS_NAV, SCHOOL_NAV, sectionFromPath } from '@/src/features/admin/types';
import { RoleSwitcher } from '@/src/features/admin/RoleSwitcher';

function titleFromPath(
  pathname: string,
  root: '/school' | '/ops',
  nav: typeof SCHOOL_NAV,
  t: (key: string) => string,
): string {
  const exact = nav.find((item) => item.href === pathname);
  if (exact) return t(exact.labelKey);
  const section = sectionFromPath(pathname, root);
  if (!section) return t('shells.schoolTitleFallback');
  const match = nav.find((item) => item.href.endsWith(`/${section}`));
  return match ? t(match.labelKey) : section;
}

export function SchoolAdminShell({
  actorMeta,
  actorName,
  children,
}: {
  actorMeta?: string;
  actorName?: string;
  children: ReactNode;
}) {
  const t = useTranslations('admin');
  const pathname = usePathname() ?? '/school';
  const title = titleFromPath(pathname, '/school', SCHOOL_NAV, t);

  return (
    <AdminPanelProvider panelId="school">
      <div className="flex h-dvh flex-col">
        <div className="min-h-0 flex-1">
          <AdminShell
            brand={t('shells.schoolBrand')}
            title={title}
            subtitle={t('shells.schoolSubtitle')}
            nav={SCHOOL_NAV}
            topRight={
              <div className="flex items-center gap-2">
                <RoleSwitcher />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#eee6da] bg-[#fbf8f2]/90 px-2.5 py-1 text-[11px] font-semibold text-[#171717] shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8a8379]" />
                  {t('actor.schoolBadge')}
                </span>
              </div>
            }
            actorName={actorName}
            actorMeta={actorMeta}
          >
            {children}
          </AdminShell>
        </div>
      </div>
    </AdminPanelProvider>
  );
}

export function OpsAdminShell({ children }: { children: ReactNode }) {
  const t = useTranslations('admin');
  const pathname = usePathname() ?? '/ops';
  const title = titleFromPath(pathname, '/ops', OPS_NAV, t);

  return (
    <AdminPanelProvider panelId="ops">
      <div className="flex h-dvh flex-col">
        <div className="min-h-0 flex-1">
          <AdminShell
            brand={t('shells.opsBrand')}
            title={title}
            nav={OPS_NAV}
            topRight={
              <div className="flex items-center gap-2">
                <RoleSwitcher />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f0d5d7] bg-[#fdf7f7] px-2.5 py-1 text-[11px] font-semibold text-[#a3202b] shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#a3202b] animate-pulse" />
                  {t('actor.opsBadge')}
                </span>
              </div>
            }
            actorName={t('actor.opsName')}
            actorMeta={t('actor.opsMeta')}
          >
            {children}
          </AdminShell>
        </div>
      </div>
    </AdminPanelProvider>
  );
}
