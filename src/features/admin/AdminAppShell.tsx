'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AdminBadge, AdminShell } from '@/src/features/admin/AdminChrome';
import { AdminPanelProvider } from '@/src/features/admin/adminPanelState';
import { OPS_NAV, SCHOOL_NAV, sectionFromPath } from '@/src/features/admin/types';
import { RoleSwitcher } from '@/src/features/admin/RoleSwitcher';
import { ImpersonationBanner } from '@/app/components/auth/ImpersonationBanner';

function titleFromPath(pathname: string, root: '/school' | '/ops', nav: typeof SCHOOL_NAV): string {
  const exact = nav.find((item) => item.href === pathname);
  if (exact) return exact.label;
  const section = sectionFromPath(pathname, root);
  if (!section) return 'Ringkasan';
  const match = nav.find((item) => item.href.endsWith(`/${section}`));
  return match?.label ?? section;
}

export function SchoolAdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/school';
  const title = titleFromPath(pathname, '/school', SCHOOL_NAV);

  return (
    <AdminPanelProvider panelId="school">
      <div className="flex h-dvh flex-col">
        <ImpersonationBanner />
        <div className="min-h-0 flex-1">
          <AdminShell
            brand="lembar school"
            title={title}
            subtitle="Panel admin sekolah · kelola guru, undangan, dan penggunaan"
            nav={SCHOOL_NAV}
            topRight={
              <div className="flex items-center gap-2">
                <RoleSwitcher />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#eee6da] bg-[#fbf8f2]/90 px-2.5 py-1 text-[11px] font-semibold text-[#171717] shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8a8379]" />
                  Admin Sekolah
                </span>
              </div>
            }
            actorName="Admin Sekolah"
            actorMeta="SDN Contoh 01"
          >
            {children}
          </AdminShell>
        </div>
      </div>
    </AdminPanelProvider>
  );
}

export function OpsAdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/ops';
  const title = titleFromPath(pathname, '/ops', OPS_NAV);

  return (
    <AdminPanelProvider panelId="ops">
      <div className="flex h-dvh flex-col">
        <ImpersonationBanner />
        <div className="min-h-0 flex-1">
          <AdminShell
            brand="Lembar ops"
            title={title}
            nav={OPS_NAV}
            topRight={
              <div className="flex items-center gap-2">
                <RoleSwitcher />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f0d5d7] bg-[#fdf7f7] px-2.5 py-1 text-[11px] font-semibold text-[#a3202b] shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#a3202b] animate-pulse" />
                  Superadmin
                </span>
              </div>
            }
            actorName="Ops Superadmin"
            actorMeta="platform · least privilege"
          >
            {children}
          </AdminShell>
        </div>
      </div>
    </AdminPanelProvider>
  );
}
