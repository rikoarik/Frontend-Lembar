'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/app/components/ui';
import {
  AdminBadge,
  AdminDataTable,
  AdminShell,
  AdminStatCards,
  AdminToolbar,
} from '@/src/features/admin/AdminChrome';

type TeacherRow = {
  id: string;
  name: string;
  email: string;
  role: 'Guru' | 'Kurikulum' | 'Admin sekolah';
  status: 'Aktif' | 'Undangan' | 'Ditangguhkan';
  lastActive: string;
  sheetsFinal: number;
};

type UsageRow = {
  id: string;
  teacher: string;
  generated: number;
  finalized: number;
  shared: number;
  period: string;
};

type AuditRow = {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
};

type LibraryRow = {
  id: string;
  name: string;
  kind: 'Template' | 'Bank soal';
  owner: string;
  updatedAt: string;
  visibility: 'Internal' | 'Draft';
};

const TEACHERS: TeacherRow[] = [
  {
    id: 't1',
    name: 'Siti Aminah',
    email: 'siti@sdncontoh.sch.id',
    role: 'Guru',
    status: 'Aktif',
    lastActive: '2026-07-23',
    sheetsFinal: 12,
  },
  {
    id: 't2',
    name: 'Budi Santoso',
    email: 'budi@sdncontoh.sch.id',
    role: 'Guru',
    status: 'Undangan',
    lastActive: '—',
    sheetsFinal: 0,
  },
  {
    id: 't3',
    name: 'Rina Kartika',
    email: 'rina@sdncontoh.sch.id',
    role: 'Kurikulum',
    status: 'Aktif',
    lastActive: '2026-07-22',
    sheetsFinal: 19,
  },
  {
    id: 't4',
    name: 'Agus Pratama',
    email: 'agus@sdncontoh.sch.id',
    role: 'Guru',
    status: 'Ditangguhkan',
    lastActive: '2026-07-10',
    sheetsFinal: 3,
  },
  {
    id: 't5',
    name: 'Dewi Lestari',
    email: 'dewi@sdncontoh.sch.id',
    role: 'Guru',
    status: 'Aktif',
    lastActive: '2026-07-24',
    sheetsFinal: 8,
  },
];

const USAGE: UsageRow[] = [
  { id: 'u1', teacher: 'Siti Aminah', generated: 24, finalized: 12, shared: 5, period: '30 hari' },
  { id: 'u2', teacher: 'Rina Kartika', generated: 31, finalized: 19, shared: 8, period: '30 hari' },
  { id: 'u3', teacher: 'Dewi Lestari', generated: 15, finalized: 8, shared: 2, period: '30 hari' },
  { id: 'u4', teacher: 'Agus Pratama', generated: 7, finalized: 3, shared: 0, period: '30 hari' },
];

const AUDIT: AuditRow[] = [
  {
    id: 'a1',
    actor: 'admin.siti',
    action: 'Undang guru',
    target: 'budi@sdncontoh.sch.id',
    at: '2026-07-23 09:12',
  },
  {
    id: 'a2',
    actor: 'admin.siti',
    action: 'Ubah kuota workspace',
    target: 'ws_school_demo',
    at: '2026-07-22 14:40',
  },
  {
    id: 'a3',
    actor: 'admin.budi',
    action: 'Aktifkan branding',
    target: 'logo sekolah',
    at: '2026-07-20 11:05',
  },
];

const LIBRARY: LibraryRow[] = [
  {
    id: 'l1',
    name: 'Template UTS Matematika',
    kind: 'Template',
    owner: 'Kurikulum',
    updatedAt: '2026-07-18',
    visibility: 'Internal',
  },
  {
    id: 'l2',
    name: 'Bank IPAS kelas 5',
    kind: 'Bank soal',
    owner: 'Rina Kartika',
    updatedAt: '2026-07-21',
    visibility: 'Internal',
  },
  {
    id: 'l3',
    name: 'Draft PTS Bahasa',
    kind: 'Template',
    owner: 'Siti Aminah',
    updatedAt: '2026-07-23',
    visibility: 'Draft',
  },
];

