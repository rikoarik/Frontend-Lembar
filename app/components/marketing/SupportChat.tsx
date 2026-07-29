'use client';

import { FormEvent, useEffect, useId, useRef, useState } from 'react';

const WHATSAPP_URL = 'https://wa.me/6285784255112';

type Reply = { answered: boolean; message: string };

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState<Reply | null>(null);
  const [loading, setLoading] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const restoreFocusRef = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      if (restoreFocusRef.current) {
        launcherRef.current?.focus();
        restoreFocusRef.current = false;
      }
      return;
    }
    inputRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        restoreFocusRef.current = true;
        setOpen(false);
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || trimmed.length > 500) return;

    setLoading(true);
    setReply(null);
    try {
      const response = await fetch('/v1/public/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || typeof body?.data?.message !== 'string') throw new Error();
      setReply({ answered: body.data.answered === true, message: body.data.message });
    } catch {
      setReply({
        answered: false,
        message: 'Maaf, kami tidak dapat menghubungi layanan chat saat ini.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60] sm:bottom-6 sm:right-6">
      {open ? (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className="flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-auto rounded-2xl border border-brand-line bg-brand-paper p-4 text-brand-ink shadow-xl sm:p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold">
                Tanya Lembar
              </h2>
              <p id={descriptionId} className="mt-1 text-sm leading-5 text-brand-muted">
                Chat ini hanya menjawab pertanyaan tentang Lembar. Chat ini tidak dapat menjawab
                topik coding atau topik umum.
              </p>
            </div>
            <button
              type="button"
              aria-label="Tutup chat"
              onClick={() => {
                restoreFocusRef.current = true;
                setOpen(false);
              }}
              className="min-h-11 min-w-11 rounded-xl border border-brand-line text-xl hover:bg-brand-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              ×
            </button>
          </div>

          {reply && (
            <div
              role={reply.answered ? 'status' : 'alert'}
              aria-live="polite"
              className="mt-4 rounded-xl bg-brand-surface p-3 text-sm leading-5"
            >
              <p className="whitespace-pre-wrap">{reply.message}</p>
              {!reply.answered && (
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-brand-ink px-4 font-semibold text-brand-paper hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Lanjutkan di WhatsApp
                </a>
              )}
            </div>
          )}

          <form onSubmit={submit} className="mt-4">
            <label htmlFor={`${titleId}-message`} className="text-sm font-medium">
              Pertanyaan
            </label>
            <textarea
              ref={inputRef}
              id={`${titleId}-message`}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={500}
              rows={3}
              required
              disabled={loading}
              className="mt-2 block w-full resize-none rounded-xl border border-brand-line bg-brand-paper px-3 py-2 text-sm focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/20 disabled:opacity-60"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-brand-muted">{message.length}/500</span>
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="min-h-11 rounded-xl bg-brand-ink px-5 text-sm font-semibold text-brand-paper hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Mengirim...' : 'Kirim'}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <button
          ref={launcherRef}
          type="button"
          aria-label="Buka chat layanan pelanggan"
          onClick={() => setOpen(true)}
          className="min-h-12 rounded-full border border-brand-line bg-brand-ink px-5 font-semibold text-brand-paper shadow-lg hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Tanya Lembar
        </button>
      )}
    </div>
  );
}
