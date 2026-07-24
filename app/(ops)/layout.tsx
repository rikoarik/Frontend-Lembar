'use client';

import { OpsAdminShell } from '@/src/features/admin/AdminAppShell';
import type { ReactNode } from 'react';

export default function OpsLayout({ children }: { children: ReactNode }) {
  return <OpsAdminShell>{children}</OpsAdminShell>;
}
