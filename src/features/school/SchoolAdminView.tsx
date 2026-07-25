'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/app/components/ui';
import {
  AdminAvatar,
  AdminContentLoading,
  AdminDataTable,
  AdminFilterChip,
  AdminPill,
  AdminStatCards,
  AdminToolbar,
} from '@/src/features/admin/AdminChrome';
import { useAdminSectionState } from '@/src/features/admin/adminPanelState';
import {
  schoolService,
  type SchoolMember,
  type SchoolMembersResult,
  type SchoolUsage,
  type SchoolSettings,
  type SchoolLibraryItem,
  type SchoolLibraryResult,
  type SchoolAuditRow,
  type SchoolAuditResult,
  type SchoolInvitation,
  type SchoolDashboard,
} from '@/src/services/school/schoolService';

// ── helpers ───────────────────────────────────────────────────────────────────

function memberRoleLabel(role: SchoolMember['role']): string {
  if (role === 'school_admin') return 'Admin sekolah';
  return 'Guru';
}

function memberStateTone(
  state: SchoolMember['state'],
): 'ok' | 'warn' | 'bad' | 'neutral' {
  if (state === 'active') return 'ok';
  if (state === 'suspended') return 'bad';
  return 'neutral';
}

function memberStateLabel(state: SchoolMember['state']): string {
  if (state === 'active') return 'Aktif';
  if (state === 'suspended') return 'Ditangguhkan';
  return 'Dicabut';
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

// ── Section: Ringkasan ────────────────────────────────────────────────────────

function SectionRingkasan({
  setToast,
}: {
  setToast: (msg: string) => void;
}) {
  const [dashboard, setDashboard] = useState<SchoolDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    schoolService.dashboard().then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setDashboard(res.value);
      } else {
        setToast(`Gagal memuat ringkasan: ${res.error.safeMessage}`);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [setToast]);

  if (loading) return <AdminContentLoading />;

  const pct =
    dashboard && dashboard.stats.quotaLimit > 0
      ? Math.round(
          (dashboard.stats.quotaUsed / dashboard.stats.quotaLimit) * 100,
        )
      : 0;

  return (
    <AdminStatCards
      items={[
        {
          label: 'Anggota aktif',
          value: String(dashboard?.stats.activeMembers ?? '—'),
          hint: `dari ${dashboard?.stats.totalMembers ?? 0} total`,
          tone: 'ok',
        },
        {
          label: 'Kuota terpakai',
          value: `${dashboard?.stats.quotaUsed ?? 0} / ${dashboard?.stats.quotaLimit ?? 0}`,
          hint: `${pct}% periode ini`,
          tone: pct >= 90 ? 'bad' : pct >= 70 ? 'warn' : 'info',
          delta: `${pct}%`,
        },
        {
          label: 'Lembar final',
          value: String(dashboard?.stats.totalAssessments ?? '—'),
          hint: 'total workspace',
          tone: 'ok',
        },
        {
          label: 'Sekolah',
          value: dashboard?.workspace.name ?? '—',
          hint: `${dashboard?.workspace.plan ?? ''} · ${dashboard?.workspace.level ?? ''}`,
          tone: 'neutral',
        },
      ]}
    />
  );
}

// ── Section: Guru (members) ───────────────────────────────────────────────────

