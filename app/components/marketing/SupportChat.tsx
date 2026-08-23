'use client';

import { FormEvent, useCallback, useEffect, useId, useRef, useState } from 'react';

const WHATSAPP_URL = 'https://wa.me/6285784255112';

type Reply = { answered: boolean; message: string; whatsappUrl?: string };
type Message = { role: 'user' | 'bot'; text: string; whatsappUrl?: string };

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollLockYRef = useRef(0);
  const titleId = useId();

  const closeChat = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 100);
    return () => window.clearTimeout(timer);
  }, [open]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages, loading]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeChat();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeChat, open]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (isMobile && open) {
      scrollLockYRef.current = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      window.scrollTo?.(0, scrollLockYRef.current);
      scrollLockYRef.current = 0;
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      window.scrollTo?.(0, scrollLockYRef.current);
      scrollLockYRef.current = 0;
    };
  }, [isMobile, open]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setRequestError('');
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/v1/public/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      const body = await response.json().catch(() => null);
      // The BFF intentionally returns a structured support fallback on 429/502.
      // Render that response instead of discarding it as a transport outage.
      if (typeof body?.data?.message !== 'string') throw new Error();
      const reply: Reply = body.data;
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: reply.message, whatsappUrl: reply.whatsappUrl },
      ]);
    } catch {
      setRequestError('Tidak dapat menghubungi layanan chat.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: 'Maaf, layanan chat sedang tidak tersedia.',
          whatsappUrl: WHATSAPP_URL,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit(e as unknown as FormEvent);
    }
  }

  const chatWindow = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={
        isMobile
          ? 'fixed inset-0 z-[80] flex flex-col bg-white overscroll-contain'
          : 'flex flex-col overflow-hidden rounded-2xl border border-[#e6dfd4] bg-white shadow-2xl'
      }
      style={isMobile ? {} : { width: 360, height: 520 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#e6dfd4] bg-[#a3202b] px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <span className="material-symbols-outlined text-[20px] text-white">support_agent</span>
        </div>
        <div className="flex-1 min-w-0">
          <p id={titleId} className="text-[14px] font-semibold text-white leading-tight">
            Tanya Lembar
          </p>
          <p className="text-[11px] text-white/70 leading-tight">
            Biasanya membalas dalam hitungan detik
          </p>
        </div>
        <button
          type="button"
          aria-label="Tutup chat"
          onClick={closeChat}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#faf8f5]">
        {/* Welcome bubble */}
        {messages.length === 0 && (
          <div className="flex items-start gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#a3202b]">
              <span className="material-symbols-outlined text-[14px] text-white">smart_toy</span>
            </div>
            <div className="max-w-[260px] rounded-2xl rounded-tl-sm bg-white px-3 py-2.5 shadow-sm border border-[#e6dfd4]">
              <p className="text-[13px] text-[#171717] leading-relaxed">
                Halo! Saya asisten Lembar 👋
                <br />
                Ada yang bisa saya bantu tentang platform Lembar?
              </p>
              <p className="mt-2 text-[12px] text-[#6d665d]">
                Hanya menjawab pertanyaan tentang Lembar dan tidak dapat menjawab topik coding atau
                topik umum.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {msg.role === 'bot' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#a3202b]">
                <span className="material-symbols-outlined text-[14px] text-white">smart_toy</span>
              </div>
            )}
            <div
              className={`max-w-[260px] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}
            >
              <div
                className={`rounded-2xl px-3 py-2.5 text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'rounded-br-sm bg-[#a3202b] text-white'
                    : 'rounded-bl-sm bg-white text-[#171717] shadow-sm border border-[#e6dfd4]'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
              {msg.whatsappUrl && (
                <a
                  href={msg.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#25d366] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#20bc5a] transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">chat</span>
                  Lanjutkan di WhatsApp
                </a>
              )}
            </div>
          </div>
        ))}

        {requestError ? (
          <p role="alert" className="text-[12px] text-[#a3202b]">
            {requestError}
          </p>
        ) : null}

        {loading && (
          <div className="flex items-end gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#a3202b]">
              <span className="material-symbols-outlined text-[14px] text-white">smart_toy</span>
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm border border-[#e6dfd4]">
              <div className="flex gap-1 items-center">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#8a8379] animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#8a8379] animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#8a8379] animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#e6dfd4] bg-white px-3 py-3">
        <form onSubmit={submit} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            aria-label="Pertanyaan"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pertanyaan Anda…"
            maxLength={500}
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-[#e6dfd4] bg-[#faf8f5] px-3 py-2.5 text-[13px] text-[#171717] placeholder:text-[#8a8379] focus:border-[#a3202b] focus:outline-none focus:ring-2 focus:ring-[#a3202b]/20 disabled:opacity-60 max-h-[96px] overflow-y-auto"
            style={{ lineHeight: '1.5' }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#a3202b] text-white hover:bg-[#851925] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label={loading ? 'Mengirim pesan' : 'Kirim pesan'}
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
        <p className="mt-1.5 text-center text-[10px] text-[#8a8379]">
          Ditenagai AI · Tidak bisa menjawab topik umum
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: fullscreen overlay */}
      {isMobile && open && <div className="fixed inset-0 z-[80]">{chatWindow}</div>}

      {/* Desktop: floating window */}
      {!isMobile && open && (
        <div className="fixed bottom-20 right-4 z-[60] sm:right-6 animate-in slide-in-from-bottom-4 fade-in duration-200">
          {chatWindow}
        </div>
      )}

      {/* Launcher button */}
      <div className="fixed bottom-4 right-4 z-[60] sm:bottom-6 sm:right-6">
        <button
          ref={launcherRef}
          type="button"
          aria-label={open ? 'Tutup chat' : 'Buka chat layanan pelanggan'}
          onClick={() => setOpen((v) => !v)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#a3202b] text-white shadow-lg hover:bg-[#851925] active:scale-95 transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3202b]"
        >
          <span
            className={`material-symbols-outlined text-[26px] transition-all duration-200 ${open ? 'rotate-90 opacity-0 absolute' : 'rotate-0 opacity-100'}`}
          >
            chat
          </span>
          <span
            className={`material-symbols-outlined text-[26px] transition-all duration-200 ${open ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0 absolute'}`}
          >
            close
          </span>

          {/* Pulse ring — hanya saat tutup */}
          {!open && (
            <span className="absolute inset-0 rounded-full bg-[#a3202b] animate-ping opacity-20" />
          )}

          {/* Tooltip */}
          {!open && (
            <span className="absolute right-16 whitespace-nowrap rounded-lg bg-[#171717] px-2.5 py-1.5 text-[12px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
              Tanya Lembar
            </span>
          )}
        </button>
      </div>
    </>
  );
}
