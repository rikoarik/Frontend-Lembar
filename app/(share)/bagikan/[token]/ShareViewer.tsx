'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/app/components/ui';

type ShareState = 'loading' | 'valid' | 'revoked' | 'expired';

interface SharePackage {
  title: string;
  sheets: Array<{ id: string; label: string; url: string }>;
}

// Mock fetch until backend share API lands
async function fetchShare(token: string): Promise<{ state: ShareState; package?: SharePackage }> {
  await new Promise((r) => setTimeout(r, 600));
  
  // Mock routing based on token pattern for testing
  if (token === 'revoked-test') return { state: 'revoked' };
  if (token === 'expired-test') return { state: 'expired' };
  
  return {
    state: 'valid',
    package: {
      title: 'Ujian Matematika Kelas 7',
      sheets: [
        { id: 's1', label: 'Lembar Soal', url: '#' },
        { id: 's2', label: 'Kunci Jawaban', url: '#' },
      ],
    },
  };
}

export default function ShareViewer({ token }: { token: string }) {
  const [state, setState] = useState<ShareState>('loading');
  const [pkg, setPkg] = useState<SharePackage | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const result = await fetchShare(token);
      if (cancelled) return;
      setState(result.state);
      setPkg(result.package ?? null);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <div className="animate-pulse text-brand-muted text-body-sm">Memuat...</div>
        </div>
      </div>
    );
  }

  if (state === 'revoked') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <h1 className="text-body-xl font-semibold text-brand-ink mb-2">
            Tautan tidak tersedia
          </h1>
          <p className="text-body-sm text-brand-muted mb-4">
            Tautan berbagi ini telah dicabut oleh pembuat. Hubungi guru atau tim Anda untuk
            akses ulang.
          </p>
        </div>
      </div>
    );
  }

  if (state === 'expired') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <h1 className="text-body-xl font-semibold text-brand-ink mb-2">
            Tautan kedaluwarsa
          </h1>
          <p className="text-body-sm text-brand-muted mb-4">
            Tautan berbagi ini sudah tidak berlaku. Hubungi pembuat untuk tautan baru.
          </p>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <h1 className="text-body-xl font-semibold text-brand-ink mb-2">
            Konten tidak tersedia
          </h1>
          <p className="text-body-sm text-brand-muted mb-4">
            Paket berbagi tidak ditemukan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="text-brand-ink font-semibold text-body-xl mb-1">{pkg.title}</h1>
        <p className="text-body-sm text-brand-muted">Paket lembar kerja dibagikan untuk Anda</p>
      </div>

      <div className="flex flex-col gap-3">
        {pkg.sheets.map((sheet) => (
          <div
            key={sheet.id}
            className="flex items-center justify-between border border-brand-line rounded-md p-4 bg-brand-paper"
          >
            <span className="text-body-sm text-brand-ink">{sheet.label}</span>
            <Button
              variant="quiet"
              size="sm"
              onClick={() => {
                // Mock: open in new tab when backend PDF API lands
                window.open(sheet.url, '_blank', 'noopener,noreferrer');
              }}
            >
              Lihat
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-brand-line text-center">
        <p className="text-body-xs text-brand-muted">
          Dibuat dengan <span className="font-medium">lembar</span>
        </p>
      </div>
    </div>
  );
}
