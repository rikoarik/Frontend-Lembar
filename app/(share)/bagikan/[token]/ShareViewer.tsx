'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/app/components/ui';

type ShareState = 'loading' | 'valid' | 'revoked' | 'expired' | 'error';

interface QuestionOption {
  key: string;
  text: string;
}

interface ShareQuestion {
  id: string;
  blueprintSequence: number;
  questionType: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false';
  difficulty: 'easy' | 'medium' | 'hard';
  stem: string;
  options: QuestionOption[];
  answer: string;
  explanation: string;
}

interface ShareData {
  assessmentId: string;
  title: string | null;
  expiresAt: string;
  questions: ShareQuestion[];
}

// Wire to real BE via BFF proxy at /v1/shares/:token
async function fetchShare(
  token: string,
): Promise<{ state: ShareState; data?: ShareData; errorMessage?: string }> {
  try {
    const res = await fetch(`/v1/shares/${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.status === 401) return { state: 'revoked' };
    if (res.status === 410) {
      const body = (await res.json()) as { error?: { code?: string } };
      const code = body?.error?.code ?? '';
      if (code === 'SHARE_REVOKED') return { state: 'revoked' };
      return { state: 'expired' };
    }
    if (res.status === 404) return { state: 'revoked' };

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      return {
        state: 'error',
        errorMessage: body?.error?.message ?? `Error ${res.status}`,
      };
    }

    const json = (await res.json()) as {
      data?: {
        assessmentId: string;
        title: string | null;
        expiresAt: string;
        questions: ShareQuestion[];
      };
    };

    if (!json.data) return { state: 'error', errorMessage: 'Respons tidak valid dari server.' };

    // Check if link is expired based on expiresAt field
    if (json.data.expiresAt && new Date(json.data.expiresAt) < new Date()) {
      return { state: 'expired' };
    }

    return {
      state: 'valid',
      data: {
        assessmentId: json.data.assessmentId,
        title: json.data.title,
        expiresAt: json.data.expiresAt,
        questions: json.data.questions ?? [],
      },
    };
  } catch {
    return { state: 'error', errorMessage: 'Gagal memuat halaman ini. Periksa koneksi internet.' };
  }
}

export default function ShareViewer({ token }: { token: string }) {
  const [state, setState] = useState<ShareState>('loading');
  const [data, setData] = useState<ShareData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const result = await fetchShare(token);
      if (cancelled) return;
      setState(result.state);
      setData(result.data ?? null);
      setErrorMessage(result.errorMessage ?? '');
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <div className="animate-pulse text-brand-muted text-body-sm">Memuat...</div>
        </div>
      </div>
    );
  }

  if (state === 'revoked') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <h1 className="text-body-xl font-semibold text-brand-ink mb-2">Tautan tidak tersedia</h1>
          <p className="text-body-sm text-brand-muted mb-4">
            Tautan berbagi ini telah dicabut oleh pembuat. Hubungi guru atau tim Anda untuk akses
            ulang.
          </p>
        </div>
      </div>
    );
  }

  if (state === 'expired') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <h1 className="text-body-xl font-semibold text-brand-ink mb-2">Tautan kedaluwarsa</h1>
          <p className="text-body-sm text-brand-muted mb-4">
            Tautan berbagi ini sudah tidak berlaku. Minta tautan baru dari pembuat lembar.
          </p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <h1 className="text-body-xl font-semibold text-brand-ink mb-2">Tidak dapat dimuat</h1>
          <p className="text-body-sm text-brand-muted mb-4">
            {errorMessage || 'Terjadi kesalahan. Coba lagi nanti.'}
          </p>
          <Button size="sm" onClick={() => window.location.reload()}>
            Coba lagi
          </Button>
        </div>
      </div>
    );
  }

  // state === 'valid'
  const title = data?.title ?? 'Lembar Soal';
  const questions = data?.questions ?? [];

  return (
    <div className="min-h-screen bg-brand-surface px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-[22px] font-bold text-brand-ink mb-1">{title}</h1>
          {data?.expiresAt && (
            <p className="text-body-sm text-brand-muted">
              Berlaku hingga {new Date(data.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </header>

        {/* Questions */}
        {questions.length === 0 ? (
          <div className="text-center py-12 text-brand-muted text-body-sm">
            Belum ada soal tersedia untuk lembar ini.
          </div>
        ) : (
          <ol className="space-y-6">
            {questions
              .slice()
              .sort((a, b) => a.blueprintSequence - b.blueprintSequence)
              .map((q, idx) => (
                <li
                  key={q.id}
                  className="rounded-lg border border-brand-line bg-white px-5 py-4"
                >
                  {/* Question stem */}
                  <p className="text-body-base font-medium text-brand-ink mb-3">
                    <span className="mr-2 text-brand-muted">{idx + 1}.</span>
                    {q.stem}
                  </p>

                  {/* Options for MC / T-F */}
                  {q.options && q.options.length > 0 && (
                    <ul className="space-y-1 mb-3 pl-4">
                      {q.options.map((opt) => (
                        <li
                          key={opt.key}
                          className={`text-body-sm rounded px-2 py-1 ${
                            opt.key === q.answer
                              ? 'bg-brand-success/10 text-brand-success font-medium'
                              : 'text-brand-ink'
                          }`}
                        >
                          <span className="font-medium mr-2">{opt.key}.</span>
                          {opt.text}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Answer for short_answer / essay */}
                  {(q.questionType === 'short_answer' || q.questionType === 'essay') &&
                    q.answer && (
                      <div className="mt-2 rounded bg-brand-success/10 px-3 py-2 text-body-sm text-brand-success">
                        <span className="font-medium">Jawaban: </span>
                        {q.answer}
                      </div>
                    )}

                  {/* Explanation */}
                  {q.explanation && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-body-sm text-brand-muted select-none">
                        Penjelasan
                      </summary>
                      <p className="mt-1 text-body-sm text-brand-ink pl-1">{q.explanation}</p>
                    </details>
                  )}

                  {/* Metadata badge */}
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <span className="inline-block rounded-full bg-brand-surface border border-brand-line px-2 py-0.5 text-[11px] text-brand-muted capitalize">
                      {q.questionType.replace('_', ' ')}
                    </span>
                    <span className="inline-block rounded-full bg-brand-surface border border-brand-line px-2 py-0.5 text-[11px] text-brand-muted capitalize">
                      {q.difficulty}
                    </span>
                  </div>
                </li>
              ))}
          </ol>
        )}
      </div>
    </div>
  );
}
