import type { ReactNode } from 'react';

export default function OpsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-paper text-brand-ink">
      <header className="border-b border-brand-line px-4 py-3">
        <span className="text-body-sm font-medium text-brand-muted">lembar ops</span>
      </header>
      <main id="main" className="p-4">
        {children}
      </main>
    </div>
  );
}
