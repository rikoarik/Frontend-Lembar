'use client';

import { Panel } from '@/app/components/ui';

export function OutputSettings() {
  return (
    <Panel
      title="Pengaturan Output"
      description="Konfigurasi format dan layout lembar yang dihasilkan."
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-md border border-brand-line bg-brand-paper p-4">
          <p className="text-body-sm text-brand-ink-muted">
            Pengaturan output akan tersedia setelah kontrak backend final. Saat ini, lembar akan
            menggunakan format default.
          </p>
        </div>
        <div className="flex flex-col gap-3 opacity-60" aria-disabled="true">
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-brand-ink">Ukuran kertas</span>
            <span className="text-body-sm text-brand-ink-muted">A4 (default)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-brand-ink">Orientasi</span>
            <span className="text-body-sm text-brand-ink-muted">Portrait (default)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-brand-ink">Font</span>
            <span className="text-body-sm text-brand-ink-muted">Inter (default)</span>
          </div>
        </div>
        <p className="text-body-sm text-brand-ink-muted italic">
          Pengaturan ini bersifat placeholder dan belum dapat diubah.
        </p>
      </div>
    </Panel>
  );
}
