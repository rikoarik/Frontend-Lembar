'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { LetterheadTemplate, PrintMetadata } from '@/src/features/output/types';

type MetadataFormProps = {
  value: PrintMetadata;
  onChange: (value: PrintMetadata) => void;
  onSave: (value: PrintMetadata) => void;
  onCancel: () => void;
};

export function MetadataForm({ value, onChange, onSave, onCancel }: MetadataFormProps) {
  const t = useTranslations('output');
  const [draft, setDraft] = useState<PrintMetadata>(value);
  const [error, setError] = useState('');

  const examFields: Array<{ name: keyof PrintMetadata; label: string }> = [
    { name: 'teacherName', label: t('metadataForm.teacherName') },
    { name: 'subject', label: t('metadataForm.subject') },
    { name: 'class', label: t('metadataForm.class') },
    { name: 'date', label: t('metadataForm.date') },
    { name: 'duration', label: t('metadataForm.duration') },
  ];

  const identityFields: Array<{
    name: keyof PrintMetadata;
    label: string;
    placeholder?: string;
  }> = [
    {
      name: 'authorityName',
      label: t('metadataForm.authorityName'),
      placeholder: t('metadataForm.authorityNamePlaceholder'),
    },
    {
      name: 'departmentName',
      label: t('metadataForm.departmentName'),
      placeholder: t('metadataForm.departmentNamePlaceholder'),
    },
    { name: 'schoolName', label: t('metadataForm.schoolName') },
    { name: 'schoolAddress', label: t('metadataForm.schoolAddress') },
    {
      name: 'schoolContact',
      label: t('metadataForm.schoolContact'),
      placeholder: t('metadataForm.schoolContactPlaceholder'),
    },
  ];

  const templates: Array<{ value: LetterheadTemplate; label: string; detail: string }> = [
    {
      value: 'official',
      label: t('metadataForm.templateOfficial'),
      detail: t('metadataForm.templateOfficialDetail'),
    },
    {
      value: 'compact',
      label: t('metadataForm.templateCompact'),
      detail: t('metadataForm.templateCompactDetail'),
    },
    {
      value: 'simple',
      label: t('metadataForm.templateSimple'),
      detail: t('metadataForm.templateSimpleDetail'),
    },
  ];

  const update = (patch: Partial<PrintMetadata>) => {
    setError('');
    const next = { ...draft, ...patch };
    setDraft(next);
    onChange(next);
  };

  const save = () => {
    if (!draft.schoolName.trim() || !draft.teacherName.trim()) {
      setError(t('metadataForm.schoolNameTeacherRequired'));
      return;
    }
    onSave(draft);
  };

  const uploadLogo = async (side: 'leftLogoDataUrl' | 'rightLogoDataUrl', file?: File) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError(t('metadataForm.logoTypeError'));
      return;
    }
    if (file.size > 600 * 1024) {
      setError(t('metadataForm.logoSizeError'));
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error(t('metadataForm.logoReadError')));
      reader.readAsDataURL(file);
    }).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : t('metadataForm.logoReadError'));
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
      {error ? (
        <p className="text-body-sm text-brand-danger" role="alert">
          {error}
        </p>
      ) : null}

      <fieldset className="grid gap-3">
        <legend className="mb-2 text-body-sm font-semibold text-brand-ink">
          {t('metadataForm.templateSection')}
        </legend>
        <div className="grid gap-2">
          {templates.map((template) => (
            <label
              key={template.value}
              className="flex cursor-pointer gap-3 rounded-md border border-brand-line p-3"
            >
              <input
                type="radio"
                name="headerTemplate"
                value={template.value}
                checked={(draft.headerTemplate ?? 'official') === template.value}
                onChange={() => update({ headerTemplate: template.value })}
              />
              <span>
                <span className="block text-body-sm font-medium text-brand-ink">
                  {template.label}
                </span>
                <span className="block text-label-sm text-brand-ink-muted">{template.detail}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-2 text-body-sm font-semibold text-brand-ink">
          {t('metadataForm.identitySection')}
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {identityFields.map((field) => (
            <TextField key={field.name} field={field} draft={draft} update={update} />
          ))}
        </div>
        {draft.headerTemplate !== 'simple' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <LogoField
              label={t('metadataForm.leftLogo')}
              value={draft.leftLogoDataUrl}
              onUpload={(file) => void uploadLogo('leftLogoDataUrl', file)}
              onClear={() => update({ leftLogoDataUrl: undefined })}
            />
            {draft.headerTemplate === 'official' ? (
              <LogoField
                label={t('metadataForm.rightLogo')}
                value={draft.rightLogoDataUrl}
                onUpload={(file) => void uploadLogo('rightLogoDataUrl', file)}
                onClear={() => update({ rightLogoDataUrl: undefined })}
              />
            ) : null}
          </div>
        ) : null}
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-2 text-body-sm font-semibold text-brand-ink">
          {t('metadataForm.examSection')}
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {examFields.map((field) => (
            <TextField key={field.name} field={field} draft={draft} update={update} />
          ))}
          <label className="grid gap-1 text-body-sm text-brand-ink">
            <span>{t('metadataForm.maxScore')}</span>
            <input
              className="min-h-[var(--control-md)] rounded-md border border-brand-line px-3 text-brand-ink"
              name="maxScore"
              type="number"
              value={draft.maxScore ?? ''}
              onChange={(event) =>
                update({
                  maxScore: event.target.value === '' ? undefined : Number(event.target.value),
                })
              }
            />
          </label>
        </div>
      </fieldset>

      <label className="grid gap-1 text-body-sm text-brand-ink">
        <span>{t('metadataForm.instructions')}</span>
        <textarea
          className="min-h-24 rounded-md border border-brand-line px-3 py-2 text-brand-ink"
          name="instructions"
          value={draft.instructions}
          onChange={(event) => update({ instructions: event.target.value })}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-white"
          type="submit"
        >
          {t('metadataForm.saveTemplate')}
        </button>
        <button
          className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4"
          type="button"
          onClick={onCancel}
        >
          {t('metadataForm.cancel')}
        </button>
      </div>
    </form>
  );
}

function TextField({
  field,
  draft,
  update,
}: {
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

function LogoField({
  label,
  value,
  onUpload,
  onClear,
}: {
  label: string;
  value?: string;
  onUpload: (file?: File) => void;
  onClear: () => void;
}) {
  const t = useTranslations('output');
  return (
    <div className="grid gap-2 rounded-md border border-brand-line p-3">
      <span className="text-body-sm text-brand-ink">{label}</span>
      <div className="flex items-center gap-3">
        {value ? (
          <img
            className="h-12 w-12 object-contain"
            src={value}
            alt={t('metadataForm.logoPreview', { label: label.toLowerCase() })}
          />
        ) : (
          <div className="h-12 w-12 rounded border border-dashed border-brand-line" />
        )}
        <label className="cursor-pointer rounded-md border border-brand-line px-3 py-2 text-label-sm">
          {t('metadataForm.chooseImage')}
          <input
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => onUpload(event.target.files?.[0])}
          />
        </label>
        {value ? (
          <button type="button" className="text-label-sm text-brand-danger" onClick={onClear}>
            {t('metadataForm.delete')}
          </button>
        ) : null}
      </div>
      <span className="text-label-sm text-brand-ink-muted">{t('metadataForm.logoNote')}</span>
    </div>
  );
}
