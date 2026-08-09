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
  AdminConfirmModal,
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
  type SchoolNotification,
  type SchoolNotificationsResult,
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

function safeText(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return '—';
  }
}

function neutralMetadataLabel(value: string): string {
  return value.toLowerCase() === 'unknown' ? 'Belum tersedia' : value;
}

function notificationStatusLabel(status: string): string {
  if (status === 'pending') return 'Menunggu';
  if (status === 'delivered') return 'Terkirim';
  if (status === 'failed') return 'Gagal';
  return status;
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

  if (!dashboard) {
    return (
      <div className="text-sm text-neutral-400 py-8 text-center">
        Data ringkasan tidak tersedia
      </div>
    );
  }

  const activeMembers = dashboard.members.filter((m) => m.state === 'active').length;
  const quotaLimit = dashboard.usage.monthlyLimit;
  const quotaUsed = dashboard.usage.generationsUsedThisMonth;
  const pct = quotaLimit && quotaLimit > 0 ? Math.round((quotaUsed / quotaLimit) * 100) : 0;
  const schoolHint = [dashboard.usage.plan, dashboard.workspace.level]
    .filter(Boolean)
    .map(neutralMetadataLabel)
    .join(' · ');

  return (
    <AdminStatCards
      items={[
        {
          label: 'Anggota aktif',
          value: String(activeMembers),
          hint: `dari ${dashboard.memberCount} total`,
          tone: 'ok',
        },
        {
          label: 'Kuota terpakai',
          value: `${quotaUsed} / ${quotaLimit ?? '∞'}`,
          hint: `${pct}% periode ini`,
          tone: pct >= 90 ? 'bad' : pct >= 70 ? 'warn' : 'info',
          delta: `${pct}%`,
        },
        {
          label: 'Sekolah',
          value: dashboard.workspace.name || '—',
          hint: schoolHint,
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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMembers = useCallback(
    (q: string, role: string, pg: number) => {
      setLoading(true);
      setFetchError(null);
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
            setFetchError(res.error.safeMessage);
          }
          setLoading(false);
        });
    },
    [],
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
      setToast(`${member.name ?? member.email} ditangguhkan`);
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
      setToast(`${member.name ?? member.email} diaktifkan kembali`);
      fetchMembers(search, filter, page);
    } else {
      setToast(`Gagal mengaktifkan: ${res.error.safeMessage}`);
    }
    setActionId(null);
  }

  const [confirmRemoveMember, setConfirmRemoveMember] = useState<SchoolMember | null>(null);

  async function handleRemove(member: SchoolMember) {
    setActionId(member.id);
    const res = await schoolService.removeMember(member.id);
    if (res.ok) {
      setToast(`${member.name ?? member.email} dihapus`);
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
        <div
          role="status"
          aria-label="Memuat daftar anggota sekolah"
          aria-busy="true"
          className="space-y-3 rounded-2xl border border-[#ddd4c8]/70 bg-white p-4"
        >
          <AdminContentLoading label="Memuat daftar anggota sekolah…" />
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex animate-pulse items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#f0ebe3]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-[#f0ebe3]" />
                <div className="h-2 w-1/4 rounded bg-[#f0ebe3]" />
              </div>
            </div>
          ))}
        </div>
      ) : fetchError ? (
        <div
          role="alert"
          aria-label="Gagal memuat anggota sekolah"
          className="rounded-xl border border-brand-danger/30 bg-brand-danger-soft px-6 py-5 text-sm text-brand-danger"
        >
          <p className="font-semibold text-[#171717]">Gagal memuat anggota sekolah</p>
          <p className="mt-1 text-[13px]">{fetchError}</p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-3"
            onClick={() => fetchMembers(search, filter, page)}
          >
            Coba lagi
          </Button>
        </div>
      ) : members.length === 0 ? (
        <div
          role="status"
          aria-label="Belum ada anggota sekolah"
          className="rounded-xl border border-dashed border-[#ddd4c8] bg-white px-6 py-14 text-center"
        >
          <p className="text-[13px] font-semibold text-[#171717]">
            Belum ada anggota sekolah
          </p>
          <p className="mx-auto mt-1 max-w-md text-[12px] text-[#57534e]">
            Undang guru pertama agar mereka bisa mulai memakai workspace sekolah.
          </p>
        </div>
      ) : (
        <AdminDataTable
          rows={members}
          footerNote=""
          columns={[
            {
              key: 'name',
              header: 'Anggota',
              render: (row) => (
                <div className="flex items-center gap-3">
                  <AdminAvatar name={row.name ?? row.email} />
                  <div>
                    <div className="font-medium text-sm">{row.name ?? row.email}</div>
                    {row.name && row.name !== row.email ? (
                      <div className="text-xs text-neutral-400">{row.email}</div>
                    ) : null}
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
                    onClick={() => setConfirmRemoveMember(row)}
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
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹ Sebelumnya
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={meta.page >= meta.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya ›
            </Button>
          </div>
        </div>
      )}

      <AdminConfirmModal
        open={!!confirmRemoveMember}
        title="Hapus Anggota Sekolah"
        description={`Apakah Anda yakin ingin menghapus ${confirmRemoveMember?.name ?? confirmRemoveMember?.email} dari sekolah ini?`}
        confirmLabel="Ya, Hapus Anggota"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={() => {
          if (!confirmRemoveMember) return;
          const member = confirmRemoveMember;
          setConfirmRemoveMember(null);
          handleRemove(member);
        }}
        onCancel={() => setConfirmRemoveMember(null)}
      />
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
      setToast(`Undangan dikirim ke ${res.value.email}`);
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

  const unlimited = usage.quotaLimit === 0;
  const pct = unlimited ? 0 : Math.round((usage.quotaUsed / usage.quotaLimit) * 100);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Kuota terpakai</span>
          <span className="text-neutral-500">
            {usage.quotaUsed} / {unlimited ? 'Tidak terbatas' : `${usage.quotaLimit} (${pct}%)`}
          </span>
        </div>
        {!unlimited && <div
          role="progressbar"
          aria-label="Kuota terpakai"
          aria-valuemin={0}
          aria-valuemax={usage.quotaLimit}
          aria-valuenow={Math.min(usage.quotaUsed, usage.quotaLimit)}
          className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800"
        >
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
        </div>}
      </div>

      {usage.breakdown.length > 0 && (
        <AdminDataTable
          rows={usage.breakdown.map((b) => ({ ...b, id: b.userId }))}
          footerNote=""
          emptyLabel="Tidak ada data"
          columns={[
            {
              key: 'name',
              header: 'Guru',
              render: (row) => (
                <div className="flex items-center gap-3">
                  <AdminAvatar name={row.name ?? row.email} />
                  <div>
                    <div className="font-medium text-sm">{row.name ?? row.email}</div>
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
          <div>Level: {neutralMetadataLabel(settings.level)}</div>
          <div>Paket: {neutralMetadataLabel(settings.plan)}</div>
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

// ── Section: Billing ──────────────────────────────────────────────────────────

function SectionBilling() {
  const [billing, setBilling] = useState<import('@/src/services/school/schoolService').SchoolBilling | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    schoolService.billing().then((res) => {
      if (cancelled) return;
      if (res.ok) setBilling(res.value);
      else setError(res.error.safeMessage);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <AdminContentLoading />;
  if (error || !billing) {
    return (
      <div role="alert" className="rounded-xl border border-brand-danger/30 bg-brand-danger-soft px-6 py-5 text-sm text-brand-danger">
        <p className="font-semibold text-[#171717]">Gagal memuat billing sekolah</p>
        <p className="mt-1">{error ?? 'Data billing tidak tersedia.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[18px] font-bold text-[#171717]">Langganan & Tagihan Sekolah</h2>
        <p className="mt-0.5 text-[13px] text-[#6d665d]">Ringkasan paket aktual dari layanan billing.</p>
      </div>
      <AdminStatCards items={[
        { label: 'Paket', value: billing.plan, tone: 'neutral' },
        { label: 'Lisensi Guru', value: `${billing.seatCount} Guru`, hint: 'Anggota aktif', tone: 'info' },
        { label: 'Penggunaan Bulan Ini', value: `${billing.generationsUsedThisMonth} / ${billing.monthlyLimit ?? 'Tidak terbatas'}`, tone: 'neutral' },
        { label: 'Mulai Siklus Billing', value: fmtDate(billing.billingCycleStartedAt), hint: 'Tanggal mulai siklus, bukan tanggal perpanjangan', tone: 'neutral' },
      ]} />
      <div role="status" className="rounded-xl border border-[#ddd4c8] bg-white px-5 py-4 text-sm text-[#57534e]">
        Riwayat dan unduhan faktur belum tersedia.
      </div>
    </div>
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
              render: (row) => fmtDate(row.at),
            },
            {
              key: 'actorEmail',
              header: 'Aktor',
              render: (row) => row.actor,
            },
            {
              key: 'action',
              header: 'Aksi',
              render: (row) => row.action,
            },
            {
              key: 'target',
              header: 'Target',
              render: (row) => safeText(row.target),
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
  const [confirmCancelInv, setConfirmCancelInv] = useState<SchoolInvitation | null>(null);

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
    <>
      <AdminDataTable
        rows={invitations}
        emptyLabel="Tidak ada undangan menunggu"
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
                  onClick={() => setConfirmCancelInv(row)}
                >
                  {cancelId === row.id ? 'Membatalkan…' : 'Batalkan'}
                </Button>
              </div>
            ),
          },
        ]}
      />

      <AdminConfirmModal
        open={!!confirmCancelInv}
        title="Batalkan Undangan"
        description={`Apakah Anda yakin ingin membatalkan undangan ke ${confirmCancelInv?.email}?`}
        confirmLabel="Ya, Batalkan Undangan"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={() => {
          if (!confirmCancelInv) return;
          const inv = confirmCancelInv;
          setConfirmCancelInv(null);
          handleCancel(inv);
        }}
        onCancel={() => setConfirmCancelInv(null)}
      />
    </>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

// ── Section: Notifikasi ───────────────────────────────────────────────────────

function SectionNotifikasi({ setToast }: { setToast: (msg: string) => void }) {
  const [data, setData] = useState<SchoolNotification[]>([]);
  const [meta, setMeta] = useState<SchoolNotificationsResult['meta'] | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchNotifications = useCallback((pg: number, status: string) => {
    setLoading(true);
    schoolService.notifications({ page: pg, limit: 20, status: status || undefined }).then((res) => {
      if (res.ok) {
        setData(res.value.data ?? []);
        setMeta(res.value.meta ?? null);
      } else {
        setToast(`Gagal memuat notifikasi: ${res.error.safeMessage}`);
      }
      setLoading(false);
    });
  }, [setToast]);

  useEffect(() => {
    fetchNotifications(page, filterStatus);
  }, [fetchNotifications, page, filterStatus]);

  function notifTone(status: string): 'ok' | 'warn' | 'bad' | 'neutral' {
    if (status === 'delivered') return 'ok';
    if (status === 'pending') return 'neutral';
    return 'bad';
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-3">
        {(['', 'pending', 'delivered', 'failed'] as const).map((s) => (
          <button
            key={s || 'all'}
            onClick={() => { setFilterStatus(s); setPage(1); }}
            className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors ${
              filterStatus === s
                ? 'bg-[#171717] text-white border-[#171717]'
                : 'bg-white text-[#6d665d] border-[#ddd4c8] hover:bg-[#faf8f5]'
            }`}
          >
            {s ? notificationStatusLabel(s) : 'Semua'}
          </button>
        ))}
        <button
          onClick={() => fetchNotifications(page, filterStatus)}
          className="px-3 py-1 rounded-full text-[12px] font-medium border border-[#ddd4c8] bg-white text-[#6d665d] hover:bg-[#faf8f5] ml-auto"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <AdminContentLoading />
      ) : data.length === 0 ? (
        <div className="rounded-2xl border border-[#ddd4c8]/60 bg-[#faf8f5] p-8 text-center text-[13px] text-[#6d665d]">
          Belum ada notifikasi.
        </div>
      ) : (
        <AdminDataTable
          rows={data}
          emptyLabel="Tidak ada notifikasi."
          columns={[
            {
              key: 'type',
              header: 'Tipe',
              render: (row) => <span className="font-mono text-[11px]">{row.type}</span>,
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => <AdminPill tone={notifTone(row.status)}>{notificationStatusLabel(row.status)}</AdminPill>,
            },
            {
              key: 'attempt',
              header: 'Attempt',
              render: (row) => <span className="tabular-nums text-[12px]">{row.attemptCount}</span>,
            },
            {
              key: 'error',
              header: 'Error',
              render: (row) => (
                <span className="text-[11px] text-[#c9703a] truncate max-w-[200px] block">
                  {row.lastError ?? '—'}
                </span>
              ),
            },
            {
              key: 'created',
              header: 'Dibuat',
              render: (row) => <span className="text-[11px] text-[#6d665d]">{row.createdAt ?? '—'}</span>,
            },
          ]}
        />
      )}

      {meta && meta.pages > 1 ? (
        <div className="flex items-center justify-between pt-2 text-sm">
          <span className="text-neutral-500">
            {meta.total} notifikasi · halaman {meta.page} / {meta.pages}
          </span>
          <div className="flex gap-1">
            <button
              aria-label="Halaman notifikasi sebelumnya"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded-lg border border-[#ddd4c8] text-[12px] disabled:opacity-40"
            >
              ‹
            </button>
            <button
              aria-label="Halaman notifikasi berikutnya"
              disabled={page >= meta.pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg border border-[#ddd4c8] text-[12px] disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

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

      {current === 'billing' ? (
        <SectionBilling />
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

      {current === 'notifikasi' ? (
        <SectionNotifikasi setToast={setToast} />
      ) : null}

      {![
        '', 'guru', 'undang', 'undangan', 'penggunaan', 'billing', 'pengaturan',
        'library', 'audit', 'notifikasi',
      ].includes(current) ? (
        <div role="alert" className="rounded-xl border border-[#ddd4c8] bg-white px-6 py-8 text-center">
          Halaman tidak ditemukan.
        </div>
      ) : null}
    </div>
  );
}
