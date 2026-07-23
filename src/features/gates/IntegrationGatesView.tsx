'use client';

import Link from 'next/link';
import { Panel, StatusBadge } from '@/app/components/ui';

const CHECKS = [
  {
    id: 'F2-05',
    title: 'Identity & workspace gate',
    status: 'pass' as const,
    evidence: [
      'Login mock set cookie lembar_session',
      '/v1/me returns workspaces + active role',
      'Workspace switcher clears scoped cache',
    ],
  },
  {
    id: 'F3-05',
    title: 'Generate integration gate',
    status: 'pass' as const,
    evidence: [
      'Catalog-dependent form + PDF source mock',
      'Idempotent submit returns jobId',
      'Job progress poll/cancel/retry states',
    ],
  },
  {
    id: 'F4-04',
    title: 'Review usability gate',
    status: 'pass' as const,
    evidence: [
      'Quick + detail review modes',
      'Bulk accept + finalize blockers',
      'Keyboard-focusable controls and status text',
    ],
  },
  {
    id: 'F5-05',
    title: 'Output & library gate',
    status: 'pass' as const,
    evidence: [
      'Output center + A4 package preview',
      'Share create/copy/revoke mock',
      'History + bank + template surfaces',
    ],
  },
  {
    id: 'F6-04',
    title: 'Pilot hardening (mock)',
    status: 'partial' as const,
    evidence: [
      'Mobile navbar drawer',
      'Auth middleware + mock login path',
      'Real-device matrix still pending owner pilot devices',
    ],
  },
];

export function IntegrationGatesView() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-semibold text-brand-ink">Integration gates (mock evidence)</h1>
        <p className="text-body-sm text-brand-ink-muted">
          Bukti frontend mock-first. Gate backend live tetap terpisah.
        </p>
      </div>
      {CHECKS.map((check) => (
        <Panel
          key={check.id}
          title={`${check.id} · ${check.title}`}
          actions={<StatusBadge label={check.status === 'pass' ? 'Final' : 'Perlu ditinjau'} />}
        >
          <ul className="list-disc space-y-1 pl-5 text-body-default">
            {check.evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Panel>
      ))}
      <div className="flex flex-wrap gap-2 text-body-sm">
        <Link href="/app/generate" className="text-brand-accent underline">
          Generate
        </Link>
        <Link href="/app/riwayat" className="text-brand-accent underline">
          Riwayat
        </Link>
        <Link href="/app/output/asm_ipas_02" className="text-brand-accent underline">
          Output sample
        </Link>
        <Link href="/ops" className="text-brand-accent underline">
          Ops
        </Link>
        <Link href="/school" className="text-brand-accent underline">
          School
        </Link>
      </div>
    </div>
  );
}
