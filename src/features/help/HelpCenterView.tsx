'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Panel, TextField } from '@/app/components/ui';

const HELP_TOPICS = [
  {
    id: 'generate',
    title: 'Generate draft',
    body: 'Isi sumber dan konfigurasi, lalu pantau progres pekerjaan. Draft tetap perlu ditinjau guru.',
  },
  {
    id: 'review',
    title: 'Tinjau soal',
    body: 'Gunakan mode cepat untuk daftar, mode detail untuk edit per soal. Finalisasi butuh konfirmasi terpisah.',
  },
  {
    id: 'output',
    title: 'Output & bagikan',
    body: 'Print/unduh memakai artifact yang sama. Tautan bagikan bisa dicabut kapan saja.',
  },
  {
    id: 'privacy',
    title: 'Privasi sumber',
    body: 'PDF pribadi diproses untuk draft. Jangan unggah data sensitif yang tidak diperlukan.',
  },
];

export function HelpCenterView() {
  const [assessmentId, setAssessmentId] = useState('');
  const [questionId, setQuestionId] = useState('');
  const [reason, setReason] = useState('kualitas_soal');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const onSubmitReport = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setStatus('');
    try {
      const response = await fetch('/v1/quality-reports', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: assessmentId || undefined,
          questionId: questionId || undefined,
          reason,
          note,
        }),
      });
      const json = (await response.json()) as {
        data?: { reportId: string };
        error?: { message?: string };
      };
      if (!response.ok) {
        setStatus(json.error?.message ?? 'Laporan gagal dikirim.');
      } else {
        setStatus(`Laporan diterima (${json.data?.reportId}). Konten soal tidak dikirim utuh.`);
        setNote('');
      }
    } catch {
      setStatus('Tidak dapat terhubung. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-semibold text-brand-ink">Bantuan & laporan kualitas</h1>
        <p className="text-body-sm text-brand-ink-muted">
          Panduan ringkas dan pelaporan soal bermasalah tanpa membocorkan isi asesmen penuh.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {HELP_TOPICS.map((topic) => (
          <Panel key={topic.id} title={topic.title}>
            <p className="text-body-default text-brand-ink-muted">{topic.body}</p>
          </Panel>
        ))}
      </div>

      <Panel
        title="Laporkan soal bermasalah"
        description="Kirim ID referensi + alasan. Hindari menempel stem/opsi lengkap bila tidak perlu."
      >
        <form className="flex flex-col gap-3" onSubmit={onSubmitReport}>
          <TextField
            label="ID lembar (opsional)"
            value={assessmentId}
            onChange={(e) => setAssessmentId(e.target.value)}
            placeholder="asm_..."
          />
          <TextField
            label="ID soal (opsional)"
            value={questionId}
            onChange={(e) => setQuestionId(e.target.value)}
            placeholder="asm_...-q1"
          />
          <label className="flex flex-col gap-1">
            <span className="text-label-semibold">Alasan</span>
            <select
              className="min-h-[var(--control-md)] rounded-md border border-brand-line px-3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="kualitas_soal">Kualitas soal</option>
              <option value="kunci_salah">Kunci/pembahasan rancu</option>
              <option value="privasi">Isu privasi sumber</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-label-semibold">Catatan aman</span>
            <textarea
              className="min-h-24 rounded-md border border-brand-line px-3 py-2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Jelaskan masalah secara ringkas tanpa data sensitif."
              required
            />
          </label>
          {status ? (
            <p className="text-body-sm text-brand-ink-muted" role="status">
              {status}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={busy} loadingLabel="Mengirim…">
              Kirim laporan
            </Button>
            <Link
              href="/bantuan"
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4"
            >
              Bantuan publik
            </Link>
          </div>
        </form>
      </Panel>
    </div>
  );
}
