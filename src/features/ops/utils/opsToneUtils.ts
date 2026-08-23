import type {
  AdminSchoolRow,
  AdminJobRow,
  AdminAccountRow,
  AdminBillingRow,
  AdminQualityRow,
} from '@/src/services/admin/adminService';

export function planTone(plan: AdminSchoolRow['plan']): 'ok' | 'warn' | 'bad' | 'info' | 'neutral' {
  if (plan === 'active' || plan === 'pilot') return 'ok';
  if (plan === 'grace') return 'warn';
  if (plan === 'blocked') return 'bad';
  return 'neutral';
}

export function jobTone(status: AdminJobRow['status']): 'ok' | 'warn' | 'bad' | 'info' | 'neutral' {
  if (status === 'succeeded') return 'ok';
  if (status === 'running') return 'info';
  if (status === 'queued') return 'neutral';
  return 'bad';
}

export function accountStatusTone(
  status: AdminAccountRow['status'],
): 'ok' | 'warn' | 'bad' | 'info' | 'neutral' {
  if (status === 'aktif') return 'ok';
  if (status === 'baru') return 'info';
  return 'warn';
}

export function billingTone(
  state: AdminBillingRow['state'],
): 'ok' | 'warn' | 'bad' | 'info' | 'neutral' {
  if (state === 'active') return 'ok';
  if (state === 'grace') return 'warn';
  if (state === 'blocked' || state === 'expired') return 'bad';
  return 'neutral';
}

export function qualityTone(
  status: AdminQualityRow['status'],
): 'ok' | 'warn' | 'bad' | 'info' | 'neutral' {
  if (status === 'open') return 'bad';
  if (status === 'triaged') return 'warn';
  return 'ok';
}
