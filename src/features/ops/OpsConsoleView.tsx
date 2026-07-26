'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/app/components/ui';
import {
  AdminAvatar,
  AdminPageHeader,
  AdminPill,
} from '@/src/features/admin/AdminChrome';
import { useAdminSectionState } from '@/src/features/admin/adminPanelState';
import {
  adminService,
  type AdminDashboard,
  type AdminJobRow,
  type AdminAccountRow,
  type AdminSchoolRow,
  type AdminQualityRow,
  type AdminBillingRow,
  type AdminFlagRow,
  type AdminPromptRow,
  type AdminAuditRow,
  type AdminContentRow,
  type AdminMeta,
  type AdminAuditDetail,
} from '@/src/services/admin/adminService';

// Re-export AdminPagination for backward compatibility
export { AdminPagination } from './components/AdminPagination';

import { OpsOverviewSection } from './sections/OpsOverviewSection';
import { OpsAccountsSection } from './sections/OpsAccountsSection';
import { OpsSchoolsSection } from './sections/OpsSchoolsSection';
import { OpsCatalogSection } from './sections/OpsCatalogSection';
import { OpsPromptsSection } from './sections/OpsPromptsSection';
import { OpsJobsSection } from './sections/OpsJobsSection';
import { OpsQualitySection } from './sections/OpsQualitySection';
import { OpsAuditSection } from './sections/OpsAuditSection';
import { OpsBillingSection } from './sections/OpsBillingSection';
import { OpsFlagsSection } from './sections/OpsFlagsSection';
import { OpsContentSection } from './sections/OpsContentSection';
import { OpsLearningSignalsSection } from './sections/OpsLearningSignalsSection';
import { OpsProfileSection } from './sections/OpsProfileSection';

type AccountRow = AdminAccountRow;
type SchoolRow = AdminSchoolRow;
type JobRow = AdminJobRow;
type QualityRow = AdminQualityRow;
type BillingRow = AdminBillingRow;
type FlagRow = AdminFlagRow;
type ContentRow = AdminContentRow;