const NAV = [
  { href: '/school', label: 'Ringkasan', icon: 'dashboard' },
  { href: '/school/guru', label: 'Guru', badge: String(TEACHERS.length), icon: 'group' },
  { href: '/school/guru/undang', label: 'Undang', icon: 'person_add' },
  { href: '/school/penggunaan', label: 'Penggunaan', icon: 'monitoring' },
  { href: '/school/pengaturan', label: 'Pengaturan', icon: 'settings' },
  { href: '/school/library', label: 'Library', icon: 'inventory_2' },
  { href: '/school/audit', label: 'Audit', icon: 'history' },
];

function teacherTone(status: TeacherRow['status']): 'ok' | 'warn' | 'bad' | 'neutral' {
  if (status === 'Aktif') return 'ok';
  if (status === 'Undangan') return 'warn';
  if (status === 'Ditangguhkan') return 'bad';
  return 'neutral';
}

export function SchoolAdminView({ section = '' }: { section?: string }) {
  const current = section || '';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TeacherRow['status']>('all');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteNote, setInviteNote] = useState('');
  const [message, setMessage] = useState('');

  const title =
    NAV.find((item) => item.href === `/school${current ? `/${current}` : ''}`)?.label ??
    (current === 'guru/undang'
      ? 'Undang'
      : current === 'guru'
        ? 'Guru'
        : current === 'penggunaan'
          ? 'Penggunaan'
          : current === 'pengaturan'
            ? 'Pengaturan'
            : current === 'library'
              ? 'Library'
              : current === 'audit'
                ? 'Audit'
                : 'Ringkasan');

  const teachers = useMemo(() => {
    return TEACHERS.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.role.toLowerCase().includes(q)
      );
    });
  }, [search, statusFilter]);

  const usageRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return USAGE;
    return USAGE.filter((row) => row.teacher.toLowerCase().includes(q));
  }, [search]);

  const auditRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return AUDIT;
    return AUDIT.filter(
      (row) =>
        row.actor.toLowerCase().includes(q) ||
        row.action.toLowerCase().includes(q) ||
        row.target.toLowerCase().includes(q),
    );
  }, [search]);

  const libraryRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return LIBRARY;
    return LIBRARY.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.kind.toLowerCase().includes(q) ||
        row.owner.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <AdminShell
      brand="lembar school"
      title={title}
      subtitle="SDN Contoh 01 · panel admin sekolah (mock management)"
      nav={NAV}
      currentPath={`/school${current ? `/${current}` : ''}`}
      topRight={<AdminBadge tone="ok" label="school_admin" />}
    >
      {message ? (
        <p className="rounded-xl border border-brand-accent/20 bg-brand-accent-soft px-4 py-3 text-body-sm text-brand-ink shadow-[var(--shadow-sm)]" role="status">
          {message}
        </p>
      ) : null}

      {current === '' ? (
        <>
          <AdminStatCards
            items={[
              { label: 'Guru aktif', value: '24', hint: '3 undangan menunggu', tone: 'ok' },
              { label: 'Kuota terpakai', value: '312 / 500', hint: '62% periode ini', tone: 'info' },
              { label: 'Lembar final', value: '48', hint: '30 hari terakhir', tone: 'ok' },
              { label: 'Bagikan aktif', value: '17', hint: '2 akan kedaluwarsa', tone: 'warn' },
            ]}
          />
          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari guru untuk pratinjau cepat…"
            actions={
              <>
                <Button size="sm" onClick={() => (window.location.href = '/school/guru/undang')}>
                  Undang guru
                </Button>
                <Button size="sm" variant="secondary" onClick={() => (window.location.href = '/school/penggunaan')}>
                  Lihat penggunaan
                </Button>
              </>
            }
          />
          <AdminDataTable
            rows={teachers.slice(0, 5)}
            columns={[
              { key: 'name', header: 'Guru', render: (row) => (
                <div>
                  <div className="font-semibold">{row.name}</div>
                  <div className="text-caption text-brand-ink-muted">{row.email}</div>
                </div>
              ) },
              { key: 'role', header: 'Peran', render: (row) => row.role },
              {
                key: 'status',
                header: 'Status',
                render: (row) => <AdminBadge tone={teacherTone(row.status)} label={row.status} />,
              },
              { key: 'final', header: 'Final', render: (row) => row.sheetsFinal },
            ]}
            rowActions={(row) => (
              <>
                <Button size="sm" variant="secondary" onClick={() => setMessage(`Detail mock: ${row.name}`)}>
                  Detail
                </Button>
              </>
            )}
          />
        </>
      ) : null}

      {current === 'guru' ? (
        <>
          <AdminStatCards
            items={[
              { label: 'Total guru', value: String(TEACHERS.length), tone: 'neutral' },
              { label: 'Aktif', value: String(TEACHERS.filter((t) => t.status === 'Aktif').length), tone: 'ok' },
              { label: 'Undangan', value: String(TEACHERS.filter((t) => t.status === 'Undangan').length), tone: 'warn' },
              { label: 'Ditangguhkan', value: String(TEACHERS.filter((t) => t.status === 'Ditangguhkan').length), tone: 'bad' },
            ]}
          />
          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari nama, email, atau peran"
            filters={
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="min-h-[var(--control-md)] rounded-md border border-brand-line px-3 text-body-sm"
              >
                <option value="all">Semua status</option>
                <option value="Aktif">Aktif</option>
                <option value="Undangan">Undangan</option>
                <option value="Ditangguhkan">Ditangguhkan</option>
              </select>
            }
            actions={
              <Button size="sm" onClick={() => (window.location.href = '/school/guru/undang')}>
                Undang guru
              </Button>
            }
          />
          <AdminDataTable
            rows={teachers}
            emptyLabel="Tidak ada guru yang cocok dengan filter."
            columns={[
              {
                key: 'name',
                header: 'Guru',
                render: (row) => (
                  <div>
                    <div className="font-semibold">{row.name}</div>
                    <div className="text-caption text-brand-ink-muted">{row.email}</div>
                  </div>
                ),
              },
              { key: 'role', header: 'Peran', render: (row) => row.role },
              {
                key: 'status',
                header: 'Status',
                render: (row) => <AdminBadge tone={teacherTone(row.status)} label={row.status} />,
              },
              { key: 'last', header: 'Aktif terakhir', render: (row) => row.lastActive },
              { key: 'final', header: 'Lembar final', render: (row) => row.sheetsFinal },
            ]}
            rowActions={(row) => (
              <>
                <Button size="sm" variant="secondary" onClick={() => setMessage(`Peran diubah (mock): ${row.name}`)}>
                  Ubah peran
                </Button>
                <Button
                  size="sm"
                  variant={row.status === 'Ditangguhkan' ? 'primary' : 'danger'}
                  onClick={() =>
                    setMessage(
                      row.status === 'Ditangguhkan'
                        ? `Diaktifkan kembali (mock): ${row.name}`
                        : `Ditangguhkan (mock): ${row.name}`,
                    )
                  }
                >
                  {row.status === 'Ditangguhkan' ? 'Aktifkan' : 'Tangguhkan'}
                </Button>
              </>
            )}
          />
        </>
      ) : null}

      {current === 'guru/undang' ? (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <form
            className="space-y-3 rounded-[var(--radius-lg)] border border-brand-line/80 bg-brand-surface-raised p-5 shadow-[var(--shadow-sm)]"
            onSubmit={(e) => {
              e.preventDefault();
              setMessage(`Undangan mock dikirim ke ${inviteEmail || 'email kosong'}`);
              setInviteEmail('');
              setInviteNote('');
            }}
          >
            <h2 className="text-h3 font-semibold">Undang guru baru</h2>
            <p className="text-body-sm text-brand-ink-muted">
              Undangan mock memakai token `/undangan/demo-aktif`. Tidak mengirim email sungguhan.
            </p>
            <label className="flex flex-col gap-1">
              <span className="text-label-semibold">Email guru</span>
              <input
                required
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="min-h-[var(--control-md)] rounded-md border border-brand-line px-3"
                placeholder="guru@sekolah.sch.id"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-label-semibold">Catatan internal</span>
              <textarea
                value={inviteNote}
                onChange={(e) => setInviteNote(e.target.value)}
                className="min-h-24 rounded-md border border-brand-line px-3 py-2"
                placeholder="Kelas / mapel opsional"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="submit">Kirim undangan</Button>
              <Button type="button" variant="secondary" onClick={() => (window.location.href = '/school/guru')}>
                Kembali ke tabel guru
              </Button>
            </div>
          </form>
          <div className="rounded-[var(--radius-lg)] border border-brand-line/80 bg-brand-surface-raised p-5 shadow-[var(--shadow-sm)]">
            <h3 className="font-semibold">Antrian undangan</h3>
            <AdminDataTable
              rows={TEACHERS.filter((t) => t.status === 'Undangan')}
              columns={[
                { key: 'name', header: 'Nama', render: (row) => row.name },
                { key: 'email', header: 'Email', render: (row) => row.email },
              ]}
              rowActions={(row) => (
                <Button size="sm" variant="secondary" onClick={() => setMessage(`Undangan dikirim ulang: ${row.email}`)}>
                  Kirim ulang
                </Button>
              )}
            />
          </div>
        </div>
      ) : null}

      {current === 'penggunaan' ? (
        <>
          <AdminStatCards
            items={[
              { label: 'Generate', value: '312', tone: 'info' },
              { label: 'Finalisasi', value: '148', tone: 'ok' },
              { label: 'Share aktif', value: '17', tone: 'warn' },
              { label: 'Rata-rata final/guru', value: '6.2', tone: 'neutral' },
            ]}
          />
          <AdminToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Cari guru" />
          <AdminDataTable
            rows={usageRows}
            columns={[
              { key: 'teacher', header: 'Guru', render: (row) => row.teacher },
              { key: 'gen', header: 'Generate', render: (row) => row.generated },
              { key: 'fin', header: 'Final', render: (row) => row.finalized },
              { key: 'share', header: 'Share', render: (row) => row.shared },
              { key: 'period', header: 'Periode', render: (row) => row.period },
            ]}
          />
        </>
      ) : null}

      {current === 'pengaturan' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 rounded-[var(--radius-lg)] border border-brand-line/80 bg-brand-surface-raised p-5 shadow-[var(--shadow-sm)]">
            <h2 className="text-h3 font-semibold">Identitas sekolah</h2>
            <label className="flex flex-col gap-1">
              <span className="text-label-semibold">Nama tampilan</span>
              <input defaultValue="SDN Contoh 01" className="min-h-[var(--control-md)] rounded-md border border-brand-line px-3" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-label-semibold">Domain undangan</span>
              <input defaultValue="sdncontoh.sch.id" className="min-h-[var(--control-md)] rounded-md border border-brand-line px-3" />
            </label>
            <Button onClick={() => setMessage('Pengaturan sekolah disimpan (mock).')}>Simpan</Button>
          </div>
          <div className="space-y-3 rounded-[var(--radius-lg)] border border-brand-line/80 bg-brand-surface-raised p-5 shadow-[var(--shadow-sm)]">
            <h2 className="text-h3 font-semibold">Branding</h2>
            <div className="rounded-md border border-dashed border-brand-line px-4 py-8 text-center text-body-sm text-brand-ink-muted">
              Logo sekolah belum diunggah
            </div>
            <Button variant="secondary" onClick={() => setMessage('Upload logo mock diterima.')}>
              Unggah logo
            </Button>
          </div>
        </div>
      ) : null}

      {current === 'library' ? (
        <>
          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari template / bank internal"
            actions={<Button size="sm" variant="secondary" onClick={() => setMessage('Buat item library mock.')}>Tambah item</Button>}
          />
          <AdminDataTable
            rows={libraryRows}
            columns={[
              { key: 'name', header: 'Nama', render: (row) => row.name },
              { key: 'kind', header: 'Jenis', render: (row) => row.kind },
              { key: 'owner', header: 'Pemilik', render: (row) => row.owner },
              {
                key: 'vis',
                header: 'Visibilitas',
                render: (row) => (
                  <AdminBadge tone={row.visibility === 'Internal' ? 'ok' : 'neutral'} label={row.visibility} />
                ),
              },
              { key: 'updated', header: 'Diperbarui', render: (row) => row.updatedAt },
            ]}
            rowActions={(row) => (
              <Button size="sm" variant="secondary" onClick={() => setMessage(`Buka ${row.name}`)}>
                Kelola
              </Button>
            )}
          />
        </>
      ) : null}

      {current === 'audit' ? (
        <>
          <AdminToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Cari actor/aksi/target" />
          <AdminDataTable
            rows={auditRows}
            columns={[
              { key: 'at', header: 'Waktu', render: (row) => row.at },
              { key: 'actor', header: 'Aktor', render: (row) => row.actor },
              { key: 'action', header: 'Aksi', render: (row) => row.action },
              { key: 'target', header: 'Target', render: (row) => row.target },
            ]}
          />
        </>
      ) : null}
    </AdminShell>
  );
}
