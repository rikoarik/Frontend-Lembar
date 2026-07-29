import Link from 'next/link';
import { Panel } from '@/app/components/ui';

export function TemplateView() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-semibold text-brand-ink">Template konfigurasi</h1>
        <p className="text-body-sm text-brand-ink-muted">
          Template tersimpan belum tersedia di backend.
        </p>
      </div>
      <Panel
        title="Belum ada template"
        description="Gunakan generate langsung. Preset demo sudah dihapus agar tidak dianggap sebagai data tersimpan."
      >
        <Link
          href="/app/generate"
          className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-white"
        >
          Buka generate
        </Link>
      </Panel>
    </div>
  );
}
