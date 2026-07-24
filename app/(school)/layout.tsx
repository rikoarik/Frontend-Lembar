'use client';

import { SchoolAdminShell } from '@/src/features/admin/AdminAppShell';
import type { ReactNode } from 'react';

export default function SchoolLayout({ children }: { children: ReactNode }) {
  return <SchoolAdminShell>{children}</SchoolAdminShell>;
}
