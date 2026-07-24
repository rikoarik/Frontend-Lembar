'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AdminBadge, AdminShell } from '@/src/features/admin/AdminChrome';
import { AdminPanelProvider } from '@/src/features/admin/adminPanelState';
import { OPS_NAV, SCHOOL_NAV, sectionFromPath } from '@/src/features/admin/types';

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
      <AdminShell
        brand="lembar school"
        title={title}
        subtitle="Panel admin sekolah · kelola guru, undangan, dan penggunaan"
        nav={SCHOOL_NAV}
        topRight={<AdminBadge tone="ok" label="school_admin" />}
        actorName="Admin Sekolah"
        actorMeta="SDN Contoh 01"
      >
        {children}
      </AdminShell>
    </AdminPanelProvider>
  );
}

export function OpsAdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/ops';
  const title = titleFromPath(pathname, '/ops', OPS_NAV);

  return (
    <AdminPanelProvider panelId="ops">
      <AdminShell
        brand="lembar ops"
        title={title}
        subtitle="Konsol superadmin · pantau platform, tenant, job, dan konten"
        nav={OPS_NAV}
        topRight={<AdminBadge tone="info" label="superadmin" />}
        actorName="Ops Superadmin"
        actorMeta="platform · least privilege"
      >
        {children}
      </AdminShell>
    </AdminPanelProvider>
  );
}