function SectionGuru({
  search,
  filter,
  setSearch,
  setFilter,
  setToast,
}: {
  search: string;
  filter: string;
  setSearch: (v: string) => void;
  setFilter: (v: string) => void;
  setToast: (msg: string) => void;
}) {
  const [members, setMembers] = useState<SchoolMember[]>([]);
  const [meta, setMeta] = useState<SchoolMembersResult['meta'] | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMembers = useCallback(
    (q: string, role: string, pg: number) => {
      setLoading(true);
      schoolService
        .members({
          q: q || undefined,
          role:
            role !== 'all'
              ? (role as 'teacher' | 'school_admin')
              : undefined,
          page: pg,
          limit: 20,
        })
        .then((res) => {
          if (res.ok) {
            // service wraps paginated responses as { data, meta }
            const result = res.value as unknown as SchoolMembersResult;
            setMembers(result.data ?? []);
            setMeta(result.meta ?? null);
          } else {
            setToast(`Gagal memuat anggota: ${res.error.safeMessage}`);
          }
          setLoading(false);
        });
    },
    [setToast],
  );

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => fetchMembers(search, filter, page),
      300,
    );
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, filter, page, fetchMembers]);

  async function handleSuspend(member: SchoolMember) {
    setActionId(member.id);
    const res = await schoolService.memberSuspend(member.id);
    if (res.ok) {
      setToast(`${member.name} ditangguhkan`);
      fetchMembers(search, filter, page);
    } else {
      setToast(`Gagal menangguhkan: ${res.error.safeMessage}`);
    }
    setActionId(null);
  }

  async function handleUnsuspend(member: SchoolMember) {
    setActionId(member.id);
    const res = await schoolService.memberUnsuspend(member.id);
    if (res.ok) {
      setToast(`${member.name} diaktifkan kembali`);
      fetchMembers(search, filter, page);
    } else {
      setToast(`Gagal mengaktifkan: ${res.error.safeMessage}`);
    }
    setActionId(null);
  }

  async function handleRemove(member: SchoolMember) {
    if (!confirm(`Hapus ${member.name} dari sekolah ini?`)) return;
    setActionId(member.id);
    const res = await schoolService.removeMember(member.id);
    if (res.ok) {
      setToast(`${member.name} dihapus`);
      fetchMembers(search, filter, page);
    } else {
      setToast(`Gagal menghapus: ${res.error.safeMessage}`);
    }
    setActionId(null);
  }

  const roleFilters = [
    { value: 'all', label: 'Semua' },
    { value: 'teacher', label: 'Guru' },
    { value: 'school_admin', label: 'Admin' },
  ] as const;

  return (
    <>
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama / email…"
        filters={
          <>
            {roleFilters.map(({ value, label }) => (
              <AdminFilterChip
                key={value}
                active={filter === value}
                onClick={() => setFilter(value)}
              >
                {label}
              </AdminFilterChip>
            ))}
          </>
        }
      />
      {loading ? (
        <AdminContentLoading />
      ) : (
        <AdminDataTable
          rows={members}
          emptyLabel="Tidak ada anggota"
          columns={[
            {
              key: 'name',
              header: 'Anggota',
              render: (row) => (
                <div className="flex items-center gap-3">
                  <AdminAvatar name={row.name} />
                  <div>
                    <div className="font-medium text-sm">{row.name}</div>
                    <div className="text-xs text-neutral-400">{row.email}</div>
                  </div>
                </div>
              ),
            },
            {
              key: 'role',
              header: 'Peran',
              render: (row) => (
                <AdminPill tone="neutral">{memberRoleLabel(row.role)}</AdminPill>
              ),
            },
            {
              key: 'state',
              header: 'Status',
              render: (row) => (
                <AdminPill tone={memberStateTone(row.state)}>
                  {memberStateLabel(row.state)}
                </AdminPill>
              ),
            },
            {
              key: 'lastActiveAt',
              header: 'Aktif terakhir',
              render: (row) => fmtDate(row.lastActiveAt),
            },
            {
              key: 'actions',
              header: '',
              render: (row) => (
                <div className="flex gap-2 justify-end">
                  {row.state === 'active' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={actionId === row.id}
                      onClick={() => handleSuspend(row)}
                    >
                      Tangguhkan
                    </Button>
                  ) : row.state === 'suspended' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={actionId === row.id}
                      onClick={() => handleUnsuspend(row)}
                    >
                      Aktifkan
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={actionId === row.id}
                    onClick={() => handleRemove(row)}
                  >
                    Hapus
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}
      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-between pt-2 text-sm">
          <span className="text-neutral-500">
            {meta.total} anggota · halaman {meta.page} / {meta.pages}
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹ Sebelumnya
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= meta.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya ›
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Section: Undang ───────────────────────────────────────────────────────────

function SectionUndang({ setToast }: { setToast: (msg: string) => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'teacher' | 'school_admin'>('teacher');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setLoading(true);
    const res = await schoolService.inviteMember({ email: trimmed, role });
    if (res.ok) {
      setToast(`Undangan dikirim ke ${trimmed}`);
      setEmail('');
    } else {
      setToast(`Gagal mengirim undangan: ${res.error.safeMessage}`);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label
          className="block text-sm font-medium mb-1"
          htmlFor="invite-email"
        >
          Email
        </label>
        <input
          id="invite-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="guru@sekolah.sch.id"
          className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1"
          htmlFor="invite-role"
        >
          Peran
        </label>
        <select
          id="invite-role"
          value={role}
          onChange={(e) =>
            setRole(e.target.value as 'teacher' | 'school_admin')
          }
          className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
        >
          <option value="teacher">Guru</option>
          <option value="school_admin">Admin sekolah</option>
        </select>
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? 'Mengirim…' : 'Kirim undangan'}
      </Button>
    </form>
  );
}

// ── Section: Penggunaan ───────────────────────────────────────────────────────

function SectionPenggunaan({
  setToast,
}: {
  setToast: (msg: string) => void;
}) {
  const [usage, setUsage] = useState<SchoolUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    schoolService.usage().then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setUsage(res.value);
      } else {
        setToast(`Gagal memuat penggunaan: ${res.error.safeMessage}`);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [setToast]);

  if (loading) return <AdminContentLoading />;

  if (!usage) {
    return (
      <div className="text-sm text-neutral-400 py-8 text-center">
        Data tidak tersedia
      </div>
    );
  }

  const pct = Math.round(
    (usage.quotaUsed / Math.max(usage.quotaLimit, 1)) * 100,
  );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Kuota terpakai</span>
          <span className="text-neutral-500">
            {usage.quotaUsed} / {usage.quotaLimit} ({pct}%)
          </span>
        </div>
        <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            className={`h-2 rounded-full transition-all ${
              pct >= 90
                ? 'bg-red-500'
                : pct >= 70
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>

      {usage.breakdown.length > 0 && (
        <AdminDataTable
          rows={usage.breakdown.map((b) => ({ ...b, id: b.userId }))}
          emptyLabel="Tidak ada data"
          columns={[
            {
              key: 'name',
              header: 'Guru',
              render: (row) => (
                <div className="flex items-center gap-3">
                  <AdminAvatar name={row.name} />
                  <div>
                    <div className="font-medium text-sm">{row.name}</div>
                    <div className="text-xs text-neutral-400">{row.email}</div>
                  </div>
                </div>
              ),
            },
            {
              key: 'used',
              header: 'Kuota dipakai',
              render: (row) => String(row.used),
            },
          ]}
        />
      )}

      {usage.trend.length > 0 && (
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
          <div className="text-sm font-medium mb-3">Tren bulanan</div>
          <div className="space-y-2">
            {usage.trend.map((t) => (
              <div key={t.month} className="flex justify-between text-sm">
                <span className="text-neutral-500">{t.month}</span>
                <span className="font-medium">{t.used}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section: Pengaturan ───────────────────────────────────────────────────────

function SectionPengaturan({
  setToast,
}: {
  setToast: (msg: string) => void;
}) {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    schoolService.settings().then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setSettings(res.value);
        setName(res.value.name);
      } else {
        setToast(`Gagal memuat pengaturan: ${res.error.safeMessage}`);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [setToast]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    const res = await schoolService.updateSettings({ name: trimmed });
    if (res.ok) {
      setToast('Pengaturan disimpan');
      setSettings((prev) => (prev ? { ...prev, name: trimmed } : prev));
    } else {
      setToast(`Gagal menyimpan: ${res.error.safeMessage}`);
    }
    setSaving(false);
  }

  if (loading) return <AdminContentLoading />;

  return (
    <form onSubmit={handleSave} className="max-w-md space-y-4">
      <div>
        <label
          className="block text-sm font-medium mb-1"
          htmlFor="settings-name"
        >
          Nama sekolah
        </label>
        <input
          id="settings-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
        />
      </div>
      {settings && (
        <div className="text-xs text-neutral-400 space-y-1">
          <div>
            Slug: <span className="font-mono">{settings.slug}</span>
          </div>
          <div>Level: {settings.level}</div>
          <div>Paket: {settings.plan}</div>
          <div>Kursi: {settings.seats}</div>
          {settings.renewsAt && (
            <div>Perpanjang: {fmtDate(settings.renewsAt)}</div>
          )}
        </div>
      )}
      <Button type="submit" size="sm" disabled={saving}>
        {saving ? 'Menyimpan…' : 'Simpan pengaturan'}
      </Button>
    </form>
  );
}

// ── Section: Library ──────────────────────────────────────────────────────────

function SectionLibrary({
  search,
  setSearch,
  setToast,
}: {
  search: string;
  setSearch: (v: string) => void;
  setToast: (msg: string) => void;
}) {
  const [items, setItems] = useState<SchoolLibraryItem[]>([]);
  const [meta, setMeta] = useState<SchoolLibraryResult['meta'] | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setPage(1); }, [search]);

  const fetchLibrary = useCallback(
    (q: string, pg: number) => {
      setLoading(true);
      schoolService.library({ q: q || undefined, page: pg, limit: 20 }).then((res) => {
        if (res.ok) {
          // service wraps paginated responses as { data, meta }
          const result = res.value as unknown as SchoolLibraryResult;
          setItems(result.data ?? []);
          setMeta(result.meta ?? null);
        } else {
          setToast(`Gagal memuat library: ${res.error.safeMessage}`);
        }
        setLoading(false);
      });
    },
    [setToast],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchLibrary(search, page), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, page, fetchLibrary]);

  return (
    <>
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari judul / mapel / penulis…"
      />
      {loading ? (
        <AdminContentLoading />
      ) : (
        <AdminDataTable
          rows={items}
          emptyLabel="Tidak ada asesmen di library"
          columns={[
            {
              key: 'title',
              header: 'Judul',
              render: (row) => (
                <div>
                  <div className="font-medium text-sm">{row.title}</div>
                  <div className="text-xs text-neutral-400">
                    {[row.subject, row.grade].filter(Boolean).join(' · ')}
                  </div>
                </div>
              ),
            },
            {
              key: 'authorName',
              header: 'Penulis',
              render: (row) => (
                <div className="flex items-center gap-2">
                  <AdminAvatar name={row.authorName} />
                  <span className="text-sm">{row.authorName}</span>
                </div>
              ),
            },
            {
              key: 'questionCount',
              header: 'Soal',
              render: (row) => String(row.questionCount),
            },
            {
              key: 'updatedAt',
              header: 'Diperbarui',
              render: (row) => fmtDate(row.updatedAt),
            },
          ]}
        />
      )}
      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-between pt-2 text-sm">
          <span className="text-neutral-500">
            {meta.total} item · halaman {meta.page} / {meta.pages}
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹ Sebelumnya
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= meta.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya ›
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Section: Audit ────────────────────────────────────────────────────────────

function SectionAudit({
  search,
  setSearch,
  setToast,
}: {
  search: string;
  setSearch: (v: string) => void;
  setToast: (msg: string) => void;
}) {
  const [rows, setRows] = useState<SchoolAuditRow[]>([]);
  const [meta, setMeta] = useState<SchoolAuditResult['meta'] | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setPage(1); }, [search]);

  const fetchAudit = useCallback(
    (q: string, pg: number) => {
      setLoading(true);
      schoolService.audit({ q: q || undefined, page: pg, limit: 20 }).then((res) => {
        if (res.ok) {
          // service wraps paginated responses as { data, meta }
          const result = res.value as unknown as SchoolAuditResult;
          setRows(result.data ?? []);
          setMeta(result.meta ?? null);
        } else {
          setToast(`Gagal memuat audit: ${res.error.safeMessage}`);
        }
        setLoading(false);
      });
    },
    [setToast],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchAudit(search, page), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, page, fetchAudit]);

  return (
    <>
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari aktor / aksi / target…"
      />
      {loading ? (
        <AdminContentLoading />
      ) : (
        <AdminDataTable
          rows={rows}
          emptyLabel="Tidak ada log audit"
          columns={[
            {
              key: 'createdAt',
              header: 'Waktu',
              render: (row) => fmtDate(row.createdAt),
            },
            {
              key: 'actorEmail',
              header: 'Aktor',
              render: (row) => row.actorEmail,
            },
            {
              key: 'action',
              header: 'Aksi',
              render: (row) => row.action,
            },
            {
              key: 'targetType',
              header: 'Target',
              render: (row) =>
                row.targetType
                  ? `${row.targetType}${row.targetId ? ` #${row.targetId}` : ''}`
                  : '—',
            },
          ]}
        />
      )}
      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-between pt-2 text-sm">
          <span className="text-neutral-500">
            {meta.total} entri · halaman {meta.page} / {meta.pages}
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹ Sebelumnya
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= meta.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya ›
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Section: Undangan ────────────────────────────────────────────────────────

function SectionUndangan({ setToast }: { setToast: (msg: string) => void }) {
  const [invitations, setInvitations] = useState<SchoolInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);

  function fetchInvitations() {
    setLoading(true);
    schoolService.invitations().then((res) => {
      if (res.ok) {
        setInvitations(res.value);
      } else {
        setToast(`Gagal memuat undangan: ${res.error.safeMessage}`);
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    fetchInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCancel(inv: SchoolInvitation) {
    if (!confirm(`Batalkan undangan ke ${inv.email}?`)) return;
    setCancelId(inv.id);
    const res = await schoolService.cancelInvitation(inv.id);
    if (res.ok) {
      setToast(`Undangan ke ${inv.email} dibatalkan`);
      fetchInvitations();
    } else {
      setToast(`Gagal membatalkan: ${res.error.safeMessage}`);
    }
    setCancelId(null);
  }

  if (loading) return <AdminContentLoading />;

  return (
    <AdminDataTable
      rows={invitations}
      emptyLabel="Tidak ada undangan pending"
      columns={[
        {
          key: 'email',
          header: 'Email',
          render: (row) => (
            <div>
              <div className="font-medium text-sm">{row.email}</div>
              {row.invitedBy && (
                <div className="text-xs text-neutral-400">
                  Diundang oleh {row.invitedBy}
                </div>
              )}
            </div>
          ),
        },
        {
          key: 'role',
          header: 'Peran',
          render: (row) => (
            <AdminPill tone="neutral">
              {row.role === 'school_admin' ? 'Admin sekolah' : 'Guru'}
            </AdminPill>
          ),
        },
        {
          key: 'createdAt',
          header: 'Dikirim',
          render: (row) => fmtDate(row.createdAt),
        },
        {
          key: 'expiresAt',
          header: 'Kedaluwarsa',
          render: (row) => fmtDate(row.expiresAt),
        },
        {
          key: 'actions',
          header: '',
          render: (row) => (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="secondary"
                disabled={cancelId === row.id}
                onClick={() => handleCancel(row)}
              >
                {cancelId === row.id ? 'Membatalkan…' : 'Batalkan'}
              </Button>
            </div>
          ),
        },
      ]}
    />
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

export function SchoolAdminView({ section = '' }: { section?: string }) {
  const current = section || '';
  const { search, filter, setSearch, setFilter, setToast } =
    useAdminSectionState(current || 'ringkasan');

  return (
    <div className="space-y-4">
      {current === '' ? (
        <SectionRingkasan setToast={setToast} />
      ) : null}

      {current === 'guru' ? (
        <SectionGuru
          search={search}
          filter={filter || 'all'}
          setSearch={setSearch}
          setFilter={setFilter}
          setToast={setToast}
        />
      ) : null}

      {current === 'undang' ? (
        <SectionUndang setToast={setToast} />
      ) : null}

      {current === 'undangan' ? (
        <SectionUndangan setToast={setToast} />
      ) : null}

      {current === 'penggunaan' ? (
        <SectionPenggunaan setToast={setToast} />
      ) : null}

      {current === 'pengaturan' ? (
        <SectionPengaturan setToast={setToast} />
      ) : null}

      {current === 'library' ? (
        <SectionLibrary
          search={search}
          setSearch={setSearch}
          setToast={setToast}
        />
      ) : null}

      {current === 'audit' ? (
        <SectionAudit
          search={search}
          setSearch={setSearch}
          setToast={setToast}
        />
      ) : null}
    </div>
  );
}
