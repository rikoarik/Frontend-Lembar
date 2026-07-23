'use client';

import Link from 'next/link';
import { Panel, Button } from '@/app/components/ui';

const MOCK_BANK = [
  {
    id: 'bank_1',
    stem: 'Hasil dari 3/4 + 1/8 adalah …',
    topic: 'Penjumlahan pecahan',
    subject: 'Matematika',
    trusted: true,
  },
  {
    id: 'bank_2',
    stem: 'Perubahan wujud es menjadi air disebut …',
    topic: 'Perubahan wujud',
    subject: 'IPAS',
    trusted: true,
  },
  {
    id: 'bank_3',
    stem: 'Nilai tempat angka 7 pada 3.745 adalah …',
    topic: 'Nilai tempat',
    subject: 'Matematika',
    trusted: false,
  },
];

export function BankSoalView() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-semibold text-brand-ink">Bank soal pribadi</h1>
        <p className="text-body-sm text-brand-ink-muted">
          Snapshot soal terpercaya bersifat pribadi secara default. Sinkron backend menyusul.
        </p>
      </div>

      <Panel title="Koleksi" description={`${MOCK_BANK.length} item mock`}>
        <ul className="flex flex-col gap-3" role="list">
          {MOCK_BANK.map((item) => (
            <li
              key={item.id}
              className="rounded-md border border-brand-line bg-brand-paper px-3 py-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-body-default font-semibold text-brand-ink">{item.stem}</p>
                  <p className="text-body-sm text-brand-ink-muted">
                    {item.subject} · {item.topic} · {item.trusted ? 'Terpercaya' : 'Draft'}
                  </p>
                </div>
                <Button variant="secondary" size="sm" disabled>
                  Pakai di generate
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Catatan" description="Batas mock-first">
        <p className="text-body-sm text-brand-ink-muted">
          Simpan dari hasil review final dan sinkron API bank menunggu kontrak B5-04. Sementara ini
          menampilkan fixture lokal agar navigasi shell tidak kosong.
        </p>
        <div className="mt-3">
          <Link
            href="/app/riwayat"
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4"
          >
            Buka riwayat
          </Link>
        </div>
      </Panel>
    </div>
  );
}
