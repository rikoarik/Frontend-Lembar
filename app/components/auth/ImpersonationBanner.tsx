'use client';

import { useState, useEffect } from 'react';

function readCookie(name: string) {
  const match = document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

export function ImpersonationBanner() {
  const [impersonatedName, setImpersonatedName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (readCookie('lembar_is_impersonating') !== '1') return;
    setImpersonatedName(readCookie('lembar_impersonated_name') || 'Pengguna Impersonasi');
  }, []);

  if (!impersonatedName) return null;

  const handleExit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/v1/admin/unimpersonate', { method: 'POST' });
      const payload = (await response.json().catch(() => null)) as { data?: { targetPath?: string } } | null;
      window.location.href = payload?.data?.targetPath || '/ops';
    } catch {
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
        {loading ? 'Mengakhiri...' : 'Kembali ke admin'}
      </button>
    </div>
  );
}
