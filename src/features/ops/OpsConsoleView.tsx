'use client';

import Link from 'next/link';
import { Panel, Button, StatusBadge } from '@/app/components/ui';

const OPS_NAV = [
  { href: '/ops', label: 'Ringkasan' },
  { href: '/ops/accounts', label: 'Akun' },
  { href: '/ops/schools', label: 'Sekolah' },
  { href: '/ops/catalog', label: 'Katalog' },
  { href: '/ops/prompts', label: 'Prompt' },
  { href: '/ops/jobs', label: 'Jobs' },
  { href: '/ops/quality', label: 'Quality' },
  { href: '/ops/audit', label: 'Audit' },
  { href: '/ops/billing', label: 'Billing' },
  { href: '/ops/flags', label: 'Flags' },
  { href: '/ops/content', label: 'Marketing CMS' },
];

const SECTION_COPY: Record<string, { title: string; body: string; rows: string[] }> = {
  '': {
    title: 'Operasional platform',
    body: 'Least-privilege mock console untuk superadmin. Tidak menampilkan isi soal guru.',
    rows: ['Antrian job aktif: 3', 'Laporan kualitas terbuka: 5', 'Tenant butuh review: 2'],
  },
  accounts: {
    title: 'Akun',
    body: 'Pencarian akun terbatas metadata non-konten.',
    rows: ['acct_demo · teacher · aktif', 'acct_school · school_admin · aktif', 'acct_ops · superadmin · aktif'],
  },
  schools: {
    title: 'Sekolah',
    body: 'Tenant sekolah & status langganan agregat.',
    rows: ['SDN Contoh 01 · pilot · sehat', 'SMP Harapan · grace · pantau', 'SMA Nusantara · blocked · tindak lanjut'],
  },
  catalog: {
    title: 'Katalog kurikulum',
    body: 'Versi katalog publish/draft (mock).',
    rows: ['Kurmer Fase C · published', 'K13 SD · published', 'Draft IPAS 2026 · draft'],
  },
  prompts: {
    title: 'Prompt ops',
    body: 'Template prompt internal tanpa menampilkan output asesmen.',
    rows: ['prompt.generate.v3 · aktif', 'prompt.review.critic.v2 · aktif'],
  },
  jobs: {
    title: 'Jobs',
    body: 'Status antrian generate/export.',
    rows: ['job_8f2a · running · 58%', 'job_11bc · queued', 'job_99aa · failed · retryable'],
  },
  quality: {
    title: 'Quality reports',
    body: 'Tiket laporan kualitas dari guru.',
    rows: ['rep_a1 · kualitas_soal · open', 'rep_b2 · kunci_salah · triaged'],
  },
  audit: {
    title: 'Audit',
    body: 'Jejak tindakan superadmin.',
    rows: ['publish catalog · ops.rina', 'revoke share support · ops.budi'],
  },
  billing: {
    title: 'Billing',
    body: 'Status paket provider-neutral.',
    rows: ['school_01 · active', 'school_02 · grace', 'school_03 · blocked'],
  },
  flags: {
    title: 'Feature flags',
    body: 'Toggle fitur pilot.',
    rows: ['share.links · on', 'cms.marketing · on', 'analytics.creator · on'],
  },
  content: {
    title: 'Marketing CMS',
    body: 'Draft/publish konten landing terstruktur.',
    rows: ['home · published', 'harga · draft', 'untuk-sekolah · published'],
  },
};

export function OpsConsoleView({ section = '' }: { section?: string }) {
  const key = section || '';
  const content = SECTION_COPY[key] ?? {
    title: 'Bagian ops',
    body: 'Placeholder least-privilege.',
    rows: ['Belum ada data mock untuk seksi ini.'],
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-caption text-brand-ink-muted">lembar ops · mock superadmin</p>
        <h1 className="text-h1 font-semibold text-brand-ink">{content.title}</h1>
        <p className="text-body-sm text-brand-ink-muted">{content.body}</p>
      </div>

      <nav aria-label="Navigasi ops" className="flex flex-wrap gap-2">
        {OPS_NAV.map((item) => {
          const active = item.href === '/ops' ? key === '' : item.href === `/ops/${key}`;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex min-h-[var(--control-md)] items-center rounded-md border px-3 text-body-sm ${
                active
                  ? 'border-brand-accent bg-brand-accent-soft text-brand-accent'
                  : 'border-brand-line text-brand-ink'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Panel title="Data mock" description="Tidak memuat konten asesmen guru.">
        <ul className="flex flex-col gap-2">
          {content.rows.map((row) => (
            <li key={row} className="rounded-md border border-brand-line px-3 py-2 text-body-sm">
              {row}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" disabled>
            Tindakan terlindungi
          </Button>
          <StatusBadge label="Draft" />
        </div>
      </Panel>
    </div>
  );
}
