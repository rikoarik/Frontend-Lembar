'use client';

import { Button } from '@/app/components/ui';
import {
  AdminPageHeader,
  AdminPill,
  AdminDataTable,
  AdminContentLoading,
} from '@/src/features/admin/AdminChrome';
import { adminService, type AdminLearningSignal } from '@/src/services/admin/adminService';

export function OpsLearningSignalsSection({
  signalsData,
  setSignalsData,
  signalsLoading,
  setSignalsLoading,
}: {
  signalsData: AdminLearningSignal[];
  setSignalsData: (data: AdminLearningSignal[]) => void;
  signalsLoading: boolean;
  setSignalsLoading: (v: boolean) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-1 py-1">
        <h2 className="text-[18px] font-bold text-[#171717]">Learning Signals</h2>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setSignalsLoading(true);
            adminService.learningSignals().then((res) => {
              if (res.ok) setSignalsData(res.value);
              setSignalsLoading(false);
            });
          }}
        >
          Refresh
        </Button>
      </div>
      {signalsLoading ? <AdminContentLoading /> : null}

      {signalsData.length === 0 && !signalsLoading ? (
        <div className="rounded-2xl border border-[#ddd4c8]/60 bg-[#faf8f5] p-8 text-center space-y-2">
          <div className="text-[14px] font-semibold text-[#171717]">Belum ada learning signal</div>
          <div className="text-[13px] text-[#6d665d]">
            Sinyal muncul ketika pengguna memberikan feedback pada hasil generate. Data dari tabel
            ai_learning_signals.
          </div>
        </div>
      ) : (
        <AdminDataTable
          rows={signalsData.map((s, i) => ({ ...s, id: `signal-${i}` }))}
          emptyLabel="Tidak ada sinyal."
          columns={[
            {
              key: 'prompt',
              header: 'Prompt Template',
              render: (row) => (
                <span className="font-mono text-[11px] text-[#514b44]">
                  {(row as any).prompt_template_id ?? '—'}
                </span>
              ),
            },
            {
              key: 'pattern',
              header: 'Pola',
              render: (row) => <span className="text-[12px]">{(row as any).pattern ?? '—'}</span>,
            },
            {
              key: 'frequency',
              header: 'Frekuensi',
              render: (row) => (
                <span className="tabular-nums font-semibold">
                  {String((row as any).frequency ?? 0)}
                </span>
              ),
            },
            {
              key: 'rating',
              header: 'Avg Rating',
              render: (row) => {
                const rating = (row as AdminLearningSignal).avg_rating;
                if (rating === null || !Number.isFinite(rating)) {
                  return <span className="text-[12px] text-[#6d665d]">—</span>;
                }
                const tone = rating < 2.5 ? 'bad' : rating < 3.5 ? 'warn' : 'ok';
                const label = Number.isInteger(rating) ? rating.toFixed(1) : rating.toFixed(2);
                return <AdminPill tone={tone}>{label} ★</AdminPill>;
              },
            },
            {
              key: 'action',
              header: 'Aksi yang Disarankan',
              render: (row) => (
                <span className="text-[12px] font-semibold text-[#c9703a]">
                  {(row as any).suggested_action ?? '—'}
                </span>
              ),
            },
          ]}
          rowActions={() => (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => window.open(`/ops/prompts`, '_self')}
            >
              Lihat prompt
            </Button>
          )}
        />
      )}
    </>
  );
}
