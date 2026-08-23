'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Panel } from '@/app/components/ui';

type BankQuestion = {
  id: string;
  stem: string;
  questionType: string;
  difficulty: string;
  answer: string;
  createdAt: string;
};

export function BankSoalView() {
  const [items, setItems] = useState<BankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void fetch('/v1/bank/questions', { credentials: 'include' })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error?.message ?? 'Bank soal gagal dimuat');
        setItems(payload?.data?.questions ?? []);
      })
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : 'Bank soal gagal dimuat'),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-semibold text-brand-ink">Bank soal pribadi</h1>
        <p className="text-body-sm text-brand-ink-muted">
          Soal hasil generate tersimpan secara pribadi di workspace aktif.
        </p>
      </div>

      <Panel title="Koleksi" description={loading ? 'Memuat…' : `${items.length} soal tersimpan`}>
        {error ? (
          <p className="text-body-sm text-brand-danger" role="alert">
            {error}
          </p>
        ) : null}
        {!loading && !error && items.length === 0 ? (
          <div className="space-y-3">
            <p className="text-body-sm text-brand-ink-muted">Belum ada soal tersimpan.</p>
            <Link
              href="/app/generate"
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-white"
            >
              Generate soal
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3" role="list">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-brand-line bg-brand-paper px-3 py-3"
              >
                <p className="text-body-default font-semibold text-brand-ink">{item.stem}</p>
                <p className="mt-1 text-body-sm text-brand-ink-muted">
                  {item.questionType.replaceAll('_', ' ')} · {item.difficulty} · Jawaban{' '}
                  {item.answer}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
