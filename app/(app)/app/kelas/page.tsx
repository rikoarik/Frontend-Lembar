'use client';

import { Panel } from '@/app/components/ui';
import Link from 'next/link';

const CLASSES = [
  { id: 'c1', name: '5A', students: 28 },
  { id: 'c2', name: '5B', students: 30 },
  { id: 'c3', name: '6A', students: 27 },
];

export default function KelasPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-semibold text-brand-ink">Kelas</h1>
        <p className="text-body-sm text-brand-ink-muted">
          Daftar kelas mock untuk konteks school workspace.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
        {CLASSES.map((item) => (
          <li key={item.id}>
            <Panel title={item.name} description={`${item.students} siswa`}>
              <Link href="/school/guru" className="text-body-sm text-brand-accent underline">
                Kelola guru terkait
              </Link>
            </Panel>
          </li>
        ))}
      </ul>
    </div>
  );
}
