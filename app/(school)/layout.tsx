import type { ReactNode } from 'react';

export default function SchoolLayout({ children }: { children: ReactNode }) {
  // Management chrome is owned by SchoolAdminView for a real admin-panel feel.
  return children;
}
