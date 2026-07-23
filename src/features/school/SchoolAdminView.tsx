'use client';

import Link from 'next/link';
import { Panel, Button, StatusBadge } from '@/app/components/ui';

type SchoolSection =
  | ''
  | 'guru'
  | 'guru/undang'
  | 'penggunaan'
  | 'pengaturan'
  | 'audit'
  | 'library';

const NAV: Array<{ href: string; label: string; section: SchoolSection }> = [
  { href: '/school', label: 'Ringkasan', section: '' },
  { href: '/school/guru', label: 'Guru', section: 'guru' },
  { href: '/school/guru/undang', label: 'Undang guru', section: 'guru/undang' },
  { href: '/school/penggunaan', label: 'Penggunaan', section: 'penggunaan' },
  { href: '/school/pengaturan', label: 'Pengaturan', section: 'pengaturan' },
  { href: '/school/library', label: 'Library sekolah', section: 'library' },
  { href: '/school/audit', label: 'Audit', section: 'audit' },
];

const TEACHERS = [
  { id: 't1', name: 'Siti Aminah', role: 'Guru', status: 'Aktif' },
  { id: 't2', name: 'Budi Santoso', role: 'Guru', status: 'Undangan' },
  { id: 't3', name: 'Rina Kartika', role: 'Kurikulum', status: 'Aktif' },
];

export function SchoolAdminView({ section = '' }: { section?: string }) {
  const current = (section || '') as SchoolSection;
  const title = NAV.find((item) => item.section === current)?.label ?? 'Admin Sekolah';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-caption text-brand-ink-muted">SDN Contoh 01 · mock school workspace</p>
        <h1 className="text-h1 font-semibold text-brand-ink">{title}</h1>
        <p className="text-body-sm text-brand-ink-muted">
          Data agregat sekolah. Bukan workspace guru individual.
        </p>
      </div>

      <nav aria-label="Navigasi school admin" className="flex flex-wrap gap-2">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex min-h-[var(--control-md)] items-center rounded-md border px-3 text-body-sm ${
              item.section === current
                ? 'border-brand-accent bg-brand-accent-soft text-brand-accent'
                : 'border-brand-line text-brand-ink'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {current === '' ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Panel title="Guru aktif"><p className="text-h2 font-semibold">24</p></Panel>
          <Panel title="Kuota terpakai"><p className="text-h2 font-semibold">312 / 500</p></Panel>
          <Panel title="Lembar final bulan ini"><p className="text-h2 font-semibold">48</p></Panel>
        </div>
      ) : null}

      {current === 'guru' || current === 'guru/undang' ? (
        <Panel
          title={current === 'guru/undang' ? 'Undang guru' : 'Daftar guru'}
          description="Aktivasi lewat undangan email/token mock."
          actions={
            current === 'guru' ? (
              <Link
                href="/school/guru/undang"
                className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-3 text-body-sm text-white"
              >
                Undang
              </Link>
            ) : null
          }
        >
          {current === 'guru/undang' ? (
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <label className="flex flex-col gap-1">
                <span className="text-label-semibold">Email guru</span>
                <input className="min-h-[var(--control-md)] rounded-md border border-brand-line px-3" placeholder="guru@sekolah.sch.id" />
              </label>
              <Button type="submit">Kirim undangan mock</Button>
            </form>
          ) : (
            <ul className="flex flex-col gap-2">
              {TEACHERS.map((teacher) => (
                <li key={teacher.id} className="flex items-center justify-between rounded-md border border-brand-line px-3 py-2">
                  <div>
                    <p className="font-semibold">{teacher.name}</p>
                    <p className="text-body-sm text-brand-ink-muted">{teacher.role}</p>
                  </div>
                  <StatusBadge label={teacher.status === 'Aktif' ? 'Final' : 'Draft'} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ) : null}

      {current === 'penggunaan' ? (
        <Panel title="Penggunaan kuota" description="Agregat mock 30 hari terakhir.">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-brand-line px-3 py-3">
              <p className="text-caption text-brand-ink-muted">Generate</p>
              <p className="text-h3 font-semibold">312</p>
            </div>
            <div className="rounded-md border border-brand-line px-3 py-3">
              <p className="text-caption text-brand-ink-muted">Finalisasi</p>
              <p className="text-h3 font-semibold">148</p>
            </div>
          </div>
        </Panel>
      ) : null}

      {current === 'pengaturan' ? (
        <Panel title="Pengaturan sekolah" description="Branding & kebijakan akses (mock).">
          <ul className="list-disc space-y-1 pl-5 text-body-default">
            <li>Nama tampilan: SDN Contoh 01</li>
            <li>Domain undangan: sekolah.sch.id</li>
            <li>Branding logo: belum diunggah</li>
          </ul>
        </Panel>
      ) : null}

      {current === 'library' ? (
        <Panel title="Library internal sekolah" description="Template & bank internal mock.">
          <ul className="flex flex-col gap-2">
            <li className="rounded-md border border-brand-line px-3 py-2">Template UTS Matematika · milik sekolah</li>
            <li className="rounded-md border border-brand-line px-3 py-2">Bank IPAS kelas 5 · internal</li>
          </ul>
        </Panel>
      ) : null}

      {current === 'audit' ? (
        <Panel title="Audit admin" description="Peristiwa admin tanpa konten soal guru.">
          <ul className="flex flex-col gap-2 text-body-sm">
            <li>23 Jul 2026 · undang guru · admin.siti</li>
            <li>22 Jul 2026 · ubah kuota workspace · admin.siti</li>
            <li>20 Jul 2026 · aktifkan branding · admin.budi</li>
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}
