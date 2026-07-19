import { Panel, StatusBadge } from '@/app/components/ui';

const recentItems = [
  {
    id: 'sheet-1',
    title: 'Latihan pecahan kelas 5',
    subject: 'Matematika',
    status: 'Draft' as const,
    updatedAt: '19 Jul 2026',
  },
  {
    id: 'sheet-2',
    title: 'Kuis perubahan wujud benda',
    subject: 'IPAS',
    status: 'Perlu ditinjau' as const,
    updatedAt: '18 Jul 2026',
  },
];

export default function AppDashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel
          title="Selamat datang"
          description="Buat draft, tinjau hasil, lalu finalkan tanpa pindah alur."
          actions={
            <a
              href="/app/generate"
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-body-default font-medium text-white"
            >
              Generate lembar
            </a>
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-brand-line bg-brand-paper px-3 py-3">
              <div className="text-caption text-brand-ink-muted">Tersimpan</div>
              <div className="mt-1 text-h3 font-semibold text-brand-ink">12</div>
            </div>
            <div className="rounded-md border border-brand-line bg-brand-paper px-3 py-3">
              <div className="text-caption text-brand-ink-muted">Final</div>
              <div className="mt-1 text-h3 font-semibold text-brand-ink">4</div>
            </div>
            <div className="rounded-md border border-brand-line bg-brand-paper px-3 py-3">
              <div className="text-caption text-brand-ink-muted">Perlu ditinjau</div>
              <div className="mt-1 text-h3 font-semibold text-brand-ink">3</div>
            </div>
          </div>
        </Panel>

        <Panel title="Aksi inti" description="Satu langkah ke alur kerja utama.">
          <div className="flex flex-col gap-2">
            <a
              className="rounded-md border border-brand-line px-3 py-3 hover:bg-brand-paper"
              href="/app/generate"
            >
              <div className="font-semibold text-brand-ink">Generate lembar</div>
              <div className="text-body-sm text-brand-ink-muted">
                Mulai draft baru dari materi dan konfigurasi aktif.
              </div>
            </a>
            <a
              className="rounded-md border border-brand-line px-3 py-3 hover:bg-brand-paper"
              href="/app/riwayat"
            >
              <div className="font-semibold text-brand-ink">Riwayat</div>
              <div className="text-body-sm text-brand-ink-muted">
                Buka ulang, cetak, atau gandakan lembar yang sudah ada.
              </div>
            </a>
            <a
              className="rounded-md border border-brand-line px-3 py-3 hover:bg-brand-paper"
              href="/app/template"
            >
              <div className="font-semibold text-brand-ink">Template</div>
              <div className="text-body-sm text-brand-ink-muted">
                Jalankan ulang konfigurasi yang sering dipakai.
              </div>
            </a>
          </div>
        </Panel>
      </section>

      <Panel title="Terakhir dibuka" description="Lima item terakhir dari workspace aktif.">
        <ul className="flex flex-col gap-2" role="list">
          {recentItems.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-2 rounded-md border border-brand-line bg-brand-surface-raised px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-brand-ink">{item.title}</p>
                <p className="text-body-sm text-brand-ink-muted">
                  {item.subject} · Diperbarui {item.updatedAt}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge label={item.status} />
                <a
                  href="/app/riwayat"
                  className="text-body-sm text-brand-accent underline underline-offset-4"
                >
                  Buka
                </a>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
