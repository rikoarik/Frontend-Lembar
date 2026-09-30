'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/app/components/ui';
import { AdminAvatar, AdminPill, AdminConfirmModal } from '@/src/features/admin/AdminChrome';

type ProfileAccount = {
  displayName?: string;
  email?: string;
};

type SessionClaims = {
  issuedAt: number | null;
  expiresAt: number | null;
  source: 'jwt' | 'mock' | 'opaque' | 'unparsable';
};

const ROLE_LABEL: Record<string, string> = {
  teacher: 'Guru',
  school_admin: 'Admin Sekolah',
  superadmin: 'Superadmin',
  subscriber: 'Pelanggan',
};

function formatDateTime(seconds: number | null): string {
  if (seconds === null) return '—';
  return new Date(seconds * 1000).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function OpsProfileSection({ setToast }: { setToast: (msg: string) => void }) {
  const router = useRouter();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [account, setAccount] = useState<ProfileAccount | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [claims, setClaims] = useState<SessionClaims | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadIdentity = useCallback(async () => {
    setLoadError('');
    try {
      const [meRes, sessionRes] = await Promise.all([
        fetch('/v1/me', { credentials: 'include', headers: { Accept: 'application/json' } }),
        fetch('/v1/me/session', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        }),
      ]);
      if (!meRes.ok) throw new Error('Gagal memuat identitas sesi. Silakan masuk ulang.');
      const meBody = (await meRes.json()) as {
        data?: {
          account?: ProfileAccount;
          activeWorkspace?: { role?: string; permissions?: string[] };
        };
      };
      setAccount(meBody.data?.account ?? null);
      setRole(meBody.data?.activeWorkspace?.role ?? null);
      setPermissions(
        Array.isArray(meBody.data?.activeWorkspace?.permissions)
          ? (meBody.data?.activeWorkspace?.permissions as string[])
          : [],
      );
      if (sessionRes.ok) {
        const sessionBody = (await sessionRes.json()) as { data?: SessionClaims };
        setClaims(sessionBody.data ?? null);
      } else {
        setClaims(null);
      }
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : 'Gagal memuat profil sesi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // The async identity fetch owns this component's request state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadIdentity();
  }, [loadIdentity]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await fetch('/v1/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore network errors on logout
    } finally {
      router.replace('/masuk');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-1 py-1">
        <h2 className="text-[18px] font-bold text-[#171717]">Profil Sesi</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Detail Akun */}
        <div className="space-y-4 rounded-2xl border border-[#ddd4c8]/80 bg-white p-6 shadow-[0_2px_12px_rgba(23,23,23,0.01)]">
          <h3 className="text-[14px] font-bold text-[#171717] border-b border-[#eee6da]/60 pb-2.5">
            Detail Akun
          </h3>
          {loadError ? (
            <div role="alert" className="rounded-xl border border-[#e6b3b3] bg-[#fdf2f2] px-4 py-3">
              <div className="text-[12px] text-[#a3202b]">{loadError}</div>
              <Button
                size="sm"
                variant="secondary"
                className="mt-2"
                onClick={() => void loadIdentity()}
              >
                Coba lagi
              </Button>
            </div>
          ) : null}
          <div className="flex items-center gap-4">
            <AdminAvatar name={account?.displayName || 'Pengguna'} size="lg" />
            <div>
              <div className="text-[16px] font-bold text-[#171717]">
                {loading ? 'Memuat…' : (account?.displayName ?? '—')}
              </div>
              <div className="text-[12px] text-[#57534e]">
                {loading ? '—' : (account?.email ?? '—')}
              </div>
              <div className="mt-1.5">
                <AdminPill tone="ok">{role ? (ROLE_LABEL[role] ?? role) : '—'}</AdminPill>
              </div>
            </div>
          </div>
          <div className="border-t border-[#eee6da]/60 pt-4 space-y-2.5 text-[12px]">
            <div className="flex justify-between items-center">
              <span className="text-[#57534e]">Akses Hak</span>
              <span className="font-semibold text-brand-accent text-right max-w-[65%]">
                {permissions.length ? permissions.join(' · ') : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#57534e]">Masa Berlaku Sesi</span>
              <span className="font-medium text-[#171717]">
                {loading
                  ? '—'
                  : claims?.expiresAt
                    ? `s.d. ${formatDateTime(claims.expiresAt)}`
                    : 'Selamanya'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#57534e]">Metode Autentikasi</span>
              <span className="font-medium text-[#171717]">JWT Multi-role</span>
            </div>
          </div>
        </div>

        {/* Informasi Sesi & Keamanan */}
        <div className="space-y-4 rounded-2xl border border-[#ddd4c8]/80 bg-white p-6 shadow-[0_2px_12px_rgba(23,23,23,0.01)]">
          <h3 className="text-[14px] font-bold text-[#171717] border-b border-[#eee6da]/60 pb-2.5">
            Informasi Sesi Client
          </h3>
          <div className="space-y-2.5 text-[12px]">
            <div className="flex justify-between items-center">
              <span className="text-[#57534e]">Browser</span>
              <span className="font-medium text-[#171717] text-right max-w-[60%] truncate">
                {typeof navigator !== 'undefined'
                  ? (navigator.userAgent.match(/Chrome\/[\d.]+/)?.[0] ??
                    navigator.userAgent.match(/Firefox\/[\d.]+/)?.[0] ??
                    navigator.userAgent.match(/Safari\/[\d.]+/)?.[0] ??
                    'Browser')
                  : 'Browser'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#57534e]">Platform</span>
              <span className="font-medium text-[#171717]">
                {typeof navigator !== 'undefined' ? navigator.platform || 'Web' : 'Web'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#57534e]">Zona Waktu</span>
              <span className="font-medium text-[#171717]">
                {typeof Intl !== 'undefined'
                  ? Intl.DateTimeFormat().resolvedOptions().timeZone
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#57534e]">Sesi Aktif Sejak</span>
              <span className="font-medium text-[#171717]">
                {loading ? '—' : formatDateTime(claims?.issuedAt ?? null)}
              </span>
            </div>
          </div>
          <div className="border-t border-[#eee6da]/60 pt-4 space-y-2">
            <Button
              size="sm"
              variant="danger"
              className="w-full inline-flex items-center justify-center gap-1.5"
              onClick={() => setLogoutConfirmOpen(true)}
            >
              <span className="material-symbols-outlined text-[16px] leading-none inline-flex items-center justify-center shrink-0 align-middle">
                logout
              </span>
              <span className="leading-none">Keluar Sesi</span>
            </Button>
          </div>
        </div>
      </div>

      <AdminConfirmModal
        open={logoutConfirmOpen}
        title="Keluar dari Sesi"
        description="Apakah Anda yakin ingin keluar dari sesi Superadmin saat ini?"
        confirmLabel="Ya, Keluar Sesi"
        cancelLabel="Batal"
        variant="danger"
        loading={logoutLoading}
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </>
  );
}
