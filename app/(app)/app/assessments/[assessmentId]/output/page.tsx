'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MetadataForm } from '@/src/features/output/MetadataForm';
import { StudentWorksheetRenderer } from '@/src/features/output/StudentWorksheetRenderer';
import { TeacherKeyRenderer } from '@/src/features/output/TeacherKeyRenderer';
import type { PrintDTO, PrintMetadata } from '@/src/features/output/types';

const blankMetadata: PrintMetadata = {
  schoolName: '',
  teacherName: '',
  subject: '',
  class: '',
  date: '',
  duration: '',
  instructions: '',
};

type Params = { params: Promise<{ assessmentId: string }> };
type SectionKey = 'student' | 'teacher' | 'metadata';

export default function OutputPage({ params }: Params) {
  const { assessmentId } = use(params);
  return <OutputCenterContent assessmentId={assessmentId} />;
}

export function OutputCenterContent({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();
  const [dto, setDto] = useState<PrintDTO | null>(null);
  const [metadata, setMetadata] = useState<PrintMetadata>(blankMetadata);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState<Record<SectionKey, boolean>>({
    student: true,
    teacher: true,
    metadata: true,
  });

  useEffect(() => {
    let active = true;
    void fetch(`/v1/assessments/${encodeURIComponent(assessmentId)}/print`, { credentials: 'include' })
      .then(async (response) => {
        if (response.status === 401) {
          router.replace('/masuk');
          return null;
        }
        const body = (await response.json().catch(() => null)) as { data?: PrintDTO; error?: { message?: string } } | null;
        if (!response.ok || !body?.data) throw new Error(body?.error?.message ?? 'Gagal memuat output.');
        return body.data;
      })
      .then((next) => {
        if (!active || !next) return;
        setDto(next);
        setMetadata(next.metadata ?? blankMetadata);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Gagal memuat output.');
      });
    return () => {
      active = false;
    };
  }, [assessmentId, router]);

  const toggle = (key: SectionKey) =>
    setVisible((current) => ({ ...current, [key]: !current[key] }));

  if (error) return <p role="alert">{error}</p>;
  if (!dto) return <div aria-busy="true">Memuat output…</div>;

  const dtoWithMetadata = { ...dto, metadata };

  return (
    <main className="flex flex-col gap-4">
      <header>
        <h1 className="text-h1 font-semibold text-brand-ink">Pusat output</h1>
        <p className="text-body-sm text-brand-ink-muted">{dto.title} · {dto.questionCount} soal</p>
      </header>

      <div
        data-testid="output-center-layout"
        className="grid gap-4 lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]"
      >
        <aside aria-label="Kontrol output" className="order-1 flex flex-col gap-4 lg:order-none">
          <div className="flex flex-wrap gap-2" aria-label="Kontrol bagian output">
            <Toggle label="Lembar siswa" show={visible.student} onClick={() => toggle('student')} />
            <Toggle label="Kunci guru" show={visible.teacher} onClick={() => toggle('teacher')} />
            <Toggle label="Metadata" show={visible.metadata} onClick={() => toggle('metadata')} />
          </div>

          {visible.metadata ? (
            <section aria-label="Metadata" className="rounded-md border border-brand-line p-4">
              <MetadataForm
                value={metadata}
                onChange={setMetadata}
                onSave={setMetadata}
                onCancel={() => setMetadata(dto.metadata ?? blankMetadata)}
              />
            </section>
          ) : null}
        </aside>

        <section
          aria-label="Pratinjau output"
          className="order-2 flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start"
        >
          {visible.student ? (
            <section aria-label="Lembar siswa" className="rounded-md border border-brand-line p-4">
              <StudentWorksheetRenderer dto={dtoWithMetadata} />
            </section>
          ) : null}

          {visible.teacher ? (
            <section aria-label="Kunci guru" className="rounded-md border border-brand-line p-4">
              <TeacherKeyRenderer dto={dtoWithMetadata} />
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function Toggle({ label, show, onClick }: { label: string; show: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4"
      onClick={onClick}
    >
      {show ? 'Sembunyikan' : 'Tampilkan'} {label.toLowerCase()}
    </button>
  );
}
