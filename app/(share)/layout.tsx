import type { ReactNode } from 'react';

export default function ShareLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-paper text-brand-ink">
      <main id="main">{children}</main>
    </div>
  );
}
