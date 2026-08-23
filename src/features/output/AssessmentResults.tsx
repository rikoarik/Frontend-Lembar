'use client';
import Link from 'next/link';
import { Component, useEffect, useState, type ReactNode } from 'react';

// ponytail: no reset — add reset prop + this.setState when retry UX needed
class ErrorBoundary extends Component<{ children: ReactNode }, { caught: boolean }> {
  state = { caught: false };
  static getDerivedStateFromError() {
    return { caught: true };
  }
  render() {
    if (this.state.caught) {
      return (
        <div
          role="alert"
          className="rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-4 py-3 text-body-sm text-brand-danger"
        >
          Terjadi kesalahan tak terduga. Muat ulang halaman untuk mencoba lagi.
        </div>
      );
    }
    return this.props.children;
  }
}

type Row = {
  id: string;
  guestName: string;
  guestClass?: string;
  status: string;
  rawScore: number | null;
  maxScore: number;
  needsGrading: boolean;
  submittedAt?: string;
};

function statusLabel(s: string) {
  if (s === 'submitted') return 'Selesai';
  if (s === 'in_progress') return 'Sedang mengerjakan';
  return s;
}

export default function AssessmentResults({ assessmentId }: { assessmentId: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/v1/assessments/${encodeURIComponent(assessmentId)}/results`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error?.message ?? 'Gagal memuat hasil.');
        setRows(j.data ?? []);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [assessmentId]);

  const submitted = rows.filter((r) => r.status === 'submitted').length;

  return (
    <ErrorBoundary>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Link
              href={`/app/output/${encodeURIComponent(assessmentId)}`}
              className="flex w-fit items-center gap-1 text-label-sm text-brand-ink-muted hover:text-brand-ink"
            >
              ← Kembali
            </Link>
            <h1 className="text-h1 font-semibold text-brand-ink">Hasil asesmen</h1>
            <p className="text-body-sm text-brand-ink-muted">
              {loading ? 'Memuat…' : `${submitted} dari ${rows.length} siswa telah mengumpulkan`}
            </p>
          </div>
          <a
            className="flex items-center gap-2 rounded-lg border border-brand-line bg-white px-4 py-2 text-body-sm text-brand-ink transition-colors hover:bg-brand-paper"
            href={`/v1/assessments/${encodeURIComponent(assessmentId)}/results.csv`}
            download
          >
            Unduh CSV
          </a>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-4 py-3 text-body-sm text-brand-danger"
          >
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !error && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-brand-line/40" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && rows.length === 0 && (
          <div className="rounded-xl border border-brand-line bg-white py-12 text-center text-body-sm text-brand-ink-muted">
            Belum ada siswa yang mengumpulkan jawaban.
          </div>
        )}

        {/* Table */}
        {!loading && rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-brand-line bg-white">
            <table className="w-full text-left text-body-sm">
              <caption className="sr-only">Daftar hasil siswa</caption>
              <thead className="border-b border-brand-line bg-brand-paper">
                <tr>
                  {['Nama', 'Kelas', 'Status', 'Skor', 'Penilaian', 'Dikirim'].map((x) => (
                    <th key={x} scope="col" className="px-4 py-3 font-medium text-brand-ink-muted">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.id}
                    className={`border-t border-brand-line ${i % 2 === 1 ? 'bg-brand-paper/40' : ''}`}
                  >
                    <th scope="row" className="px-4 py-3 font-medium text-brand-ink">
                      {r.guestName}
                    </th>
                    <td className="px-4 py-3 text-brand-ink-muted">{r.guestClass || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-label-xs font-medium ${
                          r.status === 'submitted'
                            ? 'bg-brand-success/10 text-brand-success'
                            : 'bg-brand-warning/10 text-brand-warning'
                        }`}
                      >
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {r.rawScore ?? '—'} / {r.maxScore}
                    </td>
                    <td className="px-4 py-3 text-brand-ink-muted">
                      {r.needsGrading ? 'Perlu dinilai' : 'Selesai'}
                    </td>
                    <td className="px-4 py-3 text-brand-ink-muted">
                      {r.submittedAt ? new Date(r.submittedAt).toLocaleString('id-ID') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
