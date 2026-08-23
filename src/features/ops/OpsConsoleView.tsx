'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/app/components/ui';
import { AdminAvatar, AdminPageHeader, AdminPill } from '@/src/features/admin/AdminChrome';
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
import { OpsAiProviderSection } from './sections/OpsAiProviderSection';
import { OpsPlanHargaSection } from './sections/OpsPlanHargaSection';
import { OpsWaGatewaySection } from './sections/OpsWaGatewaySection';

type AccountRow = AdminAccountRow;
type SchoolRow = AdminSchoolRow;
type JobRow = AdminJobRow;
type QualityRow = AdminQualityRow;
type BillingRow = AdminBillingRow;
type FlagRow = AdminFlagRow;

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

  const [page, setPage] = useState(1);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  // ── Live dashboard state ──────────────────────────────────────────────
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [dashboardJobs, setDashboardJobs] = useState<AdminJobRow[]>([]);
  const [dashboardSchools, setDashboardSchools] = useState<AdminSchoolRow[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(key === '');

  const requestDashboard = useCallback(() => {
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
  }, []);

  const loadDashboard = useCallback(() => {
    setDashboardLoading(true);
    requestDashboard();
  }, [requestDashboard]);

  useEffect(() => {
    if (key === '') requestDashboard();
  }, [key, requestDashboard]);

  // ── Per-section live data state ────────────────────────────────────────
  const [accountsData, setAccountsData] = useState<AccountRow[]>([]);
  const [accountsMeta, setAccountsMeta] = useState({ total: 0, pages: 1 });
  const [accountsLoading, setAccountsLoading] = useState(key === 'accounts');
  const [detailAccountId, setDetailAccountId] = useState<string | null>(null);

  const [schoolsData, setSchoolsData] = useState<SchoolRow[]>([]);
  const [schoolsMeta, setSchoolsMeta] = useState({ total: 0, pages: 1 });
  const [schoolsLoading, setSchoolsLoading] = useState(key === 'schools');
  const [schoolsPage, setSchoolsPage] = useState(1);

  // School detail modal
  const [schoolDetailId, setSchoolDetailId] = useState<string | null>(null);
  const [schoolDetailData, setSchoolDetailData] = useState<{
    school: {
      id: string;
      name: string;
      slug: string;
      plan: string;
      state: string;
      seats: number;
      renewsAt: string;
    };
    members: {
      id: string;
      email: string;
      name: string;
      username: string | null;
      roles: string[];
      createdAt: string;
    }[];
    memberCount: number;
  } | null>(null);
  const [schoolDetailLoading, setSchoolDetailLoading] = useState(false);
  const [schoolRenameValue, setSchoolRenameValue] = useState('');
  const [schoolRenameSaving, setSchoolRenameSaving] = useState(false);

  const [jobsData, setJobsData] = useState<JobRow[]>([]);
  const [jobsMeta, setJobsMeta] = useState({ total: 0, pages: 1 });
  const [jobsLoading, setJobsLoading] = useState(key === 'jobs');
  const [jobsPage, setJobsPage] = useState(1);

  // Job detail modal
  const [jobDetailId, setJobDetailId] = useState<string | null>(null);
  const [jobDetailData, setJobDetailData] = useState<Record<string, unknown> | null>(null);
  const [jobDetailLoading, setJobDetailLoading] = useState(false);

  const [qualityData, setQualityData] = useState<QualityRow[]>([]);
  const [qualityMeta, setQualityMeta] = useState({ total: 0, pages: 1 });
  const [qualityLoading, setQualityLoading] = useState(key === 'quality');

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
  const [billingLoading, setBillingLoading] = useState(key === 'billing');

  const [flagsData, setFlagsData] = useState<FlagRow[]>([]);
  const [flagsLoading, setFlagsLoading] = useState(key === 'flags');

  const [promptsData, setPromptsData] = useState<AdminPromptRow[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(key === 'prompts');

  const [auditData, setAuditData] = useState<AdminAuditRow[]>([]);
  const [auditMeta, setAuditMeta] = useState<AdminMeta>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [auditPage, setAuditPage] = useState(1);
  const [auditLoading, setAuditLoading] = useState(key === 'audit');

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
  const [paymentOrdersData, setPaymentOrdersData] = useState<
    import('@/src/services/admin/adminService').PaymentOrder[]
  >([]);
  const [paymentOrdersMeta, setPaymentOrdersMeta] = useState({ total: 0, pages: 1 });
  const [paymentOrdersLoading, setPaymentOrdersLoading] = useState(false);
  const [paymentOrdersPage, setPaymentOrdersPage] = useState(1);
  const [filterOrderStatus, setFilterOrderStatus] = useState('');

  // Catalog state
  const [catalogGrades, setCatalogGrades] = useState<
    { id: string; label: string; status: string; jenjang?: string }[]
  >([]);
  const [catalogSubjects, setCatalogSubjects] = useState<
    { id: string; label: string; status: string }[]
  >([]);
  const [catalogSelectedGrade, setCatalogSelectedGrade] = useState<string>('');
  const [catalogLoading, setCatalogLoading] = useState(key === 'catalog');
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
  const [signalsData, setSignalsData] = useState<
    {
      prompt_template_id: string;
      pattern: string;
      frequency: number;
      avg_rating: number;
      suggested_action: string;
    }[]
  >([]);
  const [signalsLoading, setSignalsLoading] = useState(key === 'learning-signals');

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
  const requestAccounts = useCallback(
    (
      currentPage: number,
      searchVal: string,
      roleVal: '' | AccountRow['role'],
      statusVal: '' | AccountRow['status'],
    ) => {
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
                pages:
                  val.meta.pages ??
                  Math.max(1, Math.ceil((val.meta.total ?? val.data.length) / 10)),
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
    },
    [],
  );

  const loadAccounts = useCallback(
    (currentPage = page, searchVal = search, roleVal = filterRole, statusVal = filterStatus) => {
      setAccountsLoading(true);
      requestAccounts(currentPage, searchVal, roleVal, statusVal);
    },
    [filterRole, filterStatus, page, requestAccounts, search],
  );

  const requestSchools = useCallback(
    (currentPage: number, searchVal: string, planVal: '' | SchoolRow['plan']) => {
      adminService
        .schools({
          q: searchVal || undefined,
          plan: planVal || undefined,
          page: currentPage,
          limit: 10,
        })
        .then((res) => {
          if (res.ok) {
            const val = res.value as {
              data: SchoolRow[];
              meta: { total: number; pages: number };
            };
            setSchoolsData(val.data ?? []);
            setSchoolsMeta({ total: val.meta?.total ?? 0, pages: val.meta?.pages ?? 1 });
          }
          setSchoolsLoading(false);
        });
    },
    [],
  );

  const loadSchools = useCallback(
    (currentPage = schoolsPage, searchVal = search, planVal = filterPlan) => {
      setSchoolsLoading(true);
      requestSchools(currentPage, searchVal, planVal);
    },
    [filterPlan, requestSchools, schoolsPage, search],
  );

  const requestJobs = useCallback(
    (currentPage: number, searchVal: string, statusVal: '' | JobRow['status']) => {
      adminService
        .jobs({
          q: searchVal || undefined,
          status: statusVal || undefined,
          page: currentPage,
          limit: 20,
        })
        .then((res) => {
          if (res.ok) {
            const val = res.value as {
              data: JobRow[];
              meta: { total: number; pages: number };
            };
            setJobsData(val.data ?? []);
            setJobsMeta({ total: val.meta?.total ?? 0, pages: val.meta?.pages ?? 1 });
          }
          setJobsLoading(false);
        });
    },
    [],
  );

  const loadJobs = useCallback(
    (currentPage = jobsPage, searchVal = search, statusVal = filterJobStatus) => {
      setJobsLoading(true);
      requestJobs(currentPage, searchVal, statusVal);
    },
    [filterJobStatus, jobsPage, requestJobs, search],
  );

  const requestQuality = useCallback(
    (currentPage: number, searchVal: string, statusVal: '' | QualityRow['status']) => {
      adminService
        .qualityReports({
          status: statusVal || undefined,
          q: searchVal || undefined,
          page: currentPage,
          limit: 20,
        })
        .then((res) => {
          if (res.ok) {
            const val = res.value as {
              data: QualityRow[];
              meta: { total: number; pages: number };
            };
            setQualityData(val.data ?? []);
            setQualityMeta({ total: val.meta?.total ?? 0, pages: val.meta?.pages ?? 1 });
          }
          setQualityLoading(false);
        });
    },
    [],
  );

  const loadQuality = useCallback(
    (currentPage = qualityPage, searchVal = search, statusVal = filterQuality) => {
      setQualityLoading(true);
      requestQuality(currentPage, searchVal, statusVal);
    },
    [filterQuality, qualityPage, requestQuality, search],
  );

  const requestBilling = useCallback(
    (stateFilter: '' | BillingRow['state'], searchVal: string, currentPage: number) => {
      adminService
        .billing({
          state: stateFilter || undefined,
          q: searchVal || undefined,
          page: currentPage,
          limit: 10,
        })
        .then((res) => {
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
    },
    [],
  );

  const loadBilling = useCallback(
    (stateFilter = filterBilling, searchVal = search, currentPage = billingPage) => {
      setBillingLoading(true);
      requestBilling(stateFilter, searchVal, currentPage);
    },
    [billingPage, filterBilling, requestBilling, search],
  );

  const requestPaymentOrders = useCallback((statusFilter: string, currentPage: number) => {
    adminService
      .paymentOrders({ status: statusFilter || undefined, page: currentPage, limit: 20 })
      .then((res) => {
        if (res.ok) {
          const val = res.value as any;
          setPaymentOrdersData(Array.isArray(val) ? val : (val?.data ?? []));
          setPaymentOrdersMeta(val?.meta ?? { total: 0, pages: 1 });
        }
        setPaymentOrdersLoading(false);
      });
  }, []);

  const loadPaymentOrders = useCallback(
    (statusFilter = filterOrderStatus, currentPage = paymentOrdersPage) => {
      setPaymentOrdersLoading(true);
      requestPaymentOrders(statusFilter, currentPage);
    },
    [filterOrderStatus, paymentOrdersPage, requestPaymentOrders],
  );

  const requestFlags = useCallback(() => {
    adminService.flags().then((res) => {
      if (res.ok) setFlagsData(res.value);
      setFlagsLoading(false);
    });
  }, []);

  const loadFlags = useCallback(() => {
    setFlagsLoading(true);
    requestFlags();
  }, [requestFlags]);

  const requestPrompts = useCallback((status?: AdminPromptRow['status']) => {
    adminService.prompts({ status }).then((res) => {
      if (res.ok) {
        const val = res.value as AdminPromptRow[] | { data?: AdminPromptRow[] };
        setPromptsData(Array.isArray(val) ? val : (val.data ?? []));
      }
      setPromptsLoading(false);
    });
  }, []);

  const loadPrompts = useCallback(
    (status?: AdminPromptRow['status']) => {
      setPromptsLoading(true);
      requestPrompts(status);
    },
    [requestPrompts],
  );

  const requestAudit = useCallback((currentPage: number) => {
    adminService.auditLogs({ page: currentPage, limit: 20 }).then((res) => {
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
  }, []);

  const loadAudit = useCallback(
    (currentPage: number) => {
      setAuditLoading(true);
      requestAudit(currentPage);
    },
    [requestAudit],
  );

  // ── Fetch on section/query change ─────────────────────────────────────
  useEffect(() => {
    if (key === 'accounts') {
      requestAccounts(page, search, filterRole, filterStatus);
    }
  }, [filterRole, filterStatus, key, page, requestAccounts, search]);

  useEffect(() => {
    if (key === 'schools') {
      requestSchools(schoolsPage, search, filterPlan);
    }
  }, [filterPlan, key, requestSchools, schoolsPage, search]);

  useEffect(() => {
    if (key === 'jobs') {
      requestJobs(jobsPage, search, filterJobStatus);
    }
  }, [filterJobStatus, jobsPage, key, requestJobs, search]);

  useEffect(() => {
    if (key === 'quality') {
      requestQuality(qualityPage, search, filterQuality);
    }
  }, [filterQuality, key, qualityPage, requestQuality, search]);

  useEffect(() => {
    if (key === 'billing') {
      requestBilling(filterBilling, search, billingPage);
    }
  }, [billingPage, filterBilling, key, requestBilling, search]);

  useEffect(() => {
    if (key === 'billing' && billingTab === 'orders') {
      requestPaymentOrders(filterOrderStatus, paymentOrdersPage);
    }
  }, [billingTab, filterOrderStatus, key, paymentOrdersPage, requestPaymentOrders]);

  useEffect(() => {
    if (key === 'flags') requestFlags();
  }, [key, requestFlags]);

  useEffect(() => {
    if (key === 'prompts') requestPrompts();
  }, [key, requestPrompts]);

  useEffect(() => {
    if (key === 'catalog') {
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

  useEffect(() => {
    if (key === 'learning-signals') {
      adminService.learningSignals().then((res) => {
        if (res.ok) {
          const val = res.value as any;
          setSignalsData(Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : []);
        }
        setSignalsLoading(false);
      });
    }
  }, [key]);

  useEffect(() => {
    if (key === 'audit') requestAudit(auditPage);
  }, [auditPage, key, requestAudit]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (key === 'accounts') {
      setPage(1);
      setAccountsLoading(true);
    } else if (key === 'schools') {
      setSchoolsPage(1);
      setSchoolsLoading(true);
    } else if (key === 'jobs') {
      setJobsPage(1);
      setJobsLoading(true);
    } else if (key === 'quality') {
      setQualityPage(1);
      setQualityLoading(true);
    } else if (key === 'billing') {
      setBillingPage(1);
      setBillingLoading(true);
    }
  };

  const handleFilterRoleChange = (value: '' | AccountRow['role']) => {
    setFilterRole(value);
    setPage(1);
    setAccountsLoading(true);
  };

  const handleFilterStatusChange = (value: '' | AccountRow['status']) => {
    setFilterStatus(value);
    setPage(1);
    setAccountsLoading(true);
  };

  const handleFilterPlanChange = (value: '' | SchoolRow['plan']) => {
    setFilterPlan(value);
    setSchoolsPage(1);
    setSchoolsLoading(true);
  };

  const handleFilterJobStatusChange = (value: '' | JobRow['status']) => {
    setFilterJobStatus(value);
    setJobsPage(1);
    setJobsLoading(true);
  };

  const handleFilterQualityChange = (value: '' | QualityRow['status']) => {
    setFilterQuality(value);
    setQualityPage(1);
    setQualityLoading(true);
  };

  const handleFilterBillingChange = (value: '' | BillingRow['state']) => {
    setFilterBilling(value);
    setBillingPage(1);
    setBillingLoading(true);
  };

  const handleBillingTabChange = (tab: 'langganan' | 'orders') => {
    if (tab === billingTab) return;
    setBillingTab(tab);
    if (tab === 'orders') setPaymentOrdersLoading(true);
  };

  const handleOrderStatusChange = (status: string) => {
    if (status === filterOrderStatus && paymentOrdersPage === 1) {
      loadPaymentOrders(status, 1);
      return;
    }
    setFilterOrderStatus(status);
    setPaymentOrdersPage(1);
    setPaymentOrdersLoading(true);
  };

  const handleAccountsPageChange = (nextPage: number) => {
    setPage(nextPage);
    setAccountsLoading(true);
  };

  const handleSchoolsPageChange = (nextPage: number) => {
    setSchoolsPage(nextPage);
    setSchoolsLoading(true);
  };

  const handleJobsPageChange = (nextPage: number) => {
    setJobsPage(nextPage);
    setJobsLoading(true);
  };

  const handleQualityPageChange = (nextPage: number) => {
    setQualityPage(nextPage);
    setQualityLoading(true);
  };

  const handleBillingPageChange = (nextPage: number) => {
    setBillingPage(nextPage);
    setBillingLoading(true);
  };

  const handlePaymentOrdersPageChange = (nextPage: number) => {
    setPaymentOrdersPage(nextPage);
    setPaymentOrdersLoading(true);
  };

  const handleAuditPageChange = (nextPage: number) => {
    setAuditPage(nextPage);
    setAuditLoading(true);
  };

  // ── Impersonate Action ────────────────────────────────────────────────
  const handleImpersonate = (row: AccountRow) => {
    setImpersonatingId(row.id);
    setToast(`Memulai impersonasi sebagai ${row.displayName}...`);
    adminService.impersonateAccount(row.id).then((res) => {
      if (res.ok) {
        setToast(
          `Impersonasi ${res.value.targetName || res.value.targetEmail} berhasil. Mengalihkan...`,
        );
        setTimeout(() => {
          window.location.href = res.value.homePath;
        }, 300);
      } else {
        setToast(`Gagal: ${res.error.safeMessage}`);
        setImpersonatingId(null);
      }
    });
  };

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
          setSearch={handleSearchChange}
          filterRole={filterRole}
          setFilterRole={handleFilterRoleChange}
          filterStatus={filterStatus}
          setFilterStatus={handleFilterStatusChange}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          toggleSelectedId={toggleSelectedId}
          clearSelection={clearSelection}
          accounts={accounts}
          accountsData={accountsData}
          accountsMeta={accountsMeta}
          page={page}
          setPage={handleAccountsPageChange}
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
          setSearch={handleSearchChange}
          filterPlan={filterPlan}
          setFilterPlan={handleFilterPlanChange}
          schools={schools}
          schoolsPage={schoolsPage}
          setSchoolsPage={handleSchoolsPageChange}
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
          setSearch={handleSearchChange}
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
          setJobsPage={handleJobsPageChange}
          jobsMeta={jobsMeta}
          jobDetailId={jobDetailId}
          setJobDetailId={setJobDetailId}
          jobDetailData={jobDetailData}
          setJobDetailData={setJobDetailData}
          jobDetailLoading={jobDetailLoading}
          setJobDetailLoading={setJobDetailLoading}
          search={search}
          setSearch={handleSearchChange}
          filterJobStatus={filterJobStatus}
          setFilterJobStatus={handleFilterJobStatusChange}
          loadJobs={loadJobs}
          setToast={setToast}
        />
      ) : null}

      {key === 'quality' ? (
        <OpsQualitySection
          quality={quality}
          qualityLoading={qualityLoading}
          qualityPage={qualityPage}
          setQualityPage={handleQualityPageChange}
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
          setSearch={handleSearchChange}
          filterQuality={filterQuality}
          setFilterQuality={handleFilterQualityChange}
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
          setAuditPage={handleAuditPageChange}
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
          setBillingPage={handleBillingPageChange}
          billingTab={billingTab}
          setBillingTab={handleBillingTabChange}
          paymentOrdersData={paymentOrdersData}
          paymentOrdersMeta={paymentOrdersMeta}
          paymentOrdersLoading={paymentOrdersLoading}
          paymentOrdersPage={paymentOrdersPage}
          setPaymentOrdersPage={handlePaymentOrdersPageChange}
          filterOrderStatus={filterOrderStatus}
          setFilterOrderStatus={handleOrderStatusChange}
          search={search}
          setSearch={handleSearchChange}
          filterBilling={filterBilling}
          setFilterBilling={handleFilterBillingChange}
          loadBilling={loadBilling}
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
          setSearch={handleSearchChange}
          loadFlags={loadFlags}
          setToast={setToast}
        />
      ) : null}

      {key === 'content' ? <OpsContentSection setToast={setToast} /> : null}

      {key === 'learning-signals' ? (
        <OpsLearningSignalsSection
          signalsData={signalsData}
          setSignalsData={setSignalsData}
          signalsLoading={signalsLoading}
          setSignalsLoading={setSignalsLoading}
        />
      ) : null}

      {key === 'profile' ? <OpsProfileSection setToast={setToast} /> : null}

      {key === 'ai-provider' ? <OpsAiProviderSection setToast={setToast} /> : null}

      {key === 'plans' ? <OpsPlanHargaSection setToast={setToast} /> : null}

      {key === 'wa-gateway' ? <OpsWaGatewaySection setToast={setToast} /> : null}

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
        'plans',
        'flags',
        'content',
        'profile',
        'ai-provider',
        'wa-gateway',
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
