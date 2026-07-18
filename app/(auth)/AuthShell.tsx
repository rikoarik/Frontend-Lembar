'use client';

import type { ReactNode } from 'react';

type AuthShellProps = {
  side: ReactNode;
  children: ReactNode;
};

export default function AuthShell({ side, children }: AuthShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-paper text-ink lg:grid-cols-[43%_57%]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-white"
      >
        Lewati ke formulir
      </a>
      {side}
      {children}
    </div>
  );
}
