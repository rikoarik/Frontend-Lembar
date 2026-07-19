import Link from 'next/link';
import { Button, Panel } from '@/app/components/ui';

export function ShellLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" aria-busy="true">
      <Panel className="min-h-48 animate-pulse" aria-hidden="true">
        <div className="space-y-3">
          <div className="h-5 w-32 rounded bg-brand-paper" />
          <div className="h-10 w-full rounded bg-brand-paper" />
          <div className="h-10 w-3/4 rounded bg-brand-paper" />
        </div>
      </Panel>
      <Panel className="min-h-48 animate-pulse" aria-hidden="true">
        <div className="space-y-3">
          <div className="h-5 w-24 rounded bg-brand-paper" />
          <div className="h-8 w-full rounded bg-brand-paper" />
          <div className="h-8 w-full rounded bg-brand-paper" />
        </div>
      </Panel>
    </div>
  );
}

export function ShellError({ requestId }: { requestId?: string }) {
  return (
    <Panel
      title="Workspace belum bisa dimuat"
      description="Coba muat ulang. Jika masih gagal, bagikan ID permintaan ke tim bantuan."
      className="max-w-reading-max"
    >
      <div className="flex flex-col gap-3">
        <p className="text-body-default text-brand-ink-muted">
          {requestId ? `ID permintaan: ${requestId}` : 'ID permintaan belum tersedia.'}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => window.location.reload()}>Muat ulang</Button>
          <Link href="/bantuan" className="inline-flex items-center text-body-default text-brand-accent underline underline-offset-4">
            Buka bantuan
          </Link>
        </div>
      </div>
    </Panel>
  );
}

export function ShellNotFound() {
  return (
    <Panel
      title="Halaman tidak ditemukan"
      description="Periksa kembali tautan atau kembali ke dashboard workspace aktif."
      className="max-w-reading-max"
    >
      <div className="flex flex-wrap gap-3">
        <Link href="/app" className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-body-default font-medium text-white">
          Kembali ke dashboard
        </Link>
        <Link href="/app/riwayat" className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 text-body-default text-brand-ink">
          Buka riwayat
        </Link>
      </div>
    </Panel>
  );
}

export function ShellForbidden() {
  return (
    <Panel
      title="Akses belum tersedia"
      description="Peran di workspace ini belum membuka halaman yang diminta. Ganti workspace atau hubungi admin sekolah."
      className="max-w-reading-max"
    >
      <div className="flex flex-wrap gap-3">
        <Link href="/app" className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-body-default font-medium text-white">
          Kembali ke dashboard
        </Link>
        <Link href="/bantuan" className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 text-body-default text-brand-ink">
          Hubungi bantuan
        </Link>
      </div>
    </Panel>
  );
}
