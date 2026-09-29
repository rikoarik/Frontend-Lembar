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
import { useTranslations } from 'next-intl';
import type { Translate } from '@/src/i18n/types';
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

function memberRoleLabel(t: Translate, role: SchoolMember['role'] | string | null): string {
  if (role === 'school_admin') return t('roles.schoolAdmin');
  return t('roles.teacher');
}

function memberStateTone(state: SchoolMember['state']): 'ok' | 'warn' | 'bad' | 'neutral' {
  if (state === 'active') return 'ok';
  if (state === 'suspended') return 'bad';
  return 'neutral';
}

function memberStateLabel(t: Translate, state: SchoolMember['state']): string {
  if (state === 'active') return t('memberState.active');
  if (state === 'suspended') return t('memberState.suspended');
  return t('memberState.revoked');
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

function neutralMetadataLabel(t: Translate, value: string): string {
  return value.toLowerCase() === 'unknown' ? t('unknownValue') : value;
}

function notificationStatusLabel(t: Translate, status: string): string {
  if (status === 'pending') return t('notificationStatus.pending');
  if (status === 'delivered') return t('notificationStatus.delivered');
  if (status === 'failed') return t('notificationStatus.failed');
  return status;
}

// ── Section: Ringkasan ────────────────────────────────────────────────────────

function SectionRingkasan({ setToast }: { setToast: (msg: string) => void }) {
  const t = useTranslations('school');
  const [dashboard, setDashboard] = useState<SchoolDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    schoolService.dashboard().then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setDashboard(res.value);
      } else {
        setToast(t('ringkasan.loadFailed', { message: res.error.safeMessage }));
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
      <div className="text-sm text-neutral-400 py-8 text-center">{t('ringkasan.unavailable')}</div>
    );
  }

  const activeMembers = dashboard.members.filter((m) => m.state === 'active').length;
  const quotaLimit = dashboard.usage.monthlyLimit;
  const quotaUsed = dashboard.usage.generationsUsedThisMonth;
  const pct = quotaLimit && quotaLimit > 0 ? Math.round((quotaUsed / quotaLimit) * 100) : 0;
  const schoolHint = [dashboard.usage.plan, dashboard.workspace.level]
    .filter(Boolean)
    .map((value) => neutralMetadataLabel(t, value))
    .join(' · ');

  return (
    <AdminStatCards
      items={[
        {
          label: t('ringkasan.activeMembers'),
          value: String(activeMembers),
          hint: t('ringkasan.membersFromTotal', { count: dashboard.memberCount }),
          tone: 'ok',
        },
        {
          label: t('ringkasan.quotaUsed'),
          value: t('ringkasan.quotaValue', {
            used: quotaUsed,
            limit: quotaLimit ?? t('ringkasan.quotaUnlimited'),
          }),
          hint: t('ringkasan.percentPeriod', { percent: pct }),
          tone: pct >= 90 ? 'bad' : pct >= 70 ? 'warn' : 'info',
          delta: `${pct}%`,
        },
        {
          label: t('ringkasan.school'),
          value: dashboard.workspace.name || t('common.emDash'),
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
  const t = useTranslations('school');
  const [members, setMembers] = useState<SchoolMember[]>([]);
  const [meta, setMeta] = useState<SchoolMembersResult['meta'] | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchMembers = useCallback((q: string, role: string, pg: number) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setFetchError(null);
    schoolService
      .members({
        q: q || undefined,
        role: role !== 'all' ? (role as 'teacher' | 'school_admin') : undefined,
        page: pg,
        limit: 20,
      })
      .then((res) => {
        if (requestId !== requestIdRef.current) return;
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
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchMembers(search, filter, page), 300);
    return () => {
      clearTimeout(timeoutId);
      requestIdRef.current += 1;
    };
  }, [search, filter, page, fetchMembers]);

  function handleSearchChange(value: string) {
    if (value === search) return;
    requestIdRef.current += 1;
    setLoading(true);
    setPage(1);
    setSearch(value);
  }

  function handleFilterChange(value: string) {
    if (value === filter) return;
    requestIdRef.current += 1;
    setLoading(true);
    setPage(1);
    setFilter(value);
  }

  function handlePageChange(updater: (currentPage: number) => number) {
    requestIdRef.current += 1;
    setLoading(true);
    setPage(updater);
  }

  async function handleSuspend(member: SchoolMember) {
    setActionId(member.id);
    const res = await schoolService.memberSuspend(member.id);
    if (res.ok) {
      setToast(t('guru.suspendedToast', { name: member.name ?? member.email }));
      fetchMembers(search, filter, page);
    } else {
      setToast(t('guru.suspendFailed', { message: res.error.safeMessage }));
    }
    setActionId(null);
  }

  async function handleUnsuspend(member: SchoolMember) {
    setActionId(member.id);
    const res = await schoolService.memberUnsuspend(member.id);
    if (res.ok) {
      setToast(t('guru.activatedToast', { name: member.name ?? member.email }));
      fetchMembers(search, filter, page);
    } else {
      setToast(t('guru.activateFailed', { message: res.error.safeMessage }));
    }
    setActionId(null);
  }

  const [confirmRemoveMember, setConfirmRemoveMember] = useState<SchoolMember | null>(null);

  async function handleRemove(member: SchoolMember) {
    setActionId(member.id);
    const res = await schoolService.removeMember(member.id);
    if (res.ok) {
      setToast(t('guru.deletedToast', { name: member.name ?? member.email }));
      fetchMembers(search, filter, page);
    } else {
      setToast(t('guru.deleteFailed', { message: res.error.safeMessage }));
    }
    setActionId(null);
  }

  const roleFilters = [
    { value: 'all', label: t('common.all') },
    { value: 'teacher', label: t('roles.teacher') },
    { value: 'school_admin', label: t('common.adminShort') },
  ] as const;

  return (
    <>
      <AdminToolbar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={t('guru.searchPlaceholder')}
        filters={
          <>
            {roleFilters.map(({ value, label }) => (
              <AdminFilterChip
                key={value}
                active={filter === value}
                onClick={() => handleFilterChange(value)}
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
          aria-label={t('guru.loadingListLabel')}
          aria-busy="true"
          className="space-y-3 rounded-2xl border border-[#ddd4c8]/70 bg-white p-4"
        >
          <AdminContentLoading label={t('guru.loadingList')} />
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
          aria-label={t('guru.loadFailedLabel')}
          className="rounded-xl border border-brand-danger/30 bg-brand-danger-soft px-6 py-5 text-sm text-brand-danger"
        >
          <p className="font-semibold text-[#171717]">{t('guru.loadFailedTitle')}</p>
          <p className="mt-1 text-[13px]">{fetchError}</p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-3"
            onClick={() => fetchMembers(search, filter, page)}
          >
            {t('common.retry')}
          </Button>
        </div>
      ) : members.length === 0 ? (
        <div
          role="status"
          aria-label={t('guru.emptyLabel')}
          className="rounded-xl border border-dashed border-[#ddd4c8] bg-white px-6 py-14 text-center"
        >
          <p className="text-[13px] font-semibold text-[#171717]">{t('guru.emptyTitle')}</p>
          <p className="mx-auto mt-1 max-w-md text-[12px] text-[#57534e]">{t('guru.emptyHint')}</p>
        </div>
      ) : (
        <AdminDataTable
          rows={members}
          footerNote=""
          columns={[
            {
              key: 'name',
              header: t('guru.columns.member'),
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
              header: t('guru.columns.role'),
              render: (row) => <AdminPill tone="neutral">{memberRoleLabel(t, row.role)}</AdminPill>,
            },
            {
              key: 'state',
              header: t('guru.columns.status'),
              render: (row) => (
                <AdminPill tone={memberStateTone(row.state)}>
                  {memberStateLabel(t, row.state)}
                </AdminPill>
              ),
            },
            {
              key: 'lastActiveAt',
              header: t('guru.columns.lastActive'),
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
                      {t('guru.suspend')}
                    </Button>
                  ) : row.state === 'suspended' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={actionId === row.id}
                      onClick={() => handleUnsuspend(row)}
                    >
                      {t('guru.activate')}
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={actionId === row.id}
                    onClick={() => setConfirmRemoveMember(row)}
                  >
                    {t('guru.delete')}
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
            {t('guru.pageSummary', { total: meta.total, page: meta.page, pages: meta.pages })}
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              disabled={meta.page <= 1}
              onClick={() => handlePageChange((p) => p - 1)}
            >
              {t('common.previous')}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={meta.page >= meta.pages}
              onClick={() => handlePageChange((p) => p + 1)}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      )}

      <AdminConfirmModal
        open={!!confirmRemoveMember}
        title={t('guru.removeTitle')}
        description={t('guru.removeConfirm', {
          name: confirmRemoveMember?.name ?? confirmRemoveMember?.email ?? '',
        })}
        confirmLabel={t('guru.removeConfirmAction')}
        cancelLabel={t('common.cancel')}
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
  const t = useTranslations('school');
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
      setToast(t('undang.success', { email: res.value.email }));
      setEmail('');
    } else {
      setToast(t('undang.failed', { message: res.error.safeMessage }));
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="invite-email">
          {t('undang.email')}
        </label>
        <input
          id="invite-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('undang.emailPlaceholder')}
          className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="invite-role">
          {t('undang.role')}
        </label>
        <select
          id="invite-role"
          value={role}
          onChange={(e) => setRole(e.target.value as 'teacher' | 'school_admin')}
          className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
        >
          <option value="teacher">{t('undang.roleTeacher')}</option>
          <option value="school_admin">{t('undang.roleAdmin')}</option>
        </select>
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? t('undang.submitting') : t('undang.submit')}
      </Button>
    </form>
  );
}

// ── Section: Penggunaan ───────────────────────────────────────────────────────

function SectionPenggunaan({ setToast }: { setToast: (msg: string) => void }) {
  const t = useTranslations('school');
  const [usage, setUsage] = useState<SchoolUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    schoolService.usage().then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setUsage(res.value);
      } else {
        setToast(t('penggunaan.loadFailed', { message: res.error.safeMessage }));
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
      <div className="text-sm text-neutral-400 py-8 text-center">{t('penggunaan.unavailable')}</div>
    );
  }

  const unlimited = usage.quotaLimit === 0;
  const pct = unlimited ? 0 : Math.round((usage.quotaUsed / usage.quotaLimit) * 100);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">{t('penggunaan.quotaUsed')}</span>
          <span className="text-neutral-500">
            {t('penggunaan.quotaValue', {
              used: usage.quotaUsed,
              limit: unlimited
                ? t('penggunaan.unlimited')
                : t('penggunaan.quotaPercent', { limit: usage.quotaLimit, percent: pct }),
            })}
          </span>
        </div>
        {!unlimited && (
          <div
            role="progressbar"
            aria-label={t('penggunaan.quotaUsed')}
            aria-valuemin={0}
            aria-valuemax={usage.quotaLimit}
            aria-valuenow={Math.min(usage.quotaUsed, usage.quotaLimit)}
            className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800"
          >
            <div
              className={`h-2 rounded-full transition-all ${
                pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        )}
      </div>

      {usage.breakdown.length > 0 && (
        <AdminDataTable
          rows={usage.breakdown.map((b) => ({ ...b, id: b.userId }))}
          footerNote=""
          emptyLabel={t('common.noData')}
          columns={[
            {
              key: 'name',
              header: t('penggunaan.teacher'),
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
              header: t('penggunaan.quotaUsedColumn'),
              render: (row) => String(row.used),
            },
          ]}
        />
      )}

      {usage.trend.length > 0 && (
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
          <div className="text-sm font-medium mb-3">{t('penggunaan.monthlyTrend')}</div>
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

function SectionPengaturan({ setToast }: { setToast: (msg: string) => void }) {
  const t = useTranslations('school');
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    schoolService.settings().then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setSettings(res.value);
        setName(res.value.name);
      } else {
        setToast(t('pengaturan.loadFailed', { message: res.error.safeMessage }));
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
      setToast(t('pengaturan.saved'));
      setSettings((prev) => (prev ? { ...prev, name: trimmed } : prev));
    } else {
      setToast(t('pengaturan.saveFailed', { message: res.error.safeMessage }));
    }
    setSaving(false);
  }

  if (loading) return <AdminContentLoading />;

  return (
    <form onSubmit={handleSave} className="max-w-md space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="settings-name">
          {t('pengaturan.nameLabel')}
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
            {t('pengaturan.slug')}: <span className="font-mono">{settings.slug}</span>
          </div>
          <div>
            {t('pengaturan.level')}: {neutralMetadataLabel(t, settings.level)}
          </div>
          <div>
            {t('pengaturan.plan')}: {neutralMetadataLabel(t, settings.plan)}
          </div>
          <div>
            {t('pengaturan.seats')}: {settings.seats}
          </div>
          {settings.renewsAt && (
            <div>
              {t('pengaturan.renewsAt')}: {fmtDate(settings.renewsAt)}
            </div>
          )}
        </div>
      )}
      <Button type="submit" size="sm" disabled={saving}>
        {saving ? t('pengaturan.saving') : t('pengaturan.save')}
      </Button>
    </form>
  );
}

// ── Section: Billing ──────────────────────────────────────────────────────────

function SectionBilling() {
  const t = useTranslations('school');
  const [billing, setBilling] = useState<
    import('@/src/services/school/schoolService').SchoolBilling | null
  >(null);
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
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <AdminContentLoading />;
  if (error || !billing) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-brand-danger/30 bg-brand-danger-soft px-6 py-5 text-sm text-brand-danger"
      >
        <p className="font-semibold text-[#171717]">{t('billing.loadFailed')}</p>
        <p className="mt-1">{error ?? t('billing.unavailable')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[18px] font-bold text-[#171717]">{t('billing.title')}</h2>
        <p className="mt-0.5 text-[13px] text-[#6d665d]">{t('billing.description')}</p>
      </div>
      <AdminStatCards
        items={[
          { label: t('billing.plan'), value: billing.plan, tone: 'neutral' },
          {
            label: t('billing.teacherSeats'),
            value: t('billing.teacherSeatsValue', { count: billing.seatCount }),
            hint: t('billing.teacherSeatsHint'),
            tone: 'info',
          },
          {
            label: t('billing.usageThisMonth'),
            value: t('billing.usageValue', {
              used: billing.generationsUsedThisMonth,
              limit: billing.monthlyLimit ?? t('billing.unlimited'),
            }),
            tone: 'neutral',
          },
          {
            label: t('billing.cycleStart'),
            value: fmtDate(billing.billingCycleStartedAt),
            hint: t('billing.cycleStartHint'),
            tone: 'neutral',
          },
        ]}
      />
      <div
        role="status"
        className="rounded-xl border border-[#ddd4c8] bg-white px-5 py-4 text-sm text-[#57534e]"
      >
        {t('billing.invoiceUnavailable')}
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
  const t = useTranslations('school');
  const [items, setItems] = useState<SchoolLibraryItem[]>([]);
  const [meta, setMeta] = useState<SchoolLibraryResult['meta'] | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  const fetchLibrary = useCallback(
    (q: string, pg: number) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      schoolService.library({ q: q || undefined, page: pg, limit: 20 }).then((res) => {
        if (requestId !== requestIdRef.current) return;
        if (res.ok) {
          // service wraps paginated responses as { data, meta }
          const result = res.value as unknown as SchoolLibraryResult;
          setItems(result.data ?? []);
          setMeta(result.meta ?? null);
        } else {
          setToast(t('library.loadFailed', { message: res.error.safeMessage }));
        }
        setLoading(false);
      });
    },
    [setToast],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchLibrary(search, page), 300);
    return () => {
      clearTimeout(timeoutId);
      requestIdRef.current += 1;
    };
  }, [search, page, fetchLibrary]);

  function handleSearchChange(value: string) {
    if (value === search) return;
    requestIdRef.current += 1;
    setLoading(true);
    setPage(1);
    setSearch(value);
  }

  function handlePageChange(updater: (currentPage: number) => number) {
    requestIdRef.current += 1;
    setLoading(true);
    setPage(updater);
  }

  return (
    <>
      <AdminToolbar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={t('library.searchPlaceholder')}
      />
      {loading ? (
        <AdminContentLoading />
      ) : (
        <AdminDataTable
          rows={items}
          emptyLabel={t('library.empty')}
          columns={[
            {
              key: 'title',
              header: t('library.columns.title'),
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
              header: t('library.columns.author'),
              render: (row) => (
                <div className="flex items-center gap-2">
                  <AdminAvatar name={row.authorName} />
                  <span className="text-sm">{row.authorName}</span>
                </div>
              ),
            },
            {
              key: 'questionCount',
              header: t('library.columns.questions'),
              render: (row) => String(row.questionCount),
            },
            {
              key: 'updatedAt',
              header: t('library.columns.updated'),
              render: (row) => fmtDate(row.updatedAt),
            },
          ]}
        />
      )}
      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-between pt-2 text-sm">
          <span className="text-neutral-500">
            {t('library.pageSummary', { total: meta.total, page: meta.page, pages: meta.pages })}
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => handlePageChange((p) => p - 1)}
            >
              {t('common.previous')}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= meta.pages}
              onClick={() => handlePageChange((p) => p + 1)}
            >
              {t('common.next')}
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
  const t = useTranslations('school');
  const [rows, setRows] = useState<SchoolAuditRow[]>([]);
  const [meta, setMeta] = useState<SchoolAuditResult['meta'] | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  const fetchAudit = useCallback(
    (q: string, pg: number) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      schoolService.audit({ q: q || undefined, page: pg, limit: 20 }).then((res) => {
        if (requestId !== requestIdRef.current) return;
        if (res.ok) {
          // service wraps paginated responses as { data, meta }
          const result = res.value as unknown as SchoolAuditResult;
          setRows(result.data ?? []);
          setMeta(result.meta ?? null);
        } else {
          setToast(t('audit.loadFailed', { message: res.error.safeMessage }));
        }
        setLoading(false);
      });
    },
    [setToast],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchAudit(search, page), 300);
    return () => {
      clearTimeout(timeoutId);
      requestIdRef.current += 1;
    };
  }, [search, page, fetchAudit]);

  function handleSearchChange(value: string) {
    if (value === search) return;
    requestIdRef.current += 1;
    setLoading(true);
    setPage(1);
    setSearch(value);
  }

  function handlePageChange(updater: (currentPage: number) => number) {
    requestIdRef.current += 1;
    setLoading(true);
    setPage(updater);
  }

  return (
    <>
      <AdminToolbar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={t('audit.searchPlaceholder')}
      />
      {loading ? (
        <AdminContentLoading />
      ) : (
        <AdminDataTable
          rows={rows}
          emptyLabel={t('audit.empty')}
          columns={[
            {
              key: 'createdAt',
              header: t('audit.columns.time'),
              render: (row) => fmtDate(row.at),
            },
            {
              key: 'actorEmail',
              header: t('audit.columns.actor'),
              render: (row) => row.actor,
            },
            {
              key: 'action',
              header: t('audit.columns.action'),
              render: (row) => row.action,
            },
            {
              key: 'target',
              header: t('audit.columns.target'),
              render: (row) => safeText(row.target),
            },
          ]}
        />
      )}
      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-between pt-2 text-sm">
          <span className="text-neutral-500">
            {t('audit.pageSummary', { total: meta.total, page: meta.page, pages: meta.pages })}
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => handlePageChange((p) => p - 1)}
            >
              {t('common.previous')}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= meta.pages}
              onClick={() => handlePageChange((p) => p + 1)}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Section: Undangan ────────────────────────────────────────────────────────

function SectionUndangan({ setToast }: { setToast: (msg: string) => void }) {
  const t = useTranslations('school');
  const [invitations, setInvitations] = useState<SchoolInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [confirmCancelInv, setConfirmCancelInv] = useState<SchoolInvitation | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    schoolService.invitations().then((res) => {
      if (requestId !== requestIdRef.current) return;
      if (res.ok) {
        setInvitations(res.value);
      } else {
        setToast(t('undangan.loadFailed', { message: res.error.safeMessage }));
      }
      setLoading(false);
    });
    return () => {
      requestIdRef.current += 1;
    };
  }, [setToast]);

  function refreshInvitations() {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    schoolService.invitations().then((res) => {
      if (requestId !== requestIdRef.current) return;
      if (res.ok) {
        setInvitations(res.value);
      } else {
        setToast(`Gagal memuat undangan: ${res.error.safeMessage}`);
      }
      setLoading(false);
    });
  }

  async function handleCancel(inv: SchoolInvitation) {
    setCancelId(inv.id);
    const res = await schoolService.cancelInvitation(inv.id);
    if (res.ok) {
      setToast(t('undangan.cancelledToast', { email: inv.email }));
      refreshInvitations();
    } else {
      setToast(t('undangan.cancelFailed', { message: res.error.safeMessage }));
    }
    setCancelId(null);
  }

  if (loading) return <AdminContentLoading />;

  return (
    <>
      <AdminDataTable
        rows={invitations}
        emptyLabel={t('undangan.empty')}
        columns={[
          {
            key: 'email',
            header: t('undangan.columns.email'),
            render: (row) => (
              <div>
                <div className="font-medium text-sm">{row.email}</div>
                {row.invitedBy && (
                  <div className="text-xs text-neutral-400">
                    {t('undangan.invitedBy', { name: row.invitedBy })}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'role',
            header: t('undangan.columns.role'),
            render: (row) => <AdminPill tone="neutral">{memberRoleLabel(t, row.role)}</AdminPill>,
          },
          {
            key: 'createdAt',
            header: t('undangan.columns.sent'),
            render: (row) => fmtDate(row.createdAt),
          },
          {
            key: 'expiresAt',
            header: t('undangan.columns.expires'),
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
                  {cancelId === row.id ? t('undangan.cancelling') : t('undangan.cancel')}
                </Button>
              </div>
            ),
          },
        ]}
      />

      <AdminConfirmModal
        open={!!confirmCancelInv}
        title={t('undangan.cancelTitle')}
        description={t('undangan.cancelConfirm', { email: confirmCancelInv?.email ?? '' })}
        confirmLabel={t('undangan.cancelConfirmAction')}
        cancelLabel={t('common.cancel')}
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
  const t = useTranslations('school');
  const [data, setData] = useState<SchoolNotification[]>([]);
  const [meta, setMeta] = useState<SchoolNotificationsResult['meta'] | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    schoolService
      .notifications({
        page,
        limit: 20,
        status: filterStatus || undefined,
      })
      .then((res) => {
        if (requestId !== requestIdRef.current) return;
        if (res.ok) {
          setData(res.value.data ?? []);
          setMeta(res.value.meta ?? null);
        } else {
          setToast(t('notifikasi.loadFailed', { message: res.error.safeMessage }));
        }
        setLoading(false);
      });
    return () => {
      requestIdRef.current += 1;
    };
  }, [filterStatus, page, refreshVersion, setToast]);

  function handleFilterStatusChange(status: string) {
    if (status === filterStatus && page === 1) return;
    requestIdRef.current += 1;
    setLoading(true);
    setFilterStatus(status);
    setPage(1);
  }

  function handlePageChange(updater: (currentPage: number) => number) {
    requestIdRef.current += 1;
    setLoading(true);
    setPage(updater);
  }

  function handleRefresh() {
    requestIdRef.current += 1;
    setLoading(true);
    setRefreshVersion((version) => version + 1);
  }

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
            onClick={() => handleFilterStatusChange(s)}
            className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors ${
              filterStatus === s
                ? 'bg-[#171717] text-white border-[#171717]'
                : 'bg-white text-[#6d665d] border-[#ddd4c8] hover:bg-[#faf8f5]'
            }`}
          >
            {s ? notificationStatusLabel(t, s) : t('common.all')}
          </button>
        ))}
        <button
          onClick={handleRefresh}
          className="px-3 py-1 rounded-full text-[12px] font-medium border border-[#ddd4c8] bg-white text-[#6d665d] hover:bg-[#faf8f5] ml-auto"
        >
          {t('notifikasi.refresh')}
        </button>
      </div>

      {loading ? (
        <AdminContentLoading />
      ) : data.length === 0 ? (
        <div className="rounded-2xl border border-[#ddd4c8]/60 bg-[#faf8f5] p-8 text-center text-[13px] text-[#6d665d]">
          {t('notifikasi.empty')}
        </div>
      ) : (
        <AdminDataTable
          rows={data}
          emptyLabel={t('notifikasi.emptyTable')}
          columns={[
            {
              key: 'type',
              header: t('notifikasi.columns.type'),
              render: (row) => <span className="font-mono text-[11px]">{row.type}</span>,
            },
            {
              key: 'status',
              header: t('notifikasi.columns.status'),
              render: (row) => (
                <AdminPill tone={notifTone(row.status)}>
                  {notificationStatusLabel(t, row.status)}
                </AdminPill>
              ),
            },
            {
              key: 'attempt',
              header: t('notifikasi.columns.attempt'),
              render: (row) => <span className="tabular-nums text-[12px]">{row.attemptCount}</span>,
            },
            {
              key: 'error',
              header: t('notifikasi.columns.error'),
              render: (row) => (
                <span className="text-[11px] text-[#c9703a] truncate max-w-[200px] block">
                  {row.lastError ?? '—'}
                </span>
              ),
            },
            {
              key: 'created',
              header: t('notifikasi.columns.created'),
              render: (row) => (
                <span className="text-[11px] text-[#6d665d]">{row.createdAt ?? '—'}</span>
              ),
            },
          ]}
        />
      )}

      {meta && meta.pages > 1 ? (
        <div className="flex items-center justify-between pt-2 text-sm">
          <span className="text-neutral-500">
            {t('notifikasi.pageSummary', { total: meta.total, page: meta.page, pages: meta.pages })}
          </span>
          <div className="flex gap-1">
            <button
              aria-label={t('notifikasi.prevPage')}
              disabled={page <= 1}
              onClick={() => handlePageChange((p) => p - 1)}
              className="px-3 py-1 rounded-lg border border-[#ddd4c8] text-[12px] disabled:opacity-40"
            >
              ‹
            </button>
            <button
              aria-label={t('notifikasi.nextPage')}
              disabled={page >= meta.pages}
              onClick={() => handlePageChange((p) => p + 1)}
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
  const t = useTranslations('school');
  const current = section || '';
  const { search, filter, setSearch, setFilter, setToast } = useAdminSectionState(
    current || 'ringkasan',
  );

  return (
    <div className="space-y-4">
      {current === '' ? <SectionRingkasan setToast={setToast} /> : null}

      {current === 'guru' ? (
        <SectionGuru
          search={search}
          filter={filter || 'all'}
          setSearch={setSearch}
          setFilter={setFilter}
          setToast={setToast}
        />
      ) : null}

      {current === 'undang' ? <SectionUndang setToast={setToast} /> : null}

      {current === 'undangan' ? <SectionUndangan setToast={setToast} /> : null}

      {current === 'penggunaan' ? <SectionPenggunaan setToast={setToast} /> : null}

      {current === 'billing' ? <SectionBilling /> : null}

      {current === 'pengaturan' ? <SectionPengaturan setToast={setToast} /> : null}

      {current === 'library' ? (
        <SectionLibrary search={search} setSearch={setSearch} setToast={setToast} />
      ) : null}

      {current === 'audit' ? (
        <SectionAudit search={search} setSearch={setSearch} setToast={setToast} />
      ) : null}

      {current === 'notifikasi' ? <SectionNotifikasi setToast={setToast} /> : null}

      {![
        '',
        'guru',
        'undang',
        'undangan',
        'penggunaan',
        'billing',
        'pengaturan',
        'library',
        'audit',
        'notifikasi',
      ].includes(current) ? (
        <div
          role="alert"
          className="rounded-xl border border-[#ddd4c8] bg-white px-6 py-8 text-center"
        >
          {t('notFound')}
        </div>
      ) : null}
    </div>
  );
}
