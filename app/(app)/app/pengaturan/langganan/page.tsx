'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useTranslations } from 'next-intl';
import { Panel, Button } from '@/app/components/ui';
import { formatPrice, formatTokenLimit } from '@/src/lib/api/plans';
import type { MePlanData, PublicPlan } from '@/src/lib/api/plans';
import { useLocaleFormat } from '@/src/i18n/useLocaleFormat';

type EntitlementState = 'free' | 'active' | 'grace' | 'blocked' | 'expired';

const WA_LINK = 'https://wa.me/6285784255112';
const UPGRADE_OPTIONS = ['pro', 'plus'] as const;

function TokenMeter({ used, limit }: { used: number; limit: number | null }) {
  const t = useTranslations('subscription.token');
  const { number } = useLocaleFormat();
  if (limit === null) {
    return (
      <div className="flex flex-col gap-1.5" aria-label={t('unlimitedAria')}>
        <div className="flex justify-between text-body-xs text-brand-muted">
          <span>{t('usedThisMonth')}</span>
          <span>
            {number(used)} / {t('unlimited')}
          </span>
        </div>
      </div>
    );
  }
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const isHigh = pct >= 80;
  return (
    <div
      className="flex flex-col gap-1.5"
      aria-label={t('usedAria', {
        used: number(used),
        limit: number(limit),
      })}
    >
      <div className="flex justify-between text-body-xs text-brand-muted">
        <span>{t('usedThisMonth')}</span>
        <span>
          {number(used)} / {number(limit)}
        </span>
      </div>
      <div
        className="h-2 rounded-full bg-brand-line overflow-hidden"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-label={t('percentAria', { percent: pct })}
      >
        <div
          className={`h-full rounded-full transition-all ${isHigh ? 'bg-amber-500' : 'bg-brand-accent'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function PlanUsageSettingsPage() {
  const t = useTranslations('subscription');
  const { dateTime, number } = useLocaleFormat();
  const [plan, setPlan] = useState<MePlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');
  const [upgradePlan, setUpgradePlan] = useState<'pro' | 'plus'>('pro');
  const [catalog, setCatalog] = useState<PublicPlan[]>([]);
  const [checkout, setCheckout] = useState<{
    qrImage: string;
    paymentUrl: string;
    totalPayment: number;
    expiredAt: string | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/v1/me/plan', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(t('error.load'));
        return res.json() as Promise<{ data: MePlanData }>;
      })
      .then((json) => {
        if (cancelled) return;
        setPlan(json.data);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message || t('error.load'));
        setLoading(false);
      });
    // Upgrade prices are commercial data owned by the plan catalog. They are
    // fetched at runtime and never hardcoded in the message catalogs
    // (docs/product/PRD.md §16, decision D-009).
    fetch('/v1/public/plans')
      .then((res) => (res.ok ? (res.json() as Promise<{ data?: PublicPlan[] }>) : null))
      .then((json) => {
        if (cancelled || !json) return;
        setCatalog(Array.isArray(json.data) ? json.data : []);
      })
      .catch(() => {
        // Without a catalog the price slot stays neutral instead of showing a stale number.
      });
    return () => {
      cancelled = true;
    };
    // The translator identity is stable per locale; re-fetching on every render is not desired.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    setUpgradeError('');
    try {
      // orderId is a client-generated idempotency key; amount is always derived server-side
      const orderId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const res = await fetch('/v1/payment/pakasir/create-order', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, toPlan: upgradePlan }),
      });
      const json = (await res.json()) as {
        paymentUrl?: string;
        qrString?: string;
        totalPayment?: number;
        expiredAt?: string | null;
        error?: { code?: string; message?: string };
      };
      if (res.ok && json.paymentUrl && json.qrString) {
        const qrImage = await QRCode.toDataURL(json.qrString, {
          width: 320,
          margin: 2,
          color: { dark: '#1e1814', light: '#ffffff' },
          errorCorrectionLevel: 'M',
        });
        setCheckout({
          qrImage,
          paymentUrl: json.paymentUrl,
          totalPayment: json.totalPayment ?? 0,
          expiredAt: json.expiredAt ?? null,
        });
        return;
      }
      const code = json.error?.code ?? '';
      if (code === 'PAYMENT_NOT_CONFIGURED') {
        setUpgradeError(t('upgrade.error.notConfigured'));
      } else {
        setUpgradeError(json.error?.message ?? t('upgrade.error.createOrder'));
      }
    } catch {
      setUpgradeError(t('upgrade.error.offline'));
    } finally {
      setUpgradeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-1">
          <h1 className="text-brand-ink font-semibold text-body-xl">{t('title')}</h1>
        </div>
        <div className="h-40 animate-pulse rounded-2xl bg-[#efe8dc]" aria-busy="true" />
        <div className="h-60 animate-pulse rounded-2xl bg-[#efe8dc]" aria-busy="true" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <h1 className="text-brand-ink font-semibold text-body-xl">{t('title')}</h1>
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          {error || t('error.unavailable')}
        </div>
      </div>
    );
  }

  const state: EntitlementState =
    plan.entitlementState ?? (plan.plan === 'free' ? 'free' : 'active');
  const planLabel =
    plan.catalog?.displayName ?? (plan.plan === 'free' ? t('fallbackPlanName') : plan.plan);
  const tokenLimit = plan.tokenMonthlyLimit ?? plan.catalog?.tokenMonthlyLimit ?? null;
  const tokenUsed = plan.tokenUsedThisMonth ?? 0;
  const isPaidPlan = plan.plan !== 'free';

  /**
   * Price for an upgrade option, read from the live catalog. Returns null when
   * the catalog has no active row for that plan, so the UI falls back to the
   * neutral "follows the catalog" copy instead of printing a stale number.
   */
  const upgradePrice = (option: 'pro' | 'plus'): string | null => {
    const entry = catalog.find((item) => item.key === option);
    if (!entry || entry.priceAmount <= 0) return null;
    return formatPrice(entry, number);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-brand-ink font-semibold text-body-xl">{t('title')}</h1>
        <p className="text-body-sm text-[#6d665d]">{t('description')}</p>
      </div>

      {/* Current plan status */}
      <Panel>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-body-lead text-brand-ink">
                {t(`states.${state}.heading`)}
              </p>
              <p className="text-body-sm text-[#6d665d] mt-0.5">{planLabel}</p>
            </div>
          </div>
          <p className="text-body-sm text-[#6d665d]">
            {t(`states.${state}.body`, { whatsapp: WA_LINK })}
          </p>
        </div>
      </Panel>

      {/* Token usage */}
      <Panel>
        <div className="flex flex-col gap-4">
          <p className="font-semibold text-body-lead text-brand-ink">{t('token.usageTitle')}</p>
          <TokenMeter used={tokenUsed} limit={tokenLimit} />
          <p className="text-body-xs text-[#6d665d]">
            {t('token.quotaNote', { quota: formatTokenLimit(tokenLimit, number) })}
          </p>
        </div>
      </Panel>

      {/* Upgrade section — only shown for free non-trial users */}
      {!isPaidPlan && plan.entitlementSource !== 'trial' && (
        <Panel>
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-semibold text-body-lead text-brand-ink">{t('upgrade.title')}</p>
              <p className="text-body-sm text-[#6d665d] mt-0.5">{t('upgrade.description')}</p>
            </div>
            <div
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              role="radiogroup"
              aria-label={t('upgrade.chooseAria')}
            >
              {UPGRADE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={upgradePlan === option}
                  onClick={() => setUpgradePlan(option)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    upgradePlan === option
                      ? 'border-brand-accent bg-brand-accent/5'
                      : 'border-[#e6dfd4] bg-white hover:bg-[#f3eee6]'
                  }`}
                >
                  <span className="block text-body-sm font-semibold text-brand-ink">
                    {t(`upgrade.plans.${option}.label`)}
                  </span>
                  <span className="block text-body-xs text-[#6d665d]">
                    {upgradePrice(option) ?? t('upgrade.priceFromCatalog')}
                  </span>
                </button>
              ))}
            </div>
            {upgradeError && (
              <div
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                role="alert"
              >
                <p>{upgradeError}</p>
                {upgradeError.includes('WhatsApp') && (
                  <Link
                    href={WA_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-red-800 underline"
                  >
                    {t('upgrade.error.contactWhatsapp')}
                  </Link>
                )}
              </div>
            )}
            <Button onClick={handleUpgrade} disabled={upgradeLoading}>
              {upgradeLoading
                ? t('upgrade.submitBusy')
                : t('upgrade.submit', { plan: t(`upgrade.plans.${upgradePlan}.label`) })}
            </Button>
            <p className="text-body-xs text-[#6d665d]">{t('upgrade.qrisNote')}</p>
          </div>
        </Panel>
      )}

      {checkout && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#1e1814]/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qris-title"
          onClick={() => setCheckout(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-[#e6dfd4] bg-[#fbf8f2] p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-accent">
                  {t('checkout.eyebrow')}
                </p>
                <h2 id="qris-title" className="mt-1 text-xl font-semibold text-brand-ink">
                  {t('checkout.title')}
                </h2>
                <p className="mt-1 text-sm text-[#6d665d]">{t('checkout.description')}</p>
              </div>
              <button
                type="button"
                onClick={() => setCheckout(null)}
                className="rounded-full border border-[#e6dfd4] bg-white px-3 py-1 text-sm text-[#6d665d]"
                aria-label={t('checkout.closeAria')}
              >
                {t('checkout.close')}
              </button>
            </div>

            <div className="mx-auto mt-5 w-fit rounded-2xl border border-[#e6dfd4] bg-white p-3 shadow-sm">
              {/* QR data stays local in the browser; it is never sent to an image service. */}
              <img src={checkout.qrImage} alt={t('checkout.qrAlt')} className="h-64 w-64" />
            </div>

            <div className="mt-5 rounded-2xl border border-[#e6dfd4] bg-white p-4 text-center">
              <p className="text-xs text-[#6d665d]">{t('checkout.totalLabel')}</p>
              <p className="mt-1 text-2xl font-bold text-brand-ink">
                {number(checkout.totalPayment, {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                })}
              </p>
              {checkout.expiredAt && (
                <p className="mt-1 text-xs text-[#6d665d]">
                  {t('checkout.expiresAt', { datetime: dateTime(checkout.expiredAt) })}
                </p>
              )}
            </div>

            <Link
              href={checkout.paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-white"
            >
              {t('checkout.openProvider')}
            </Link>
            <p className="mt-3 text-center text-xs text-[#6d665d]">
              {t('checkout.activationNote')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
