'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/app/components/ui';

type Question = {
  id: string;
  number: number;
  stem: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: { key: string; text: string }[];
};
type Assessment = { assessmentId: string; title: string; questions: Question[] };

async function call<T>(url: string, init?: RequestInit) {
  const r = await fetch(url, init);
  const j = (await r.json()) as { data?: T; error?: { code?: string; message?: string } };
  if (!r.ok) {
    const c = j.error?.code;
    const message =
      c === 'SHARE_REVOKED' ? 'Tautan asesmen telah dicabut.'
      : c === 'SHARE_EXPIRED' ? 'Tautan asesmen kedaluwarsa.'
      : j.error?.message ?? 'Terjadi kesalahan.';
    throw new Error(message);
  }
  return j.data as T;
}

const TRUE_FALSE_DEFAULT = [
  { key: 'true', text: 'Benar' },
  { key: 'false', text: 'Salah' },
];

export default function StudentRunner({ token }: { token: string }) {
  const [phase, setPhase] = useState<'loading' | 'identity' | 'starting' | 'running' | 'done' | 'error'>('loading');
  const [data, setData] = useState<Assessment>();
  const [name, setName] = useState('');
  const [klass, setKlass] = useState('');
  const [attempt, setAttempt] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'' | 'saving' | 'saved'>('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    call<Assessment>(`/v1/public/shares/${encodeURIComponent(token)}`)
      .then(x => { if (active) { setData(x); setPhase('identity'); } })
      .catch(e => { if (active) { setError((e as Error).message); setPhase('error'); } });
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    if (phase !== 'running' || !attempt || !Object.keys(answers).length) return;
    setSaveStatus('saving');
    if (saveTimer.current !== null) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void call(`/v1/public/shares/${encodeURIComponent(token)}/attempts/${encodeURIComponent(attempt)}/answers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
        .then(() => setSaveStatus('saved'))
        .catch(() => setSaveStatus(''));
    }, 500);
    return () => { if (saveTimer.current !== null) clearTimeout(saveTimer.current); };
  }, [answers, attempt, phase, token]);

  async function start() {
    setPhase('starting');
    try {
      const x = await call<{ id: string }>(
        `/v1/public/shares/${encodeURIComponent(token)}/attempts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestName: name.trim(), ...(klass.trim() ? { guestClass: klass.trim() } : {}) }),
        },
      );
      setAttempt(x.id);
      setPhase('running');
    } catch (e) {
      setError((e as Error).message);
      setPhase('error');
    }
  }

  async function submit() {
    setSubmitting(true);
    setError('');
    try {
      await call(
        `/v1/public/shares/${encodeURIComponent(token)}/attempts/${encodeURIComponent(attempt)}/submit`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers }) },
      );
      setPhase('done');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Loading / Starting ── */
  if (phase === 'loading' || phase === 'starting') {
    return (
      <main className="min-h-[100dvh] grid place-items-center bg-brand-paper" aria-busy="true">
        <div className="flex flex-col items-center gap-3 text-brand-ink-muted">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
          <p className="text-body-sm">{phase === 'loading' ? 'Memuat asesmen…' : 'Memulai…'}</p>
        </div>
      </main>
    );
  }

  /* ── Error ── */
  if (phase === 'error') {
    return (
      <main className="min-h-[100dvh] grid place-items-center bg-brand-paper px-4">
        <div className="max-w-sm w-full rounded-xl border border-brand-danger/30 bg-brand-danger/5 p-6 text-center">
          <p className="text-body-sm font-medium text-brand-danger" role="alert">{error}</p>
        </div>
      </main>
    );
  }

  /* ── Identity ── */
  if (phase === 'identity') {
    return (
      <main className="min-h-[100dvh] flex flex-col items-center justify-center bg-brand-paper px-4 py-12">
        <div className="w-full max-w-md">
          <p className="mb-1 text-label-sm font-semibold uppercase tracking-widest text-brand-accent">Asesmen</p>
          <h1 className="mb-8 text-h2 font-semibold text-brand-ink">{data?.title}</h1>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-label-sm font-medium text-brand-ink">Nama</span>
              <input
                required
                maxLength={120}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nama lengkap"
                className="min-h-10 rounded-lg border border-brand-line bg-white px-3 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label-sm font-medium text-brand-ink">
                Kelas <span className="font-normal text-brand-ink-muted">(opsional)</span>
              </span>
              <input
                maxLength={80}
                value={klass}
                onChange={e => setKlass(e.target.value)}
                placeholder="cth. 5A"
                className="min-h-10 rounded-lg border border-brand-line bg-white px-3 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </label>
            <Button disabled={!name.trim()} onClick={() => void start()} className="mt-2 w-full">
              Mulai asesmen
            </Button>
          </div>
        </div>
      </main>
    );
  }

  /* ── Done ── */
  if (phase === 'done') {
    return (
      <main className="min-h-[100dvh] grid place-items-center bg-brand-paper px-4">
        <div className="max-w-sm w-full rounded-xl border border-brand-line bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent-soft text-lg font-bold text-brand-accent" aria-hidden>✓</div>
          <h1 className="mt-3 text-h3 font-semibold text-brand-ink">Jawaban terkirim</h1>
          <p className="mt-2 text-body-sm text-brand-ink-muted">Jawaban kamu sudah tercatat. Kamu boleh menutup halaman ini.</p>
        </div>
      </main>
    );
  }

  /* ── Running ── */
  const questions = data?.questions ?? [];
  const answered = questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== '').length;

  return (
    <div className="min-h-[100dvh] bg-brand-paper">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b border-brand-line bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-label-sm font-medium text-brand-ink">{data?.title}</p>
            <p className="text-label-xs text-brand-ink-muted">{answered} dari {questions.length} soal terjawab</p>
          </div>
          <span className="shrink-0 text-label-xs text-brand-ink-muted" aria-live="polite" aria-atomic="true">
            {saveStatus === 'saving' ? 'Menyimpan…' : saveStatus === 'saved' ? 'Jawaban tersimpan' : ''}
          </span>
        </div>
      </header>

      {/* Questions */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        <ol className="flex flex-col gap-6">
          {questions.map(q => {
            const choices =
              q.questionType === 'true_false'
                ? (q.options?.length ? q.options : TRUE_FALSE_DEFAULT)
                : q.options;
            const isObjective = q.questionType === 'multiple_choice' || q.questionType === 'true_false';
            return (
              <li key={q.id} className="rounded-xl border border-brand-line bg-white p-5 shadow-sm">
                <p className="mb-4 text-body-sm font-medium text-brand-ink leading-relaxed">
                  <span className="mr-1.5 font-bold text-brand-accent">{q.number}.</span>
                  {q.stem}
                </p>
                {isObjective ? (
                  <fieldset>
                    <legend className="sr-only">Pilihan jawaban soal {q.number}</legend>
                    <div className="flex flex-col gap-2">
                      {choices?.map(o => (
                        <label
                          key={o.key}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-body-sm transition-colors ${
                            answers[q.id] === o.key
                              ? 'border-brand-accent bg-brand-accent/5 font-medium text-brand-accent'
                              : 'border-brand-line text-brand-ink hover:bg-brand-paper'
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            aria-label={`${o.key}. ${o.text}`}
                            checked={answers[q.id] === o.key}
                            onChange={() => setAnswers(a => ({ ...a, [q.id]: o.key }))}
                            className="sr-only"
                          />
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors
                            border-current">
                            {answers[q.id] === o.key ? '✓' : o.key}
                          </span>
                          {o.text}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ) : (
                  <textarea
                    aria-label={`Soal ${q.number}`}
                    rows={q.questionType === 'essay' ? 5 : 2}
                    value={answers[q.id] ?? ''}
                    onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                    className="w-full rounded-lg border border-brand-line bg-brand-paper px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    placeholder="Tulis jawabanmu di sini…"
                  />
                )}
              </li>
            );
          })}
        </ol>

        {error && (
          <div role="alert" className="mt-6 rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-4 py-3 text-body-sm text-brand-danger">
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-body-sm text-brand-ink-muted">
            {answered}/{questions.length} terjawab
          </p>
          <Button loading={submitting} onClick={() => void submit()}>
            {error ? 'Coba kirim lagi' : 'Kirim jawaban'}
          </Button>
        </div>
      </main>
    </div>
  );
}
