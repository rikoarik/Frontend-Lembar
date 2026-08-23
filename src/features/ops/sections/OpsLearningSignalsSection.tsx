'use client';

import { Button } from '@/app/components/ui';
import {
  AdminPageHeader,
  AdminPill,
  AdminDataTable,
  AdminContentLoading,
} from '@/src/features/admin/AdminChrome';
import { adminService } from '@/src/services/admin/adminService';

export function OpsLearningSignalsSection({
  signalsData,
  setSignalsData,
  signalsLoading,
  setSignalsLoading,
}: {
  signalsData: {
    prompt_template_id: string;
    pattern: string;
    frequency: number;
    avg_rating: number;
    suggested_action: string;
  }[];
  setSignalsData: (data: any[]) => void;
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
              if (res.ok) {
                const val = res.value as any;
                setSignalsData(Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : []);
              }
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
                const r = Number((row as any).avg_rating ?? 0);
                const tone = r < 2.5 ? 'bad' : r < 3.5 ? 'warn' : 'ok';
                return <AdminPill tone={tone}>{r.toFixed(1)} ★</AdminPill>;
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
