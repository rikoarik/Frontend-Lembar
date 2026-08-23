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
  const [currentIndex, setCurrentIndex] = useState(0);
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
  const answered = questions.filter((question) => Boolean(answers[question.id]?.trim())).length;
  const safeIndex = Math.min(currentIndex, Math.max(questions.length - 1, 0));
  const currentQuestion = questions[safeIndex];
  const currentAnswer = currentQuestion ? (answers[currentQuestion.id] ?? '') : '';
  const questionTypeLabel = currentQuestion
    ? {
        multiple_choice: 'Pilihan ganda',
        true_false: 'Benar atau salah',
        short_answer: 'Jawaban singkat',
        essay: 'Esai',
      }[currentQuestion.questionType]
    : '';
  const choices = currentQuestion
    ? currentQuestion.questionType === 'true_false'
      ? currentQuestion.options?.length
        ? currentQuestion.options
        : TRUE_FALSE_DEFAULT
      : currentQuestion.options
    : undefined;
  const isObjective =
    currentQuestion?.questionType === 'multiple_choice' ||
    currentQuestion?.questionType === 'true_false';

  return (
    <div className="min-h-[100dvh] bg-brand-paper">
      <header className="sticky top-0 z-10 border-b border-brand-line bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="min-w-0">
            <p className="truncate text-label-sm font-semibold text-brand-ink">{data?.title}</p>
            <p className="text-label-xs text-brand-ink-muted">
              <span>{name}{klass ? `, ${klass}` : ''} | </span>
              <span>{`${answered} dari ${questions.length} soal terjawab`}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            {remaining !== null ? (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-brand-ink-muted">Sisa waktu</p>
                <p className={`font-mono text-body-sm font-semibold ${remaining <= 300 ? 'text-brand-danger' : 'text-brand-ink'}`}>
                  {formatRemaining(remaining)}
                </p>
              </div>
            ) : null}
            <span
              className={`hidden text-label-xs sm:inline ${saveStatus === 'error' ? 'text-brand-danger' : 'text-brand-ink-muted'}`}
              aria-live="polite"
              aria-atomic="true"
            >
              {saveStatus === 'saving'
                ? 'Menyimpan...'
                : saveStatus === 'saved'
                  ? 'Jawaban tersimpan'
                  : saveStatus === 'error'
                    ? 'Gagal menyimpan'
                    : ''}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-5 px-4 py-5 md:grid-cols-[15rem_minmax(0,1fr)] md:px-6 md:py-8">
        {questions.length === 0 ? (
          <div className="rounded-xl border border-brand-line bg-white p-6 text-center md:col-span-2">
            <p className="text-body-sm text-brand-ink-muted">Belum ada soal yang dapat dikerjakan.</p>
          </div>
        ) : (
          <>
            <aside className="md:sticky md:top-24 md:self-start" aria-label="Navigasi soal">
              <div className="rounded-xl border border-brand-line bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-body-sm font-semibold text-brand-ink">Nomor soal</h2>
                  <span className="text-label-xs text-brand-ink-muted">{answered}/{questions.length}</span>
                </div>
                <div className="grid grid-cols-6 gap-2 sm:grid-cols-10 md:grid-cols-5">
                  {questions.map((question, index) => {
                    const isAnswered = Boolean(answers[question.id]?.trim());
                    const isCurrent = index === safeIndex;
                    return (
                      <button
                        key={question.id}
                        type="button"
                        aria-label={`Soal ${question.number}, ${isAnswered ? 'sudah dijawab' : 'belum dijawab'}`}
                        aria-current={isCurrent ? 'step' : undefined}
                        onClick={() => setCurrentIndex(index)}
                        className={`aspect-square rounded-md border text-label-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent ${
                          isCurrent
                            ? 'border-brand-accent bg-brand-accent text-white'
                            : isAnswered
                              ? 'border-brand-accent/30 bg-brand-accent-soft text-brand-accent'
                              : 'border-brand-line bg-white text-brand-ink hover:bg-brand-paper'
                        }`}
                      >
                        {question.number}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-brand-ink-muted">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-accent-soft" />Terjawab</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-brand-line bg-white" />Kosong</span>
                </div>
              </div>
            </aside>

            <section className="min-w-0" aria-label={`Soal ${currentQuestion?.number ?? ''}`}>
              {currentQuestion ? (
                <article className="rounded-xl border border-brand-line bg-white shadow-sm">
                  <div className="border-b border-brand-line px-5 py-4 sm:px-7">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-label-sm font-semibold text-brand-accent">
                        Soal {currentQuestion.number} dari {questions.length}
                      </p>
                      <span className="text-label-xs text-brand-ink-muted">{questionTypeLabel}</span>
                    </div>
                    <h1 className="mt-4 text-body-lg font-semibold leading-relaxed text-brand-ink">
                      {currentQuestion.stem}
                    </h1>
                  </div>

                  <div className="px-5 py-5 sm:px-7 sm:py-6">
                    {isObjective ? (
                      <fieldset>
                        <legend className="sr-only">Pilihan jawaban soal {currentQuestion.number}</legend>
                        <div className="grid gap-3">
                          {choices?.map((option) => (
                            <label
                              key={option.key}
                              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3.5 text-body-sm transition-colors active:scale-[0.99] ${
                                currentAnswer === option.key
                                  ? 'border-brand-accent bg-brand-accent/5 font-medium text-brand-ink'
                                  : 'border-brand-line text-brand-ink hover:bg-brand-paper'
                              }`}
                            >
                              <input
                                type="radio"
                                name={currentQuestion.id}
                                aria-label={`${option.key}. ${option.text}`}
                                checked={currentAnswer === option.key}
                                onChange={() => updateAnswer(currentQuestion.id, option.key)}
                                className="sr-only"
                              />
                              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${currentAnswer === option.key ? 'border-brand-accent bg-brand-accent text-white' : 'border-brand-line bg-white text-brand-ink'}`}>
                                {option.key}
                              </span>
                              <span className="pt-1 leading-relaxed">{option.text}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    ) : (
                      <div>
                        <label htmlFor={`answer-${currentQuestion.id}`} className="mb-2 block text-label-sm font-medium text-brand-ink">
                          {currentQuestion.questionType === 'essay' ? 'Jawaban esai' : 'Jawaban'}
                        </label>
                        <textarea
                          id={`answer-${currentQuestion.id}`}
                          aria-label={`Soal ${currentQuestion.number}`}
                          rows={currentQuestion.questionType === 'essay' ? 10 : 3}
                          value={currentAnswer}
                          onChange={(event) => updateAnswer(currentQuestion.id, event.target.value)}
                          className="w-full resize-y rounded-lg border border-brand-line bg-white px-4 py-3 text-body-sm leading-relaxed text-brand-ink placeholder:text-brand-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-accent"
                          placeholder={currentQuestion.questionType === 'essay' ? 'Tulis jawaban secara runtut dan lengkap.' : 'Tulis jawaban singkat.'}
                        />
                        <div className="mt-2 flex items-center justify-between gap-4 text-label-xs text-brand-ink-muted">
                          <span>{currentQuestion.questionType === 'essay' ? 'Jawaban tersimpan otomatis saat kamu mengetik.' : 'Periksa kembali ejaan jawabanmu.'}</span>
                          <span>{currentAnswer.length} karakter</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-line px-5 py-4 sm:px-7">
                    <Button
                      variant="secondary"
                      disabled={safeIndex === 0}
                      onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                    >
                      Sebelumnya
                    </Button>
                    <div className="flex items-center gap-2">
                      {safeIndex < questions.length - 1 ? (
                        <Button onClick={() => setCurrentIndex((index) => Math.min(questions.length - 1, index + 1))}>
                          Berikutnya
                        </Button>
                      ) : (
                        <Button loading={submitting} disabled={submitting} onClick={() => void submit()}>
                          {error ? 'Coba kirim lagi' : remaining === 0 ? 'Kirim sekarang' : 'Kirim jawaban'}
                        </Button>
                      )}
                    </div>
                  </footer>
                </article>
              ) : null}

              {error ? (
                <div role="alert" className="mt-4 rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-4 py-3 text-body-sm text-brand-danger">
                  {error}
                </div>
              ) : null}

              {safeIndex < questions.length - 1 ? (
                <div className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-brand-line bg-white px-4 py-3">
                  <p className="text-body-sm text-brand-ink-muted">Selesai lebih awal?</p>
                  <Button variant="secondary" loading={submitting} disabled={submitting} onClick={() => void submit()}>
                    {error ? 'Coba kirim lagi' : 'Kirim semua jawaban'}
                  </Button>
                </div>
              ) : null}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
