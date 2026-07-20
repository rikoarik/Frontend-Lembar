import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Selamat datang — lembar',
  robots: { index: false },
};

/**
 * F2-02: Personal onboarding screen.
 * Shown when /v1/me returns no activeWorkspace (new account, no workspace yet).
 * User enters an atomic personal workspace without invented profile data.
 */
export default function OnboardingPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-brand-paper px-margin-mobile md:px-margin-desktop"
      data-testid="onboarding-screen"
    >
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-h1 font-bold text-brand-ink mb-3">
            Selamat datang di lembar
          </h1>
          <p className="text-body-default text-brand-ink-muted">
            Akun Anda sudah siap. Workspace pribadi Anda akan dibuat secara otomatis saat Anda
            mulai menggunakan aplikasi.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/app"
            className="inline-flex min-h-[var(--control-md)] w-full items-center justify-center rounded-md bg-brand-accent px-5 text-body-default font-medium text-white hover:bg-brand-accent-h transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            data-testid="onboarding-cta"
          >
            Mulai sekarang
          </Link>
          <Link
            href="/bantuan"
            className="inline-flex min-h-[var(--control-md)] w-full items-center justify-center rounded-md border border-brand-line px-5 text-body-default font-medium text-brand-ink hover:bg-brand-surface transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Lihat panduan
          </Link>
        </div>
      </div>
    </div>
  );
}
