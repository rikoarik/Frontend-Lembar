'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/app/components/ui';
import {
  AdminBadge,
  AdminDataTable,
  AdminStatCards,
  AdminToolbar,
} from '@/src/features/admin/AdminChrome';
import { useAdminSectionState } from '@/src/features/admin/adminPanelState';

type AccountRow = {
  id: string;
  displayName: string;
  email: string;
  role: 'teacher' | 'school_admin' | 'superadmin';
  status: 'aktif' | 'ditangguhkan' | 'baru';
  school: string;
};

type SchoolRow = {
  id: string;
  name: string;
  plan: 'pilot' | 'active' | 'grace' | 'blocked';
  teachers: number;
  usage: string;
  owner: string;
};

type JobRow = {
  id: string;
  type: string;
  tenant: string;
  status: 'queued' | 'running' | 'failed' | 'succeeded';
  progress: string;
  updatedAt: string;
};

type QualityRow = {
  id: string;
  reason: string;
  status: 'open' | 'triaged' | 'closed';
  reporter: string;
  createdAt: string;
};

type BillingRow = {
  id: string;
  school: string;
  state: 'active' | 'grace' | 'blocked' | 'expired';
  seats: string;
  renewsAt: string;
};

type FlagRow = {
  id: string;
  key: string;
  description: string;
  enabled: boolean;
  scope: 'global' | 'pilot';
};

type ContentRow = {
  id: string;
  slug: string;
  title: string;
  status: 'published' | 'draft';
  updatedAt: string;
};

const ACCOUNTS: AccountRow[] = [
  { id: 'acct_demo', displayName: 'Demo Guru', email: 'demo@lembar.id', role: 'teacher', status: 'aktif', school: '—' },
  { id: 'acct_admin', displayName: 'Admin Sekolah', email: 'admin@sdncontoh.sch.id', role: 'school_admin', status: 'aktif', school: 'SDN Contoh 01' },
  { id: 'acct_ops', displayName: 'Ops Superadmin', email: 'ops@lembar.id', role: 'superadmin', status: 'aktif', school: 'Platform' },
  { id: 'acct_04', displayName: 'Guru Baru', email: 'baru@sekolah.sch.id', role: 'teacher', status: 'baru', school: 'SMP Harapan' },
  { id: 'acct_05', displayName: 'Admin Grace', email: 'grace@sekolah.sch.id', role: 'school_admin', status: 'ditangguhkan', school: 'SMA Nusantara' },
];

const SCHOOLS: SchoolRow[] = [
  { id: 'sch_01', name: 'SDN Contoh 01', plan: 'pilot', teachers: 24, usage: '312/500', owner: 'admin@sdncontoh.sch.id' },
  { id: 'sch_02', name: 'SMP Harapan', plan: 'grace', teachers: 41, usage: '480/500', owner: 'admin@smpharapan.sch.id' },
  { id: 'sch_03', name: 'SMA Nusantara', plan: 'blocked', teachers: 60, usage: '500/500', owner: 'admin@smanusantara.sch.id' },
  { id: 'sch_04', name: 'SD Mawar', plan: 'active', teachers: 18, usage: '120/400', owner: 'admin@sdmawar.sch.id' },
];

const JOBS: JobRow[] = [
  { id: 'job_8f2a', type: 'generate', tenant: 'SDN Contoh 01', status: 'running', progress: '58%', updatedAt: '1 mnt lalu' },
  { id: 'job_11bc', type: 'generate', tenant: 'SMP Harapan', status: 'queued', progress: '0%', updatedAt: '3 mnt lalu' },
  { id: 'job_99aa', type: 'export', tenant: 'SMA Nusantara', status: 'failed', progress: '—', updatedAt: '12 mnt lalu' },
  { id: 'job_22cd', type: 'generate', tenant: 'SD Mawar', status: 'succeeded', progress: '100%', updatedAt: '25 mnt lalu' },
];

