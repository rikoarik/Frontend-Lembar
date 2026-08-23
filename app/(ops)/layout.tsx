import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { OpsAdminShell } from '@/src/features/admin/AdminAppShell';
import { hasAnyAuthenticatedRole } from '@/src/lib/api/authorization';

export default async function OpsLayout({ children }: { children: ReactNode }) {
  if (!(await hasAnyAuthenticatedRole(['superadmin']))) redirect('/masuk');
  return <OpsAdminShell>{children}</OpsAdminShell>;
}
