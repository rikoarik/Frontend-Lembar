'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/app/components/ui';
import { AdminAvatar, AdminPill, AdminConfirmModal } from '@/src/features/admin/AdminChrome';

export function OpsProfileSection({ setToast }: { setToast: (msg: string) => void }) {
  const router = useRouter();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () =>
        setSessionStartedAt(
          new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
        ),
      0,
    );
    return () => window.clearTimeout(timer);
  }, []);

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
          <div className="flex items-center gap-4">
            <AdminAvatar name="Ops Superadmin" size="lg" />
            <div>
              <div className="text-[16px] font-bold text-[#171717]">Ops Superadmin</div>
              <div className="text-[12px] text-[#57534e]">ops@lembar.id</div>
              <div className="mt-1.5">
                <AdminPill tone="ok">superadmin</AdminPill>
              </div>
            </div>
          </div>
          <div className="border-t border-[#eee6da]/60 pt-4 space-y-2.5 text-[12px]">
            <div className="flex justify-between items-center">
              <span className="text-[#57534e]">Akses Hak</span>
              <span className="font-semibold text-brand-accent">FULL_CONTROL</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#57534e]">Masa Berlaku Sesi</span>
              <span className="font-medium text-[#171717]">Selamanya</span>
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
              <span className="font-medium text-[#171717]">{sessionStartedAt ?? '—'}</span>
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
