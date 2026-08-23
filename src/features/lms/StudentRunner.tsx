'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/app/components/ui';

type Question = {
  id: string;
  number: number;
  stem: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: { key: string; text: string }[];
};

type Assessment = {
  assessmentId: string;
  title: string;
  durationMinutes?: number;
  questions: Question[];
};

type Phase = 'loading' | 'identity' | 'starting' | 'running' | 'done' | 'error';
type SaveStatus = '' | 'saving' | 'saved' | 'error';

type StoredAttempt = {
  attemptId: string;
  name: string;
  klass: string;
  answers: Record<string, string>;
  startedAt: number;
};

const TRUE_FALSE_DEFAULT = [
  { key: 'true', text: 'Benar' },
  { key: 'false', text: 'Salah' },
];

function storageKey(token: string) {
  return `lembar.attempt.${token}`;
}

function readStoredAttempt(token: string): StoredAttempt | null {
  try {
    const raw = window.sessionStorage.getItem(storageKey(token));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredAttempt>;
    if (
      typeof parsed.attemptId !== 'string' ||
      typeof parsed.name !== 'string' ||
      typeof parsed.startedAt !== 'number' ||
      !parsed.answers ||
      typeof parsed.answers !== 'object'
    ) {
      return null;
    }
    return {
      attemptId: parsed.attemptId,
      name: parsed.name,
      klass: typeof parsed.klass === 'string' ? parsed.klass : '',
      answers: parsed.answers,
      startedAt: parsed.startedAt,
    };
  } catch {
    return null;
  }
}

function writeStoredAttempt(token: string, value: StoredAttempt) {
  try {
    window.sessionStorage.setItem(storageKey(token), JSON.stringify(value));
  } catch {
    // The active attempt still works when browser storage is unavailable.
  }
}

function clearStoredAttempt(token: string) {
  try {
    window.sessionStorage.removeItem(storageKey(token));
  } catch {
    // Nothing else is required when browser storage is unavailable.
  }
}

function remainingSeconds(durationMinutes: number | undefined, startedAt: number): number | null {
  if (!durationMinutes || durationMinutes <= 0) return null;
  const deadline = startedAt + durationMinutes * 60_000;
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
}

function formatRemaining(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = (await response.json().catch(() => null)) as {
    data?: T;
    error?: { code?: string; message?: string };
  } | null;
  if (!response.ok) {
    const code = body?.error?.code;
    const message =
      code === 'SHARE_REVOKED'
        ? 'Tautan asesmen telah dicabut.'
        : code === 'SHARE_EXPIRED'
          ? 'Tautan asesmen kedaluwarsa.'
          : (body?.error?.message ?? 'Terjadi kesalahan.');
    throw new Error(message);
  }
  return body?.data as T;
}

