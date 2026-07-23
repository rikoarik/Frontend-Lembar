'use client';

import Link from 'next/link';
import { Panel, Button } from '@/app/components/ui';

const MOCK_TEMPLATES = [
  {
    id: 'tpl_1',
    name: 'Ulangan harian 10 soal',
    subject: 'Matematika',
    questionCount: 10,
    reviewMode: 'quick',
  },
  {
    id: 'tpl_2',
    name: 'Latihan campuran 20 soal',
    subject: 'IPAS',
    questionCount: 20,
    reviewMode: 'detail',
  },
];

export function TemplateView() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-semibold text-brand-ink">Template konfigurasi</h1>
        <p className="text-body-sm text-brand-ink-muted">
          Template menyimpan konfigurasi generate yang sering dipakai, bukan soal final.
        </p>
      </div>

      <ul className="flex flex-col gap-3" role="list">
        {MOCK_TEMPLATES.map((item) => (
          <li key={item.id}>
            <Panel
              title={item.name}
              description={`${item.subject} · ${item.questionCount} soal · review ${item.reviewMode}`}
            >
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/app/generate"
                  className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-white"
                >
                  Pakai template
                </Link>
                <Button variant="secondary" size="sm" disabled>
                  Duplikasi
                </Button>
              </div>
            </Panel>
          </li>
        ))}
      </ul>
    </div>
  );
}
