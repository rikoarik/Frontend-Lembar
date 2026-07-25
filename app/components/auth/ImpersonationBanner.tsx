'use client';

import { useEffect, useState } from 'react';

export function ImpersonationBanner() {
  const [impersonatedName, setImpersonatedName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const cookies = document.cookie.split(';').map((c) => c.trim());
    const hasImpersonator = cookies.some((c) => c.startsWith('lembar_impersonator='));
    const nameCookie = cookies.find((c) => c.startsWith('lembar_impersonated_name='));

    if (hasImpersonator || nameCookie) {
      const val = nameCookie ? decodeURIComponent(nameCookie.split('=')[1] ?? '') : 'Pengguna Impersonasi';
      setImpersonatedName(val || 'Pengguna Impersonasi');
    } else {
      setImpersonatedName(null);
    }
  }, []);

  if (!impersonatedName) return null;

  const handleExit = async () => {
    setLoading(true);
    try {
      await fetch('/v1/admin/unimpersonate', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      window.location.href = '/ops';
    }
  };

  return (
    <div className="relative z-50 flex items-center justify-between border-b border-amber-300 bg-amber-500/90 px-4 py-2 text-xs font-semibold text-amber-950 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-amber-900 animate-ping" />
        <span>
          ⚠️ <strong>MODUS IMPERSONASI:</strong> Anda sedang melihat & bertindak atas nama{' '}
          <u className="font-bold">{impersonatedName}</u>.
        </span>
      </div>
      <button
        onClick={handleExit}
        disabled={loading}
        className="rounded-md bg-amber-950 px-3 py-1 text-[11px] font-bold text-amber-100 transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-amber-950"
      >
        {loading ? 'Mengakhiri...' : 'Akhiri Impersonasi (Kembali ke /ops)'}
      </button>
    </div>
  );
}
