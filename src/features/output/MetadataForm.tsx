'use client';

import { useState } from 'react';
import type { LetterheadTemplate, PrintMetadata } from '@/src/features/output/types';

type MetadataFormProps = {
  value: PrintMetadata;
  onChange: (value: PrintMetadata) => void;
  onSave: (value: PrintMetadata) => void;
  onCancel: () => void;
};

const examFields: Array<{ name: keyof PrintMetadata; label: string; type?: string }> = [
  { name: 'teacherName', label: 'Nama guru' },
  { name: 'subject', label: 'Mata pelajaran' },
  { name: 'class', label: 'Kelas / Program' },
  { name: 'date', label: 'Hari / Tanggal' },
  { name: 'duration', label: 'Waktu pengerjaan' },
];

const identityFields: Array<{ name: keyof PrintMetadata; label: string; placeholder?: string }> = [
  { name: 'authorityName', label: 'Nama pemerintah / yayasan', placeholder: 'PEMERINTAH KABUPATEN …' },
  { name: 'departmentName', label: 'Nama dinas / unit', placeholder: 'DINAS PENDIDIKAN' },
  { name: 'schoolName', label: 'Nama sekolah' },
  { name: 'schoolAddress', label: 'Alamat sekolah' },
  { name: 'schoolContact', label: 'Kontak sekolah', placeholder: 'Telepon, email, atau situs' },
];

const templates: Array<{ value: LetterheadTemplate; label: string; detail: string }> = [
  { value: 'official', label: 'Resmi — dua logo', detail: 'Logo kiri dan kanan, identitas terpusat, garis ganda.' },
  { value: 'compact', label: 'Ringkas — satu logo', detail: 'Satu logo kiri dengan identitas sekolah.' },
  { value: 'simple', label: 'Sederhana — tanpa logo', detail: 'Identitas teks saja dengan garis resmi.' },
];

export function MetadataForm({ value, onChange, onSave, onCancel }: MetadataFormProps) {
  const [draft, setDraft] = useState<PrintMetadata>(value);
  const [error, setError] = useState('');

  const update = (patch: Partial<PrintMetadata>) => {
    setError('');
    const next = { ...draft, ...patch };
    setDraft(next);
    onChange(next);
  };

  const save = () => {
    if (!draft.schoolName.trim() || !draft.teacherName.trim()) {
      setError('Nama sekolah dan nama guru wajib diisi.');
      return;
    }
    onSave(draft);
  };

  const uploadLogo = async (side: 'leftLogoDataUrl' | 'rightLogoDataUrl', file?: File) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Logo harus berupa PNG, JPG, atau WebP.');
      return;
    }
    if (file.size > 600 * 1024) {
      setError('Ukuran setiap logo maksimal 600 KB.');
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Logo gagal dibaca.'));
      reader.readAsDataURL(file);
    }).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : 'Logo gagal dibaca.');
      return '';
    });
    if (dataUrl) update({ [side]: dataUrl });
  };

  return (
    <form
      className="grid gap-5 rounded-md border border-brand-line p-4"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      {error ? <p className="text-body-sm text-brand-danger" role="alert">{error}</p> : null}

      <fieldset className="grid gap-3">
        <legend className="mb-2 text-body-sm font-semibold text-brand-ink">Template kop</legend>
        <div className="grid gap-2">
          {templates.map((template) => (
            <label key={template.value} className="flex cursor-pointer gap-3 rounded-md border border-brand-line p-3">
              <input
                type="radio"
                name="headerTemplate"
                value={template.value}
                checked={(draft.headerTemplate ?? 'official') === template.value}
                onChange={() => update({ headerTemplate: template.value })}
              />
              <span>
                <span className="block text-body-sm font-medium text-brand-ink">{template.label}</span>
                <span className="block text-label-sm text-brand-ink-muted">{template.detail}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-2 text-body-sm font-semibold text-brand-ink">Identitas kop</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {identityFields.map((field) => (
            <TextField key={field.name} field={field} draft={draft} update={update} />
          ))}
        </div>
        {draft.headerTemplate !== 'simple' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <LogoField
              label="Logo kiri"
              value={draft.leftLogoDataUrl}
              onUpload={(file) => void uploadLogo('leftLogoDataUrl', file)}
              onClear={() => update({ leftLogoDataUrl: undefined })}
            />
            {draft.headerTemplate === 'official' ? (
              <LogoField
                label="Logo kanan"
                value={draft.rightLogoDataUrl}
                onUpload={(file) => void uploadLogo('rightLogoDataUrl', file)}
                onClear={() => update({ rightLogoDataUrl: undefined })}
              />
            ) : null}
          </div>
        ) : null}
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-2 text-body-sm font-semibold text-brand-ink">Informasi ujian</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {examFields.map((field) => (
            <TextField key={field.name} field={field} draft={draft} update={update} />
          ))}
          <label className="grid gap-1 text-body-sm text-brand-ink">
            <span>Nilai maksimal</span>
            <input
              className="min-h-[var(--control-md)] rounded-md border border-brand-line px-3 text-brand-ink"
              name="maxScore"
              type="number"
              value={draft.maxScore ?? ''}
              onChange={(event) => update({ maxScore: event.target.value === '' ? undefined : Number(event.target.value) })}
            />
          </label>
        </div>
      </fieldset>

      <label className="grid gap-1 text-body-sm text-brand-ink">
        <span>Instruksi pengerjaan</span>
        <textarea
          className="min-h-24 rounded-md border border-brand-line px-3 py-2 text-brand-ink"
          name="instructions"
          value={draft.instructions}
          onChange={(event) => update({ instructions: event.target.value })}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-white" type="submit">Simpan template</button>
        <button className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4" type="button" onClick={onCancel}>Batal</button>
      </div>
    </form>
  );
}

function TextField({ field, draft, update }: {
  field: { name: keyof PrintMetadata; label: string; type?: string; placeholder?: string };
  draft: PrintMetadata;
  update: (patch: Partial<PrintMetadata>) => void;
}) {
  return (
    <label className="grid gap-1 text-body-sm text-brand-ink">
      <span>{field.label}</span>
      <input
        className="min-h-[var(--control-md)] rounded-md border border-brand-line px-3 text-brand-ink"
        name={field.name}
        type={field.type ?? 'text'}
        placeholder={field.placeholder}
        value={typeof draft[field.name] === 'string' ? String(draft[field.name]) : ''}
        onChange={(event) => update({ [field.name]: event.target.value })}
      />
    </label>
  );
}

function LogoField({ label, value, onUpload, onClear }: {
  label: string;
  value?: string;
  onUpload: (file?: File) => void;
  onClear: () => void;
}) {
  return (
    <div className="grid gap-2 rounded-md border border-brand-line p-3">
      <span className="text-body-sm text-brand-ink">{label}</span>
      <div className="flex items-center gap-3">
        {value ? <img className="h-12 w-12 object-contain" src={value} alt={`Pratinjau ${label.toLowerCase()}`} /> : <div className="h-12 w-12 rounded border border-dashed border-brand-line" />}
        <label className="cursor-pointer rounded-md border border-brand-line px-3 py-2 text-label-sm">
          Pilih gambar
          <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => onUpload(event.target.files?.[0])} />
        </label>
        {value ? <button type="button" className="text-label-sm text-brand-danger" onClick={onClear}>Hapus</button> : null}
      </div>
      <span className="text-label-sm text-brand-ink-muted">PNG/JPG/WebP, maksimal 600 KB.</span>
    </div>
  );
}
