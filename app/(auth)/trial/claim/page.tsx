'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const STORED_TOKEN_KEY = 'lembar.trial.claim-token';

export default function TrialClaimHandoffPage() {
  const t = useTranslations('auth');
  const [message, setMessage] = useState(t('trial.checking'));

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const fragmentToken = params.get('token') ?? '';
      const storedToken = window.sessionStorage.getItem(STORED_TOKEN_KEY) ?? '';
      const claimToken = fragmentToken || storedToken;
      window.history.replaceState(null, '', window.location.pathname);

      if (claimToken.length < 32 || claimToken.length > 512) {
        window.sessionStorage.removeItem(STORED_TOKEN_KEY);
        setMessage(t('trial.invalid'));
        return;
      }

      window.sessionStorage.setItem(STORED_TOKEN_KEY, claimToken);
      const session = await fetch('/v1/me/plan', { credentials: 'include' }).catch(() => null);
      if (!session?.ok) {
        setMessage(t('trial.signIn'));
        window.location.replace('/masuk?next=%2Ftrial%2Fclaim');
        return;
      }

      window.sessionStorage.removeItem(STORED_TOKEN_KEY);
      window.location.replace(
        `/app/pengaturan/langganan/trial/konfirmasi#token=${encodeURIComponent(claimToken)}`,
      );
    };

    void run();
  }, [t]);

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#f3eee6] px-4">
      <section className="w-full max-w-md rounded-2xl border border-[#ddd4c8] bg-white p-6 text-center shadow-sm">
        <span className="material-symbols-outlined text-3xl text-brand-accent" aria-hidden="true">
          verified_user
        </span>
        <h1 className="mt-3 text-body-xl font-semibold text-brand-ink">{t('trial.title')}</h1>
        <p className="mt-2 text-body-sm text-[#6d665d]" role="status">
          {message}
        </p>
      </section>
    </main>
  );
}