export default function StudentRunner({ token }: { token: string }) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [data, setData] = useState<Assessment>();
  const [name, setName] = useState('');
  const [klass, setKlass] = useState('');
  const [attempt, setAttempt] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('');
  const [loadVersion, setLoadVersion] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const saveSequence = useRef(0);
  const submitRef = useRef<() => void>(() => undefined);
  const autoSubmitted = useRef(false);

  const enqueueSave = useCallback(
    (attemptId: string, answerSnapshot: Record<string, string>, sequence: number) => {
      const queuedSave = saveQueue.current
        .catch(() => undefined)
        .then(async () => {
          try {
            await call(
              `/v1/public/shares/${encodeURIComponent(token)}/attempts/${encodeURIComponent(attemptId)}/answers`,
              {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: answerSnapshot }),
              },
            );
            if (saveSequence.current === sequence) setSaveStatus('saved');
          } catch (cause) {
            if (saveSequence.current === sequence) {
              setSaveStatus('error');
              setError((cause as Error).message || 'Jawaban belum tersimpan.');
            }
          }
        });
      const settledSave = queuedSave.catch(() => undefined);
      saveQueue.current = settledSave;
      return settledSave;
    },
    [token],
  );

  const submit = useCallback(async () => {
    if (!attempt || submitting) return;
    if (saveTimer.current !== null) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const answerSnapshot = answers;
    const sequence = ++saveSequence.current;
    setSubmitting(true);
    setSaveStatus('saving');
    setError('');
    try {
      await enqueueSave(attempt, answerSnapshot, sequence);
      await call(
        `/v1/public/shares/${encodeURIComponent(token)}/attempts/${encodeURIComponent(attempt)}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: answerSnapshot }),
        },
      );
      clearStoredAttempt(token);
      setPhase('done');
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setSubmitting(false);
    }
  }, [answers, attempt, enqueueSave, submitting, token]);

  useEffect(() => {
    submitRef.current = () => void submit();
  }, [submit]);

  useEffect(() => {
    let active = true;
    call<Assessment>(`/v1/public/shares/${encodeURIComponent(token)}`)
      .then((assessment) => {
        if (!active) return;
        setData(assessment);
        const stored = readStoredAttempt(token);
        if (stored) {
          setAttempt(stored.attemptId);
          setName(stored.name);
          setKlass(stored.klass);
          setAnswers(stored.answers);
          setStartedAt(stored.startedAt);
          setRemaining(remainingSeconds(assessment.durationMinutes, stored.startedAt));
          setPhase('running');
          return;
        }
        setPhase('identity');
      })
      .catch((cause) => {
        if (!active) return;
        setError((cause as Error).message);
        setPhase('error');
      });
    return () => {
      active = false;
    };
  }, [loadVersion, token]);

  useEffect(() => {
    if (phase !== 'running' || !attempt || !startedAt) return;
    writeStoredAttempt(token, { attemptId: attempt, name, klass, answers, startedAt });
  }, [answers, attempt, klass, name, phase, startedAt, token]);

  useEffect(() => {
    if (phase !== 'running' || !attempt || Object.keys(answers).length === 0) return;
    if (saveTimer.current !== null) clearTimeout(saveTimer.current);
    const sequence = ++saveSequence.current;
    const timer = setTimeout(() => {
      if (saveTimer.current === timer) saveTimer.current = null;
      void enqueueSave(attempt, answers, sequence);
    }, 500);
    saveTimer.current = timer;
    return () => {
      clearTimeout(timer);
      if (saveTimer.current === timer) saveTimer.current = null;
    };
  }, [answers, attempt, enqueueSave, phase]);

  useEffect(() => {
    if (phase !== 'running' || remaining === null) return;
    const timer = window.setInterval(() => {
      const next = remainingSeconds(data?.durationMinutes, startedAt);
      setRemaining(next);
      if (next === 0 && !autoSubmitted.current) {
        autoSubmitted.current = true;
        submitRef.current();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [data?.durationMinutes, phase, remaining, startedAt]);

  useEffect(() => {
    if (phase !== 'running') return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [phase]);

  function updateAnswer(questionId: string, value: string) {
    setError('');
    setSaveStatus('saving');
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  async function start() {
    setPhase('starting');
    setError('');
    try {
      const result = await call<{ id: string; startedAt?: string }>(
        `/v1/public/shares/${encodeURIComponent(token)}/attempts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestName: name.trim(),
            ...(klass.trim() ? { guestClass: klass.trim() } : {}),
          }),
        },
      );
      const started = result.startedAt ? Date.parse(result.startedAt) : Date.now();
      const safeStartedAt = Number.isFinite(started) ? started : Date.now();
      setAttempt(result.id);
      setStartedAt(safeStartedAt);
      setRemaining(remainingSeconds(data?.durationMinutes, safeStartedAt));
      writeStoredAttempt(token, {
        attemptId: result.id,
        name: name.trim(),
        klass: klass.trim(),
        answers: {},
        startedAt: safeStartedAt,
      });
      setPhase('running');
    } catch (cause) {
      setError((cause as Error).message);
      setPhase('identity');
    }
  }

  if (phase === 'loading' || phase === 'starting') {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-brand-paper" aria-busy="true">
        <div className="flex flex-col items-center gap-3 text-brand-ink-muted">
          <span
            className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-accent border-t-transparent"
            aria-hidden="true"
          />
          <p className="text-body-sm">{phase === 'loading' ? 'Memuat asesmen…' : 'Memulai…'}</p>
        </div>
      </main>
    );
  }

  if (phase === 'error') {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-brand-paper px-4">
        <div className="w-full max-w-sm rounded-xl border border-brand-danger/30 bg-brand-danger/5 p-6 text-center">
          <p className="text-body-sm font-medium text-brand-danger" role="alert">
            {error}
          </p>
          <Button
            className="mt-4"
            size="sm"
            onClick={() => {
              setError('');
              setPhase('loading');
              setLoadVersion((value) => value + 1);
            }}
          >
            Coba lagi
          </Button>
        </div>
      </main>
    );
  }

  if (phase === 'identity') {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-brand-paper px-4 py-12">
        <div className="w-full max-w-md">
          <p className="mb-1 text-label-sm font-semibold uppercase tracking-widest text-brand-accent">
            Asesmen
          </p>
          <h1 className="mb-2 text-h2 font-semibold text-brand-ink">{data?.title}</h1>
          {data?.durationMinutes ? (
            <p className="mb-8 text-body-sm text-brand-ink-muted">
              Waktu pengerjaan: {data.durationMinutes} menit
            </p>
          ) : (
            <div className="mb-6" />
          )}
          {error ? (
            <p className="mb-4 text-body-sm text-brand-danger" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-label-sm font-medium text-brand-ink">Nama</span>
              <input
                required
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
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
                onChange={(event) => setKlass(event.target.value)}
                placeholder="cth. 5A"
                className="min-h-10 rounded-lg border border-brand-line bg-white px-3 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </label>
            <Button disabled={!name.trim()} onClick={() => void start()} className="mt-2 w-full">
              {error ? 'Coba mulai lagi' : 'Mulai asesmen'}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (phase === 'done') {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-brand-paper px-4">
        <div className="w-full max-w-sm rounded-xl border border-brand-line bg-white p-8 text-center shadow-sm">
          <div
            className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent-soft text-lg font-bold text-brand-accent"
            aria-hidden="true"
          >
            ✓
          </div>
          <h1 className="mt-3 text-h3 font-semibold text-brand-ink">Jawaban terkirim</h1>
          <p className="mt-2 text-body-sm text-brand-ink-muted">
            Jawaban kamu sudah tercatat. Kamu boleh menutup halaman ini.
          </p>
        </div>
      </main>
    );
  }

  const questions = data?.questions ?? [];
  const answered = questions.filter(
    (question) => answers[question.id] !== undefined && answers[question.id] !== '',
  ).length;

  return (
    <div className="min-h-[100dvh] bg-brand-paper">
      <header className="sticky top-0 z-10 border-b border-brand-line bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-label-sm font-medium text-brand-ink">{data?.title}</p>
            <p className="text-label-xs text-brand-ink-muted">
              {answered} dari {questions.length} soal terjawab
              {remaining !== null ? ` · Sisa ${formatRemaining(remaining)}` : ''}
            </p>
          </div>
          <span
            className={`shrink-0 text-label-xs ${saveStatus === 'error' ? 'text-brand-danger' : 'text-brand-ink-muted'}`}
            aria-live="polite"
            aria-atomic="true"
          >
            {saveStatus === 'saving'
              ? 'Menyimpan…'
              : saveStatus === 'saved'
                ? 'Jawaban tersimpan'
                : saveStatus === 'error'
                  ? 'Gagal menyimpan'
                  : ''}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {questions.length === 0 ? (
          <div className="rounded-xl border border-brand-line bg-white p-6 text-center">
            <p className="text-body-sm text-brand-ink-muted">
              Belum ada soal yang dapat dikerjakan.
            </p>
          </div>
        ) : (
          <ol className="flex flex-col gap-6">
            {questions.map((question) => {
              const choices =
                question.questionType === 'true_false'
                  ? question.options?.length
                    ? question.options
                    : TRUE_FALSE_DEFAULT
                  : question.options;
              const isObjective =
                question.questionType === 'multiple_choice' ||
                question.questionType === 'true_false';
              return (
                <li
                  key={question.id}
                  className="rounded-xl border border-brand-line bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex items-start gap-3">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-accent-soft text-label-sm font-semibold text-brand-accent"
                      aria-label={`Soal ${question.number}`}
                    >
                      {question.number}
                    </span>
                    <p className="pt-0.5 text-body-sm font-medium leading-relaxed text-brand-ink">
                      {question.stem}
                    </p>
                  </div>
                  {isObjective ? (
                    <fieldset>
                      <legend className="sr-only">Pilihan jawaban soal {question.number}</legend>
                      <div className="flex flex-col gap-2">
                        {choices?.map((option) => (
                          <label
                            key={option.key}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-body-sm transition-colors ${
                              answers[question.id] === option.key
                                ? 'border-brand-accent bg-brand-accent/5 font-medium text-brand-accent'
                                : 'border-brand-line text-brand-ink hover:bg-brand-paper'
                            }`}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              aria-label={`${option.key}. ${option.text}`}
                              checked={answers[question.id] === option.key}
                              onChange={() => updateAnswer(question.id, option.key)}
                              className="sr-only"
                            />
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-current text-xs font-bold transition-colors">
                              {answers[question.id] === option.key ? '✓' : option.key}
                            </span>
                            {option.text}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ) : (
                    <textarea
                      aria-label={`Soal ${question.number}`}
                      rows={question.questionType === 'essay' ? 5 : 2}
                      value={answers[question.id] ?? ''}
                      onChange={(event) => updateAnswer(question.id, event.target.value)}
                      className="w-full rounded-lg border border-brand-line bg-brand-paper px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                      placeholder="Tulis jawabanmu di sini…"
                    />
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {error ? (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-4 py-3 text-body-sm text-brand-danger"
          >
            {error}
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-body-sm text-brand-ink-muted">
            {answered}/{questions.length} terjawab
          </p>
          <Button
            loading={submitting}
            disabled={questions.length === 0 || submitting}
            onClick={() => void submit()}
          >
            {error ? 'Coba kirim lagi' : remaining === 0 ? 'Kirim sekarang' : 'Kirim jawaban'}
          </Button>
        </div>
      </main>
    </div>
  );
}
