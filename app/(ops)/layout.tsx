import type { ReactNode } from 'react';

export default function OpsLayout({ children }: { children: ReactNode }) {
  // Management chrome is owned by OpsConsoleView for a real admin-panel feel.
  return children;
}