const QUALITY: QualityRow[] = [
  { id: 'rep_a1', reason: 'kualitas_soal', status: 'open', reporter: 'guru.siti', createdAt: '2026-07-23' },
  { id: 'rep_b2', reason: 'kunci_salah', status: 'triaged', reporter: 'guru.rina', createdAt: '2026-07-22' },
  { id: 'rep_c3', reason: 'privasi', status: 'closed', reporter: 'guru.budi', createdAt: '2026-07-20' },
];

const BILLING: BillingRow[] = [
  { id: 'bill_1', school: 'SDN Contoh 01', state: 'active', seats: '30', renewsAt: '2026-08-24' },
  { id: 'bill_2', school: 'SMP Harapan', state: 'grace', seats: '50', renewsAt: '2026-07-28' },
  { id: 'bill_3', school: 'SMA Nusantara', state: 'blocked', seats: '80', renewsAt: '2026-07-10' },
  { id: 'bill_4', school: 'SD Mawar', state: 'active', seats: '20', renewsAt: '2026-09-01' },
];

const FLAGS: FlagRow[] = [
  { id: 'f1', key: 'share.links', description: 'Controlled share links', enabled: true, scope: 'global' },
  { id: 'f2', key: 'cms.marketing', description: 'Structured marketing CMS', enabled: true, scope: 'global' },
  { id: 'f3', key: 'analytics.creator', description: 'Creator analytics screen', enabled: true, scope: 'pilot' },
  { id: 'f4', key: 'ops.bulk_actions', description: 'Bulk tenant actions', enabled: false, scope: 'pilot' },
];

const CONTENT: ContentRow[] = [
  { id: 'c1', slug: 'home', title: 'Beranda', status: 'published', updatedAt: '2026-07-20' },
  { id: 'c2', slug: 'harga', title: 'Harga', status: 'draft', updatedAt: '2026-07-23' },
  { id: 'c3', slug: 'untuk-sekolah', title: 'Untuk Sekolah', status: 'published', updatedAt: '2026-07-18' },
];

function planTone(plan: SchoolRow['plan']): 'ok' | 'warn' | 'bad' | 'info' | 'neutral' {
  if (plan === 'active' || plan === 'pilot') return 'ok';
  if (plan === 'grace') return 'warn';
  if (plan === 'blocked') return 'bad';
  return 'neutral';
}

function jobTone(status: JobRow['status']): 'ok' | 'warn' | 'bad' | 'info' | 'neutral' {
  if (status === 'succeeded') return 'ok';
  if (status === 'running') return 'info';
  if (status === 'queued') return 'neutral';
  return 'bad';
}

