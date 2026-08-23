import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { SchoolAdminShell } from '@/src/features/admin/AdminAppShell';
import { hasAnyAuthenticatedRole } from '@/src/lib/api/authorization';

export default async function SchoolLayout({ children }: { children: ReactNode }) {
  if (!(await hasAnyAuthenticatedRole(['school_admin', 'superadmin']))) redirect('/masuk');
  return <SchoolAdminShell>{children}</SchoolAdminShell>;
}
