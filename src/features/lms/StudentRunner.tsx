'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui';
import type { PrintQuestion } from '@/src/features/output/types';

// ── Types ────────────────────────────────────────────────────────────────────

interface RunnerQuestion extends PrintQuestion {}

interface AssessmentData {
  assessmentId: string;
  title: string;
  subject: string;
  gradeLabel: string;
  questions: RunnerQuestion[];
}

type Phase = 'identity' | 'loading' | 'running' | 'done' | 'error';

// ── BFF helpers ───────────────────────────────────────────────────────────────

async function fetchQuestions(assessmentId: string): Promise<AssessmentData> {
  const res = await fetch(`/v1/lms/attempts?assessmentId=${encodeURIComponent(assessmentId)}`);
  const json = (await res.json()) as { data?: AssessmentData; error?: { message?: string } };
  if (!res.ok) throw new Error(json.error?.message ?? 'Gagal memuat soal.');
  return json.data!;
}

async function startAttempt(assessmentId: string, guestName: string, guestClass: string) {
  const res = await fetch('/v1/lms/attempts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assessmentId, guestName, guestClass }),
  });
  const json = (await res.json()) as { data?: { id: string }; error?: { message?: string } };
  if (!res.ok) throw new Error(json.error?.message ?? 'Gagal memulai sesi.');
  return json.data!;
}

async function submitAttempt(attemptId: string, answers: Record<number, string>) {
  const res = await fetch('/v1/lms/attempts', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attemptId,
      answers: Object.entries(answers).map(([number, value]) => ({ number: Number(number), value })),
    }),
  });
  const json = (await res.json()) as { data?: unknown; error?: { message?: string } };
  if (!res.ok) throw new Error(json.error?.message ?? 'Gagal mengirim jawaban.');
  return json.data;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StudentRunner({ assessmentId }: { assessmentId: string }) {
  const [phase, setPhase] = useState<Phase>('identity');
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [questions, setQuestions] = useState<RunnerQuestion[]>([]);
  const [title, setTitle] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [attemptId, setAttemptId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleStart() {
    setPhase('loading');
    try {
      const [data, attempt] = await Promise.all([
        fetchQuestions(assessmentId),
        startAttempt(assessmentId, nama, kelas),
      ]);
      setTitle(data.title);
      setQuestions(data.questions);
      setAttemptId(attempt.id);
      setPhase('running');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan.');
      setPhase('error');
    }
  }

  async function handleSubmit() {
    try {
      await submitAttempt(attemptId, answers);
      setPhase('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan.');
      // Stay on running phase, show alert
      setPhase('error');
    }
  }

  // ── Phases ────────────────────────────────────────────────────────────────

  if (phase === 'identity') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-xl font-semibold">Isi Identitas Sebelum Mulai</h1>
          <div className="space-y-4">
            <div>
              <label htmlFor="nama" className="block text-sm font-medium mb-1">
                Nama
              </label>
              <input
                id="nama"
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="kelas" className="block text-sm font-medium mb-1">
                Kelas
              </label>
              <input
                id="kelas"
                type="text"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          <Button onClick={handleStart} disabled={!nama.trim()}>
            Mulai Ujian
          </Button>
        </div>
      </main>
    );
  }

  if (phase === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Memuat soal…</p>
      </main>
    );
  }

  if (phase === 'done') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Jawaban Berhasil Dikirim</h1>
          <p className="text-sm text-gray-500">Terima kasih, {nama}. Jawaban kamu sudah tersimpan.</p>
        </div>
      </main>
    );
  }

  if (phase === 'error') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div role="alert" className="w-full max-w-md rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {errorMsg || 'Terjadi kesalahan. Silakan muat ulang halaman.'}
        </div>
      </main>
    );
  }

  // phase === 'running'
  return (
    <main className="min-h-screen px-4 py-8 max-w-2xl mx-auto space-y-8">
      {title && <h1 className="text-xl font-semibold">{title}</h1>}
      {questions.map((q) => (
        <section key={q.number} className="space-y-3">
          <p className="font-medium">
            {q.number}. {q.stem}
          </p>
          {q.questionType === 'multiple_choice' && q.options ? (
            <fieldset>
              <legend className="sr-only">Pilihan jawaban soal {q.number}</legend>
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name={`q${q.number}`}
                      value={opt.key}
                      checked={answers[q.number] === opt.key}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.number]: opt.key }))}
                    />
                    <span>
                      {opt.key}. {opt.text}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <textarea
              id={`q${q.number}-input`}
              aria-label={`Soal ${q.number}`}
              rows={4}
              className="w-full border rounded px-3 py-2 text-sm"
              value={answers[q.number] ?? ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.number]: e.target.value }))}
            />
          )}
        </section>
      ))}
      <Button onClick={handleSubmit}>Kirim Jawaban</Button>
    </main>
  );
}