export function OpsConsoleView({ section = '' }: { section?: string }) {
  const key = section || '';
  const { search, setSearch, setToast } = useAdminSectionState(key || 'ringkasan');
  const [flags, setFlags] = useState(FLAGS);

  const accounts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ACCOUNTS;
    return ACCOUNTS.filter(
      (row) =>
        row.displayName.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.role.includes(q) ||
        row.school.toLowerCase().includes(q),
    );
  }, [search]);

  const schools = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SCHOOLS;
    return SCHOOLS.filter(
      (row) => row.name.toLowerCase().includes(q) || row.owner.toLowerCase().includes(q) || row.plan.includes(q),
    );
  }, [search]);

  const jobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return JOBS;
    return JOBS.filter(
      (row) => row.id.includes(q) || row.tenant.toLowerCase().includes(q) || row.type.includes(q) || row.status.includes(q),
    );
  }, [search]);

  const quality = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return QUALITY;
    return QUALITY.filter(
      (row) => row.id.includes(q) || row.reason.includes(q) || row.reporter.includes(q) || row.status.includes(q),
    );
  }, [search]);

  const billing = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return BILLING;
    return BILLING.filter((row) => row.school.toLowerCase().includes(q) || row.state.includes(q));
  }, [search]);

  const content = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CONTENT;
    return CONTENT.filter((row) => row.slug.includes(q) || row.title.toLowerCase().includes(q) || row.status.includes(q));
  }, [search]);

  return (
    <div className="space-y-4">
      {key === '' ? (
        <>
          <AdminStatCards
            items={[
              { label: 'Job aktif', value: '3', hint: '1 gagal perlu retry', tone: 'info' },
              { label: 'Quality open', value: '2', hint: 'butuh triage', tone: 'warn' },
              { label: 'Tenant pantau', value: '2', hint: 'grace/blocked', tone: 'bad' },
              { label: 'Flag pilot', value: '2', hint: 'scope terbatas', tone: 'ok' },
            ]}
          />
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-3 rounded-[var(--radius-lg)] border border-brand-line/80 bg-brand-surface-raised p-4 shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-body-default font-semibold">Jobs terbaru</h2>
                <a href="/ops/jobs" className="text-caption font-medium text-brand-accent hover:underline">Lihat semua</a>
              </div>
              <AdminDataTable
                rows={JOBS.slice(0, 4)}
                columns={[
                  { key: 'id', header: 'Job', render: (row) => row.id },
                  { key: 'tenant', header: 'Tenant', render: (row) => row.tenant },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (row) => <AdminBadge tone={jobTone(row.status)} label={row.status} />,
                  },
                  { key: 'progress', header: 'Progress', render: (row) => row.progress },
                ]}
              />
            </div>
            <div className="space-y-3 rounded-[var(--radius-lg)] border border-brand-line/80 bg-brand-surface-raised p-4 shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-body-default font-semibold">Tenant yang perlu perhatian</h2>
                <a href="/ops/schools" className="text-caption font-medium text-brand-accent hover:underline">Lihat semua</a>
              </div>
              <AdminDataTable
                rows={SCHOOLS.filter((s) => s.plan === 'grace' || s.plan === 'blocked')}
                columns={[
                  { key: 'name', header: 'Sekolah', render: (row) => row.name },
                  {
                    key: 'plan',
                    header: 'Status',
                    render: (row) => <AdminBadge tone={planTone(row.plan)} label={row.plan} />,
                  },
                  { key: 'usage', header: 'Usage', render: (row) => row.usage },
                ]}
                rowActions={(row) => (
                  <Button size="sm" variant="secondary" onClick={() => setToast(`Buka tenant ${row.name}`)}>
                    Review
                  </Button>
                )}
              />
            </div>
          </div>
        </>
      ) : null}

      {key === 'accounts' ? (
        <>
          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari akun, email, role, sekolah"
            actions={<Button size="sm" variant="secondary" onClick={() => setToast('Export akun mock disiapkan.')}>Export CSV</Button>}
          />
          <AdminDataTable
            rows={accounts}
            columns={[
              {
                key: 'name',
                header: 'Akun',
                render: (row) => (
                  <div>
                    <div className="font-semibold">{row.displayName}</div>
                    <div className="text-caption text-brand-ink-muted">{row.email}</div>
                  </div>
                ),
              },
              { key: 'role', header: 'Role', render: (row) => row.role },
              {
                key: 'status',
                header: 'Status',
                render: (row) => (
                  <AdminBadge
                    tone={row.status === 'aktif' ? 'ok' : row.status === 'baru' ? 'info' : 'bad'}
                    label={row.status}
                  />
                ),
              },
              { key: 'school', header: 'Sekolah', render: (row) => row.school },
            ]}
            rowActions={(row) => (
              <>
                <Button size="sm" variant="secondary" onClick={() => setToast(`Impersonate disabled mock: ${row.id}`)}>
                  Detail
                </Button>
                <Button size="sm" variant="danger" onClick={() => setToast(`Suspend mock: ${row.displayName}`)}>
                  Suspend
                </Button>
              </>
            )}
          />
        </>
      ) : null}

      {key === 'schools' ? (
        <>
          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari sekolah / owner / status"
            actions={<Button size="sm" onClick={() => setToast('Onboarding tenant mock dibuka.')}>Tambah tenant</Button>}
          />
          <AdminDataTable
            rows={schools}
            columns={[
              { key: 'name', header: 'Sekolah', render: (row) => row.name },
              {
                key: 'plan',
                header: 'Paket',
                render: (row) => <AdminBadge tone={planTone(row.plan)} label={row.plan} />,
              },
              { key: 'teachers', header: 'Guru', render: (row) => row.teachers },
              { key: 'usage', header: 'Usage', render: (row) => row.usage },
              { key: 'owner', header: 'Owner', render: (row) => row.owner },
            ]}
            rowActions={(row) => (
              <>
                <Button size="sm" variant="secondary" onClick={() => setToast(`Billing ${row.name}`)}>
                  Billing
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setToast(`Audit ${row.name}`)}>
                  Audit
                </Button>
              </>
            )}
          />
        </>
      ) : null}

      {key === 'catalog' || key === 'prompts' ? (
        <AdminDataTable
          rows={
            key === 'catalog'
              ? [
                  { id: 'cat1', name: 'Kurmer Fase C', status: 'published', version: 'v3' },
                  { id: 'cat2', name: 'K13 SD', status: 'published', version: 'v2' },
                  { id: 'cat3', name: 'Draft IPAS 2026', status: 'draft', version: 'v0.4' },
                ]
              : [
                  { id: 'p1', name: 'prompt.generate.v3', status: 'aktif', version: 'v3' },
                  { id: 'p2', name: 'prompt.review.critic.v2', status: 'aktif', version: 'v2' },
                  { id: 'p3', name: 'prompt.export.layout.v1', status: 'draft', version: 'v1' },
                ]
          }
          columns={[
            { key: 'name', header: 'Nama', render: (row) => row.name },
            {
              key: 'status',
              header: 'Status',
              render: (row) => (
                <AdminBadge tone={row.status === 'published' || row.status === 'aktif' ? 'ok' : 'neutral'} label={row.status} />
              ),
            },
            { key: 'version', header: 'Versi', render: (row) => row.version },
          ]}
          rowActions={(row) => (
            <Button size="sm" variant="secondary" onClick={() => setToast(`Kelola ${row.name}`)}>
              Kelola
            </Button>
          )}
        />
      ) : null}

      {key === 'jobs' ? (
        <>
          <AdminToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Cari job id / tenant / status" />
          <AdminDataTable
            rows={jobs}
            columns={[
              { key: 'id', header: 'Job', render: (row) => row.id },
              { key: 'type', header: 'Tipe', render: (row) => row.type },
              { key: 'tenant', header: 'Tenant', render: (row) => row.tenant },
              {
                key: 'status',
                header: 'Status',
                render: (row) => <AdminBadge tone={jobTone(row.status)} label={row.status} />,
              },
              { key: 'progress', header: 'Progress', render: (row) => row.progress },
              { key: 'updated', header: 'Update', render: (row) => row.updatedAt },
            ]}
            rowActions={(row) => (
              <>
                <Button size="sm" variant="secondary" onClick={() => setToast(`Inspect ${row.id}`)}>
                  Inspect
                </Button>
                {row.status === 'failed' ? (
                  <Button size="sm" onClick={() => setToast(`Retry ${row.id}`)}>
                    Retry
                  </Button>
                ) : null}
              </>
            )}
          />
        </>
      ) : null}

      {key === 'quality' ? (
        <>
          <AdminToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Cari report / alasan / reporter" />
          <AdminDataTable
            rows={quality}
            columns={[
              { key: 'id', header: 'Report', render: (row) => row.id },
              { key: 'reason', header: 'Alasan', render: (row) => row.reason },
              {
                key: 'status',
                header: 'Status',
                render: (row) => (
                  <AdminBadge
                    tone={row.status === 'open' ? 'warn' : row.status === 'triaged' ? 'info' : 'ok'}
                    label={row.status}
                  />
                ),
              },
              { key: 'reporter', header: 'Reporter', render: (row) => row.reporter },
              { key: 'created', header: 'Dibuat', render: (row) => row.createdAt },
            ]}
            rowActions={(row) => (
              <Button size="sm" variant="secondary" onClick={() => setToast(`Triage ${row.id}`)}>
                Triage
              </Button>
            )}
          />
        </>
      ) : null}

      {key === 'audit' ? (
        <AdminDataTable
          rows={[
            { id: 'au1', at: '2026-07-23 10:11', actor: 'ops.rina', action: 'publish catalog', target: 'Kurmer Fase C' },
            { id: 'au2', at: '2026-07-22 16:40', actor: 'ops.budi', action: 'revoke share support', target: 'share_xx' },
            { id: 'au3', at: '2026-07-21 09:02', actor: 'ops.rina', action: 'toggle flag', target: 'analytics.creator' },
          ]}
          columns={[
            { key: 'at', header: 'Waktu', render: (row) => row.at },
            { key: 'actor', header: 'Aktor', render: (row) => row.actor },
            { key: 'action', header: 'Aksi', render: (row) => row.action },
            { key: 'target', header: 'Target', render: (row) => row.target },
          ]}
        />
      ) : null}

      {key === 'billing' ? (
        <>
          <AdminToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Cari sekolah / state" />
          <AdminDataTable
            rows={billing}
            columns={[
              { key: 'school', header: 'Sekolah', render: (row) => row.school },
              {
                key: 'state',
                header: 'State',
                render: (row) => (
                  <AdminBadge
                    tone={
                      row.state === 'active'
                        ? 'ok'
                        : row.state === 'grace'
                          ? 'warn'
                          : row.state === 'blocked'
                            ? 'bad'
                            : 'neutral'
                    }
                    label={row.state}
                  />
                ),
              },
              { key: 'seats', header: 'Seats', render: (row) => row.seats },
              { key: 'renew', header: 'Renew', render: (row) => row.renewsAt },
            ]}
            rowActions={(row) => (
              <Button size="sm" variant="secondary" onClick={() => setToast(`Billing detail ${row.school}`)}>
                Kelola
              </Button>
            )}
          />
        </>
      ) : null}

      {key === 'flags' ? (
        <AdminDataTable
          rows={flags}
          columns={[
            { key: 'key', header: 'Flag', render: (row) => row.key },
            { key: 'desc', header: 'Deskripsi', render: (row) => row.description },
            { key: 'scope', header: 'Scope', render: (row) => row.scope },
            {
              key: 'enabled',
              header: 'State',
              render: (row) => <AdminBadge tone={row.enabled ? 'ok' : 'neutral'} label={row.enabled ? 'on' : 'off'} />,
            },
          ]}
          rowActions={(row) => (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setFlags((prev) =>
                  prev.map((item) => (item.id === row.id ? { ...item, enabled: !item.enabled } : item)),
                );
                setToast(`Flag ${row.key} diubah (mock).`);
              }}
            >
              Toggle
            </Button>
          )}
        />
      ) : null}

      {key === 'content' ? (
        <>
          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari slug / judul / status"
            actions={<Button size="sm" onClick={() => setToast('Buat draft CMS mock.')}>Draft baru</Button>}
          />
          <AdminDataTable
            rows={content}
            columns={[
              { key: 'slug', header: 'Slug', render: (row) => row.slug },
              { key: 'title', header: 'Judul', render: (row) => row.title },
              {
                key: 'status',
                header: 'Status',
                render: (row) => (
                  <AdminBadge tone={row.status === 'published' ? 'ok' : 'neutral'} label={row.status} />
                ),
              },
              { key: 'updated', header: 'Update', render: (row) => row.updatedAt },
            ]}
            rowActions={(row) => (
              <>
                <Button size="sm" variant="secondary" onClick={() => setToast(`Edit ${row.slug}`)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={() => setToast(`${row.status === 'published' ? 'Unpublish' : 'Publish'} ${row.slug}`)}
                >
                  {row.status === 'published' ? 'Unpublish' : 'Publish'}
                </Button>
              </>
            )}
          />
        </>
      ) : null}
    </div>
  );
}