export function OpsConsoleView({ section = '' }: { section?: string }) {
  const key = section || '';
  const { search, setSearch, selectedIds, setSelectedIds, toggleSelectedId, setToast } =
    useAdminSectionState(key || 'ringkasan');

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'' | 'teacher' | 'school_admin' | 'superadmin'>('');
  const [inviteLoading, setInviteLoading] = useState(false);

  const [filterRole, setFilterRole] = useState<'' | AccountRow['role']>('');
  const [filterStatus, setFilterStatus] = useState<'' | AccountRow['status']>('');
  const [filterPlan, setFilterPlan] = useState<'' | SchoolRow['plan']>('');
  const [filterJobStatus, setFilterJobStatus] = useState<'' | JobRow['status']>('');
  const [filterQuality, setFilterQuality] = useState<'' | QualityRow['status']>('');
  const [filterBilling, setFilterBilling] = useState<'' | BillingRow['state']>('');
  const [filterContent, setFilterContent] = useState<'' | ContentRow['status']>('');

  const [page, setPage] = useState(1);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  // ── Live dashboard state ──────────────────────────────────────────────
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [dashboardJobs, setDashboardJobs] = useState<AdminJobRow[]>([]);
  const [dashboardSchools, setDashboardSchools] = useState<AdminSchoolRow[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const loadDashboard = () => {
    setDashboardLoading(true);
    Promise.all([
      adminService.dashboard(),
      adminService.jobs({ limit: 4 }),
      adminService.schools({ limit: 4 }),
    ]).then(([kpiRes, jobsRes, schoolsRes]) => {
      if (kpiRes.ok) setDashboard(kpiRes.value);
      if (jobsRes.ok) {
        const jv = jobsRes.value as any;
        setDashboardJobs(Array.isArray(jv) ? jv : (jv?.data ?? []));
      }
      if (schoolsRes.ok) {
        const sv = schoolsRes.value as any;
        setDashboardSchools(Array.isArray(sv) ? sv : (sv?.data ?? []));
      }
      setDashboardLoading(false);
    });
  };

  useEffect(() => {
    if (key === '') loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // ── Per-section live data state ────────────────────────────────────────
  const [accountsData, setAccountsData] = useState<AccountRow[]>([]);
  const [accountsMeta, setAccountsMeta] = useState({ total: 0, pages: 1 });
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [detailAccountId, setDetailAccountId] = useState<string | null>(null);

  const [schoolsData, setSchoolsData] = useState<SchoolRow[]>([]);
  const [schoolsMeta, setSchoolsMeta] = useState({ total: 0, pages: 1 });
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [schoolsPage, setSchoolsPage] = useState(1);

  // School detail modal
  const [schoolDetailId, setSchoolDetailId] = useState<string | null>(null);
  const [schoolDetailData, setSchoolDetailData] = useState<{
    school: { id: string; name: string; slug: string; plan: string; state: string; seats: number; renewsAt: string };
    members: { id: string; email: string; name: string; username: string | null; roles: string[]; createdAt: string }[];
    memberCount: number;
  } | null>(null);
  const [schoolDetailLoading, setSchoolDetailLoading] = useState(false);
  const [schoolRenameValue, setSchoolRenameValue] = useState('');
  const [schoolRenameSaving, setSchoolRenameSaving] = useState(false);

  const [jobsData, setJobsData] = useState<JobRow[]>([]);
  const [jobsMeta, setJobsMeta] = useState({ total: 0, pages: 1 });
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsPage, setJobsPage] = useState(1);

  // Job detail modal
  const [jobDetailId, setJobDetailId] = useState<string | null>(null);
  const [jobDetailData, setJobDetailData] = useState<Record<string, unknown> | null>(null);
  const [jobDetailLoading, setJobDetailLoading] = useState(false);

  const [qualityData, setQualityData] = useState<QualityRow[]>([]);
  const [qualityMeta, setQualityMeta] = useState({ total: 0, pages: 1 });
  const [qualityLoading, setQualityLoading] = useState(false);

  // Quality detail modal
  const [qualityDetailId, setQualityDetailId] = useState<string | null>(null);
  const [qualityDetailData, setQualityDetailData] = useState<{
    id: string;
    reason: string;
    status: string;
    reporter: string;
    notes: string;
    workspaceId: string;
    createdAt: string;
  } | null>(null);
  const [qualityDetailLoading, setQualityDetailLoading] = useState(false);
  const [qualityNotesDraft, setQualityNotesDraft] = useState('');
  const [qualityNotesSaving, setQualityNotesSaving] = useState(false);
  const [qualityPage, setQualityPage] = useState(1);

  const [billingData, setBillingData] = useState<BillingRow[]>([]);
  const [billingMeta, setBillingMeta] = useState({ total: 0, pages: 1 });
  const [billingLoading, setBillingLoading] = useState(false);

  const [flagsData, setFlagsData] = useState<FlagRow[]>([]);
  const [flagsLoading, setFlagsLoading] = useState(false);

  const [promptsData, setPromptsData] = useState<AdminPromptRow[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);

  const [auditData, setAuditData] = useState<AdminAuditRow[]>([]);
  const [auditMeta, setAuditMeta] = useState<AdminMeta>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [auditPage, setAuditPage] = useState(1);
  const [auditLoading, setAuditLoading] = useState(false);

  const [contentData, setContentData] = useState<ContentRow[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentPage, setContentPage] = useState(1);
  const [contentMeta, setContentMeta] = useState({ total: 0, pages: 1 });

  // Audit detail modal state
  const [auditDetailId, setAuditDetailId] = useState<string | null>(null);
  const [auditDetailData, setAuditDetailData] = useState<AdminAuditDetail | null>(null);
  const [auditDetailLoading, setAuditDetailLoading] = useState(false);
  const [filterAuditAction, setFilterAuditAction] = useState('');
  const [filterAuditActor, setFilterAuditActor] = useState('');

  // Billing modal state
  const [billingEditRow, setBillingEditRow] = useState<BillingRow | null>(null);
  const [billingEditState, setBillingEditState] = useState<BillingRow['state']>('active');
  const [billingEditSeats, setBillingEditSeats] = useState('');
  const [billingEditRenews, setBillingEditRenews] = useState('');
  const [billingEditLoading, setBillingEditLoading] = useState(false);
  const [billingPage, setBillingPage] = useState(1);

  // Payment orders state
  const [billingTab, setBillingTab] = useState<'langganan' | 'orders'>('langganan');
  const [paymentOrdersData, setPaymentOrdersData] = useState<import('@/src/services/admin/adminService').PaymentOrder[]>([]);
  const [paymentOrdersMeta, setPaymentOrdersMeta] = useState({ total: 0, pages: 1 });
  const [paymentOrdersLoading, setPaymentOrdersLoading] = useState(false);
  const [paymentOrdersPage, setPaymentOrdersPage] = useState(1);
  const [filterOrderStatus, setFilterOrderStatus] = useState('');

  // Catalog state
  const [catalogGrades, setCatalogGrades] = useState<{ id: string; label: string; status: string; jenjang?: string }[]>([]);
  const [catalogSubjects, setCatalogSubjects] = useState<{ id: string; label: string; status: string }[]>([]);
  const [catalogSelectedGrade, setCatalogSelectedGrade] = useState<string>('');
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogSubjectsLoading, setCatalogSubjectsLoading] = useState(false);
  const [catalogUpdatingIds, setCatalogUpdatingIds] = useState<Set<string>>(new Set());
  const [catalogShowAddGrade, setCatalogShowAddGrade] = useState(false);
  const [catalogJenjangFilter, setCatalogJenjangFilter] = useState('semua');
  const [catalogAddGradeJenjang, setCatalogAddGradeJenjang] = useState<string | null>(null);
  const [catalogAddGradePredefined, setCatalogAddGradePredefined] = useState('');
  const [catalogAddingGrade, setCatalogAddingGrade] = useState(false);
  const [catalogShowAddSubject, setCatalogShowAddSubject] = useState(false);
  const [catalogNewSubjectLabel, setCatalogNewSubjectLabel] = useState('');
  const [catalogAddingSubject, setCatalogAddingSubject] = useState(false);

  const [createPromptOpen, setCreatePromptOpen] = useState(false);
  const [createPromptName, setCreatePromptName] = useState('');
  const [createPromptSlug, setCreatePromptSlug] = useState('');
  const [createPromptDesc, setCreatePromptDesc] = useState('');
  const [createPromptText, setCreatePromptText] = useState('');
  const [createPromptLoading, setCreatePromptLoading] = useState(false);

  // Learning Signals state
  const [signalsData, setSignalsData] = useState<{ prompt_template_id: string; pattern: string; frequency: number; avg_rating: number; suggested_action: string }[]>([]);
  const [signalsLoading, setSignalsLoading] = useState(false);

  const [createFlagOpen, setCreateFlagOpen] = useState(false);
  const [createFlagKey, setCreateFlagKey] = useState('');
  const [createFlagDesc, setCreateFlagDesc] = useState('');
  const [createFlagScope, setCreateFlagScope] = useState<'global' | 'pilot'>('global');
  const [createFlagLoading, setCreateFlagLoading] = useState(false);

  // Create School modal state
  const [createSchoolOpen, setCreateSchoolOpen] = useState(false);
  const [createSchoolName, setCreateSchoolName] = useState('');
  const [createSchoolSlug, setCreateSchoolSlug] = useState('');
  const [createSchoolLoading, setCreateSchoolLoading] = useState(false);

  // ── Fetch loaders ─────────────────────────────────────────────────────
  const loadAccounts = (
    currentPage = page,
    searchVal = search,
    roleVal = filterRole,
    statusVal = filterStatus,
  ) => {
    setAccountsLoading(true);
    adminService
      .accounts({
        q: searchVal || undefined,
        role: roleVal || undefined,
        status: statusVal || undefined,
        page: currentPage,
        limit: 10,
      })
      .then((res) => {
        if (res.ok) {
          const val = res.value as any;
          if (val && typeof val === 'object' && Array.isArray(val.data) && val.meta) {
            setAccountsData(val.data);
            setAccountsMeta({
              total: val.meta.total ?? val.data.length,
              pages: val.meta.pages ?? Math.max(1, Math.ceil((val.meta.total ?? val.data.length) / 10)),
            });
          } else if (Array.isArray(val)) {
            setAccountsData(val);
            setAccountsMeta({
              total: val.length,
              pages: Math.max(1, Math.ceil(val.length / 10)),
            });
          }
        }
        setAccountsLoading(false);
      });
  };

  const loadSchools = (
    pg = schoolsPage,
    searchVal = search,
    planVal = filterPlan,
  ) => {
    setSchoolsLoading(true);
    adminService
      .schools({ q: searchVal || undefined, plan: planVal || undefined, page: pg, limit: 10 })
      .then((res) => {
        if (res.ok) {
          const val = res.value as { data: SchoolRow[]; meta: { total: number; pages: number } };
          setSchoolsData(val.data ?? []);
          setSchoolsMeta({ total: val.meta?.total ?? 0, pages: val.meta?.pages ?? 1 });
        }
        setSchoolsLoading(false);
      });
  };

  const loadJobs = (
    pg = jobsPage,
    searchVal = search,
    statusVal = filterJobStatus,
  ) => {
    setJobsLoading(true);
    adminService
      .jobs({ q: searchVal || undefined, status: statusVal || undefined, page: pg, limit: 20 })
      .then((res) => {
        if (res.ok) {
          const val = res.value as { data: JobRow[]; meta: { total: number; pages: number } };
          setJobsData(val.data ?? []);
          setJobsMeta({ total: val.meta?.total ?? 0, pages: val.meta?.pages ?? 1 });
        }
        setJobsLoading(false);
      });
  };

  const loadQuality = (
    pg = qualityPage,
    searchVal = search,
    statusVal = filterQuality,
  ) => {
    setQualityLoading(true);
    adminService
      .qualityReports({ status: statusVal || undefined, q: searchVal || undefined, page: pg, limit: 20 })
      .then((res) => {
        if (res.ok) {
          const val = res.value as { data: QualityRow[]; meta: { total: number; pages: number } };
          setQualityData(val.data ?? []);
          setQualityMeta({ total: val.meta?.total ?? 0, pages: val.meta?.pages ?? 1 });
        }
        setQualityLoading(false);
      });
  };

  const loadBilling = (stateFilter = filterBilling, searchVal = search, pg = billingPage) => {
    setBillingLoading(true);
    adminService.billing({
      state: stateFilter || undefined,
      q: searchVal || undefined,
      page: pg,
      limit: 10,
    }).then((res) => {
      if (res.ok) {
        const val = res.value as any;
        if (val?.data && val?.meta) {
          setBillingData(val.data);
          setBillingMeta({ total: val.meta.total, pages: val.meta.pages });
        } else {
          setBillingData(Array.isArray(val) ? val : []);
        }
      }
      setBillingLoading(false);
    });
  };

  const loadPaymentOrders = (statusFilter = filterOrderStatus, pg = paymentOrdersPage) => {
    setPaymentOrdersLoading(true);
    adminService.paymentOrders({ status: statusFilter || undefined, page: pg, limit: 20 })
      .then((res) => {
        if (res.ok) {
          const val = res.value as any;
          setPaymentOrdersData(Array.isArray(val) ? val : (val?.data ?? []));
          setPaymentOrdersMeta(val?.meta ?? { total: 0, pages: 1 });
        }
        setPaymentOrdersLoading(false);
      });
  };

  const loadFlags = () => {
    setFlagsLoading(true);
    adminService.flags().then((res) => {
      if (res.ok) setFlagsData(res.value);
      setFlagsLoading(false);
    });
  };

  const loadPrompts = () => {
    setPromptsLoading(true);
    adminService.prompts().then((res) => {
      if (res.ok) setPromptsData(res.value);
      setPromptsLoading(false);
    });
  };

  const loadAudit = (page: number) => {
    setAuditLoading(true);
    adminService.auditLogs({ page, limit: 20 }).then((res) => {
      if (res.ok) {
        const val = res.value as any;
        if (val?.data && val?.meta) {
          setAuditData(val.data);
          setAuditMeta(val.meta);
        } else {
          setAuditData(Array.isArray(val) ? val : (val?.data ?? []));
        }
      }
      setAuditLoading(false);
    });
  };

  const loadContent = () => {
    setContentLoading(true);
    adminService.marketingPages().then((res) => {
      if (res.ok) setContentData(res.value);
      setContentLoading(false);
    });
  };

  // ── Fetch on section change ──────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'accounts') {
      loadAccounts(page, search, filterRole, filterStatus);
    }
  }, [key, page, search, filterRole, filterStatus]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'schools') {
      setSchoolsPage(1);
      loadSchools(1, search, filterPlan);
    }
  }, [key, search, filterPlan]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'schools') loadSchools(schoolsPage, search, filterPlan);
  }, [schoolsPage]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'jobs') {
      setJobsPage(1);
      loadJobs(1, search, filterJobStatus);
    }
  }, [key, search, filterJobStatus]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'jobs') loadJobs(jobsPage, search, filterJobStatus);
  }, [jobsPage]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'quality') {
      setQualityPage(1);
      loadQuality(1, search, filterQuality);
    }
  }, [key, search, filterQuality]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'quality') loadQuality(qualityPage, search, filterQuality);
  }, [qualityPage]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'billing') loadBilling(); }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'billing') loadBilling(filterBilling, search, billingPage); }, [billingPage]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'billing' && billingTab === 'orders') loadPaymentOrders(); }, [key, billingTab]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'billing' && billingTab === 'orders') loadPaymentOrders(filterOrderStatus, paymentOrdersPage); }, [paymentOrdersPage]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'flags') loadFlags(); }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'prompts') loadPrompts(); }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'content') loadContent(); }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'content') loadContent(); }, [contentPage]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'catalog') {
      setCatalogLoading(true);
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1').replace(/\/+$/, '');
      fetch(`${base}/catalog/grades`, { credentials: 'include' })
        .then((r) => r.json())
        .then((j) => {
          setCatalogGrades(j?.data ?? []);
          setCatalogLoading(false);
          const firstGrade = j?.data?.[0]?.id;
          if (firstGrade) {
            setCatalogSelectedGrade(firstGrade);
            setCatalogSubjectsLoading(true);
            fetch(`${base}/catalog/subjects?gradeId=${firstGrade}`, { credentials: 'include' })
              .then((r) => r.json())
              .then((js) => {
                setCatalogSubjects(js?.data ?? []);
                setCatalogSubjectsLoading(false);
              })
              .catch(() => setCatalogSubjectsLoading(false));
          }
        })
        .catch(() => setCatalogLoading(false));
    }
  }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'learning-signals') {
      setSignalsLoading(true);
      adminService.learningSignals().then((res) => {
        if (res.ok) {
          const val = res.value as any;
          setSignalsData(Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : []);
        }
        setSignalsLoading(false);
      });
    }
  }, [key]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'audit') {
      setAuditPage(1);
      loadAudit(1);
    }
  }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'audit') loadAudit(auditPage);
  }, [auditPage]);

  // ── Impersonate Action ────────────────────────────────────────────────
  const handleImpersonate = (row: AccountRow) => {
    setImpersonatingId(row.id);
    setToast(`Memulai impersonasi sebagai ${row.displayName}...`);
    adminService.impersonateAccount(row.id).then((res) => {
      if (res.ok) {
        setToast(`Impersonasi ${res.value.targetName || res.value.targetEmail} berhasil. Mengalihkan...`);
        setTimeout(() => {
          window.location.href = res.value.homePath;
        }, 300);
      } else {
        setToast(`Gagal: ${res.error.safeMessage}`);
        setImpersonatingId(null);
      }
    });
  };

  useEffect(() => {
    setPage(1);
  }, [search, filterRole, filterStatus, filterBilling, filterContent, key]);

  const accounts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return accountsData.filter((row) => {
      const matchSearch =
        !q ||
        (row.displayName ?? '').toLowerCase().includes(q) ||
        (row.email ?? '').toLowerCase().includes(q) ||
        (row.role ?? '').toLowerCase().includes(q) ||
        (row.school ?? '').toLowerCase().includes(q);
      const matchRole = filterRole === '' || row.role === filterRole;
      const matchStatus = filterStatus === '' || row.status === filterStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }, [accountsData, search, filterRole, filterStatus]);
  const schools = useMemo(() => schoolsData, [schoolsData]);
  const jobs = useMemo(() => jobsData, [jobsData]);
  const quality = useMemo(() => qualityData, [qualityData]);

  const content = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contentData.filter((row) => {
      const matchSearch =
        !q || row.slug.includes(q) || row.title.toLowerCase().includes(q) || row.status.includes(q);
      const matchStatus = filterContent === '' || row.status === filterContent;
      return matchSearch && matchStatus;
    });
  }, [contentData, search, filterContent]);

  const clearSelection = () => setSelectedIds([]);

  return (
    <div className="space-y-4">
      {key === '' ? (
        <OpsOverviewSection
          dashboard={dashboard}
          dashboardJobs={dashboardJobs}
          dashboardSchools={dashboardSchools}
          dashboardLoading={dashboardLoading}
          loadDashboard={loadDashboard}
          setToast={setToast}
        />
      ) : null}

      {key === 'accounts' || key.startsWith('accounts/') ? (
        <OpsAccountsSection
          keyStr={key}
          detailAccountId={detailAccountId}
          setDetailAccountId={setDetailAccountId}
          accountsLoading={accountsLoading}
          inviteOpen={inviteOpen}
          setInviteOpen={setInviteOpen}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          inviteName={inviteName}
          setInviteName={setInviteName}
          inviteRole={inviteRole}
          setInviteRole={setInviteRole}
          inviteLoading={inviteLoading}
          setInviteLoading={setInviteLoading}
          search={search}
          setSearch={setSearch}
          filterRole={filterRole}
          setFilterRole={setFilterRole}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          toggleSelectedId={toggleSelectedId}
          clearSelection={clearSelection}
          accounts={accounts}
          accountsData={accountsData}
          accountsMeta={accountsMeta}
          page={page}
          setPage={setPage}
          impersonatingId={impersonatingId}
          handleImpersonate={handleImpersonate}
          loadAccounts={loadAccounts}
          setToast={setToast}
        />
      ) : null}

      {key === 'schools' ? (
        <OpsSchoolsSection
          createSchoolOpen={createSchoolOpen}
          setCreateSchoolOpen={setCreateSchoolOpen}
          createSchoolName={createSchoolName}
          setCreateSchoolName={setCreateSchoolName}
          createSchoolSlug={createSchoolSlug}
          setCreateSchoolSlug={setCreateSchoolSlug}
          createSchoolLoading={createSchoolLoading}
          setCreateSchoolLoading={setCreateSchoolLoading}
          schoolsLoading={schoolsLoading}
          schoolDetailId={schoolDetailId}
          setSchoolDetailId={setSchoolDetailId}
          schoolDetailData={schoolDetailData}
          setSchoolDetailData={setSchoolDetailData}
          schoolDetailLoading={schoolDetailLoading}
          setSchoolDetailLoading={setSchoolDetailLoading}
          schoolRenameValue={schoolRenameValue}
          setSchoolRenameValue={setSchoolRenameValue}
          schoolRenameSaving={schoolRenameSaving}
          setSchoolRenameSaving={setSchoolRenameSaving}
          search={search}
          setSearch={setSearch}
          filterPlan={filterPlan}
          setFilterPlan={setFilterPlan}
          schools={schools}
          schoolsPage={schoolsPage}
          setSchoolsPage={setSchoolsPage}
          schoolsMeta={schoolsMeta}
          loadSchools={loadSchools}
          setToast={setToast}
        />
      ) : null}

      {key === 'catalog' ? (
        <OpsCatalogSection
          catalogGrades={catalogGrades}
          setCatalogGrades={setCatalogGrades}
          catalogSubjects={catalogSubjects}
          setCatalogSubjects={setCatalogSubjects}
          catalogSelectedGrade={catalogSelectedGrade}
          setCatalogSelectedGrade={setCatalogSelectedGrade}
          catalogLoading={catalogLoading}
          setCatalogLoading={setCatalogLoading}
          catalogSubjectsLoading={catalogSubjectsLoading}
          setCatalogSubjectsLoading={setCatalogSubjectsLoading}
          catalogUpdatingIds={catalogUpdatingIds}
          setCatalogUpdatingIds={setCatalogUpdatingIds}
          catalogShowAddGrade={catalogShowAddGrade}
          setCatalogShowAddGrade={setCatalogShowAddGrade}
          catalogAddingGrade={catalogAddingGrade}
          setCatalogAddingGrade={setCatalogAddingGrade}
          catalogShowAddSubject={catalogShowAddSubject}
          setCatalogShowAddSubject={setCatalogShowAddSubject}
          catalogNewSubjectLabel={catalogNewSubjectLabel}
          setCatalogNewSubjectLabel={setCatalogNewSubjectLabel}
          catalogAddingSubject={catalogAddingSubject}
          setCatalogAddingSubject={setCatalogAddingSubject}
          catalogJenjangFilter={catalogJenjangFilter}
          setCatalogJenjangFilter={setCatalogJenjangFilter}
          catalogAddGradeJenjang={catalogAddGradeJenjang}
          setCatalogAddGradeJenjang={setCatalogAddGradeJenjang}
          catalogAddGradePredefined={catalogAddGradePredefined}
          setCatalogAddGradePredefined={setCatalogAddGradePredefined}
          setToast={setToast}
        />
      ) : null}

      {key === 'prompts' ? (
        <OpsPromptsSection
          promptsData={promptsData}
          promptsLoading={promptsLoading}
          createPromptOpen={createPromptOpen}
          setCreatePromptOpen={setCreatePromptOpen}
          createPromptName={createPromptName}
          setCreatePromptName={setCreatePromptName}
          createPromptSlug={createPromptSlug}
          setCreatePromptSlug={setCreatePromptSlug}
          createPromptDesc={createPromptDesc}
          setCreatePromptDesc={setCreatePromptDesc}
          createPromptText={createPromptText}
          setCreatePromptText={setCreatePromptText}
          createPromptLoading={createPromptLoading}
          setCreatePromptLoading={setCreatePromptLoading}
          search={search}
          setSearch={setSearch}
          loadPrompts={loadPrompts}
          setToast={setToast}
        />
      ) : null}

      {key === 'jobs' ? (
        <OpsJobsSection
          jobs={jobs}
          jobsData={jobsData}
          jobsLoading={jobsLoading}
          jobsPage={jobsPage}
          setJobsPage={setJobsPage}
          jobsMeta={jobsMeta}
          jobDetailId={jobDetailId}
          setJobDetailId={setJobDetailId}
          jobDetailData={jobDetailData}
          setJobDetailData={setJobDetailData}
          jobDetailLoading={jobDetailLoading}
          setJobDetailLoading={setJobDetailLoading}
          search={search}
          setSearch={setSearch}
          filterJobStatus={filterJobStatus}
          setFilterJobStatus={setFilterJobStatus}
          loadJobs={loadJobs}
          setToast={setToast}
        />
      ) : null}

      {key === 'quality' ? (
        <OpsQualitySection
          quality={quality}
          qualityLoading={qualityLoading}
          qualityPage={qualityPage}
          setQualityPage={setQualityPage}
          qualityMeta={qualityMeta}
          qualityDetailId={qualityDetailId}
          setQualityDetailId={setQualityDetailId}
          qualityDetailData={qualityDetailData}
          setQualityDetailData={setQualityDetailData}
          qualityDetailLoading={qualityDetailLoading}
          setQualityDetailLoading={setQualityDetailLoading}
          qualityNotesDraft={qualityNotesDraft}
          setQualityNotesDraft={setQualityNotesDraft}
          qualityNotesSaving={qualityNotesSaving}
          setQualityNotesSaving={setQualityNotesSaving}
          search={search}
          setSearch={setSearch}
          filterQuality={filterQuality}
          setFilterQuality={setFilterQuality}
          loadQuality={loadQuality}
          setToast={setToast}
        />
      ) : null}

      {key === 'audit' ? (
        <OpsAuditSection
          auditData={auditData}
          setAuditData={setAuditData}
          auditMeta={auditMeta}
          setAuditMeta={setAuditMeta}
          auditPage={auditPage}
          setAuditPage={setAuditPage}
          auditLoading={auditLoading}
          auditDetailId={auditDetailId}
          setAuditDetailId={setAuditDetailId}
          auditDetailData={auditDetailData}
          setAuditDetailData={setAuditDetailData}
          auditDetailLoading={auditDetailLoading}
          setAuditDetailLoading={setAuditDetailLoading}
          filterAuditAction={filterAuditAction}
          setFilterAuditAction={setFilterAuditAction}
          filterAuditActor={filterAuditActor}
          setFilterAuditActor={setFilterAuditActor}
          loadAudit={loadAudit}
        />
      ) : null}

      {key === 'billing' ? (
        <OpsBillingSection
          billingData={billingData}
          billingMeta={billingMeta}
          billingLoading={billingLoading}
          billingEditRow={billingEditRow}
          setBillingEditRow={setBillingEditRow}
          billingEditState={billingEditState}
          setBillingEditState={setBillingEditState}
          billingEditSeats={billingEditSeats}
          setBillingEditSeats={setBillingEditSeats}
          billingEditRenews={billingEditRenews}
          setBillingEditRenews={setBillingEditRenews}
          billingEditLoading={billingEditLoading}
          setBillingEditLoading={setBillingEditLoading}
          billingPage={billingPage}
          setBillingPage={setBillingPage}
          billingTab={billingTab}
          setBillingTab={setBillingTab}
          paymentOrdersData={paymentOrdersData}
          paymentOrdersMeta={paymentOrdersMeta}
          paymentOrdersLoading={paymentOrdersLoading}
          paymentOrdersPage={paymentOrdersPage}
          setPaymentOrdersPage={setPaymentOrdersPage}
          filterOrderStatus={filterOrderStatus}
          setFilterOrderStatus={setFilterOrderStatus}
          search={search}
          setSearch={setSearch}
          filterBilling={filterBilling}
          setFilterBilling={setFilterBilling}
          loadBilling={loadBilling}
          loadPaymentOrders={loadPaymentOrders}
          setToast={setToast}
        />
      ) : null}

      {key === 'flags' ? (
        <OpsFlagsSection
          flagsData={flagsData}
          flagsLoading={flagsLoading}
          createFlagOpen={createFlagOpen}
          setCreateFlagOpen={setCreateFlagOpen}
          createFlagKey={createFlagKey}
          setCreateFlagKey={setCreateFlagKey}
          createFlagDesc={createFlagDesc}
          setCreateFlagDesc={setCreateFlagDesc}
          createFlagScope={createFlagScope}
          setCreateFlagScope={setCreateFlagScope}
          createFlagLoading={createFlagLoading}
          setCreateFlagLoading={setCreateFlagLoading}
          search={search}
          setSearch={setSearch}
          loadFlags={loadFlags}
          setToast={setToast}
        />
      ) : null}

      {key === 'content' ? (
        <OpsContentSection
          content={content}
          contentLoading={contentLoading}
          createSchoolOpen={createSchoolOpen}
          setCreateSchoolOpen={setCreateSchoolOpen}
          createSchoolName={createSchoolName}
          setCreateSchoolName={setCreateSchoolName}
          createSchoolSlug={createSchoolSlug}
          setCreateSchoolSlug={setCreateSchoolSlug}
          createSchoolLoading={createSchoolLoading}
          setCreateSchoolLoading={setCreateSchoolLoading}
          search={search}
          setSearch={setSearch}
          filterContent={filterContent}
          setFilterContent={setFilterContent}
          contentPage={contentPage}
          setContentPage={setContentPage}
          contentMeta={contentMeta}
          loadContent={loadContent}
          setToast={setToast}
        />
      ) : null}

      {key === 'learning-signals' ? (
        <OpsLearningSignalsSection
          signalsData={signalsData}
          setSignalsData={setSignalsData}
          signalsLoading={signalsLoading}
          setSignalsLoading={setSignalsLoading}
        />
      ) : null}

      {key === 'profile' ? <OpsProfileSection setToast={setToast} /> : null}

      {key !== '' &&
      !key.startsWith('accounts/') &&
      ![
        'accounts',
        'schools',
        'catalog',
        'prompts',
        'learning-signals',
        'jobs',
        'quality',
        'audit',
        'billing',
        'flags',
        'content',
        'profile',
      ].includes(key) ? (
        <AdminPageHeader
          title={`Section ${key}`}
          description="Halaman ini belum punya konten management. Pilih menu ops yang tersedia di sidebar."
          meta={<AdminPill tone="warn">coming soon</AdminPill>}
        />
      ) : null}
    </div>
  );
}
