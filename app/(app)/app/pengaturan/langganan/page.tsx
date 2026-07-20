'use client';

import { useState } from 'react';
import { Panel, Button } from '@/app/components/ui';

type EntitlementState = 'active' | 'grace' | 'blocked' | 'expired';

interface PlanMock {
  state: EntitlementState;
  planLabel: string;
  usageUsed: number;
  usageLimit: number;
  usageUnit: string;
  graceDaysLeft?: number;
}

// Mock data until B6-01 entitlement API lands.
// Provider-neutral: no prices, no tier names beyond label.
const MOCK_PLAN: PlanMock = {
  state: 'active',
  planLabel: 'Paket Aktif',
  usageUsed: 12,
  usageLimit: 50,
  usageUnit: 'lembar',
};

const STATE_COPY: Record<EntitlementState, { heading: string; body: string }> = {
  active: {
    heading: 'Paket aktif',
    body: 'Paket Anda aktif. Anda dapat membuat dan mendistribusikan lembar kerja.',
  },
  grace: {
    heading: 'Masa tenggang',
    body: 'Paket Anda memasuki masa tenggang. Fitur tetap aktif sementara. Hubungi tim kami untuk perpanjangan.',
  },
  blocked: {
    heading: 'Akses ditangguhkan',
    body: 'Akses ke fitur berbayar ditangguhkan. Hubungi tim kami untuk memulihkan akses.',
  },
  expired: {
    heading: 'Paket berakhir',
    body: 'Paket Anda telah berakhir. Untuk melanjutkan, hubungi tim kami.',
  },
};

function UsageMeter({ used, limit, unit }: { used: number; limit: number; unit: string }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const isHigh = pct >= 80;

  return (
    <div className="flex flex-col gap-1.5" aria-label={`Penggunaan: ${used} dari ${limit} ${unit}`}>
      <div className="flex justify-between text-body-xs text-brand-muted">
        <span>Penggunaan {unit}</span>
        <span>
          {used} / {limit}
        </span>
      </div>
      <div
        className="h-2 rounded-full bg-brand-line overflow-hidden"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-label={`${pct}% terpakai`}
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
  const [plan] = useState<PlanMock>(MOCK_PLAN);
  const stateCopy = STATE_COPY[plan.state];
  const isRestricted = plan.state === 'blocked' || plan.state === 'expired';

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-brand-ink font-semibold text-body-xl">Paket &amp; kuota</h1>

      <Panel title={stateCopy.heading} description={stateCopy.body}>
        <div className="flex flex-col gap-4">
          {/* Plan label */}
          <div className="flex items-center gap-2">
            <span className="text-body-sm text-brand-muted">Paket saat ini:</span>
            <span className="text-body-sm font-medium text-brand-ink">{plan.planLabel}</span>
          </div>

          {/* Usage meter — only show when not blocked/expired */}
          {!isRestricted && (
            <UsageMeter
              used={plan.usageUsed}
              limit={plan.usageLimit}
              unit={plan.usageUnit}
            />
          )}

          {/* Grace period notice */}
          {plan.state === 'grace' && plan.graceDaysLeft !== undefined && (
            <p className="text-body-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              Masa tenggang berakhir dalam {plan.graceDaysLeft} hari.
            </p>
          )}

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-2">
            {plan.state === 'active' && (
              <Button
                variant="quiet"
                size="sm"
                onClick={() => {
                  /* mock: contact/upgrade flow pending B6-01 */
                }}
              >
                Hubungi tim kami
              </Button>
            )}
            {(plan.state === 'grace' || plan.state === 'blocked' || plan.state === 'expired') && (
              <Button
                size="sm"
                onClick={() => {
                  /* mock: contact flow pending B6-01 */
                }}
              >
                Hubungi tim kami
              </Button>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}
