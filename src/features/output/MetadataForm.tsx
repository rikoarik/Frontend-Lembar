'use client';

import { useState } from 'react';
import type { PrintMetadata } from '@/src/features/output/types';

type MetadataFormProps = {
  value: PrintMetadata;
  onChange: (value: PrintMetadata) => void;
  onSave: (value: PrintMetadata) => void;
  onCancel: () => void;
};

const textFields: Array<{ name: keyof Omit<PrintMetadata, 'instructions' | 'maxScore'>; label: string; type?: string }> = [
  { name: 'schoolName', label: 'School name' },
  { name: 'teacherName', label: 'Teacher name' },
  { name: 'subject', label: 'Subject' },
  { name: 'class', label: 'Class' },
  { name: 'date', label: 'Date', type: 'date' },
  { name: 'duration', label: 'Duration' },
];

export function MetadataForm({ value, onChange, onSave, onCancel }: MetadataFormProps) {
  // ponytail: local draft avoids stale-closure on onChange; swap to useEffect sync if parent drives resets
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
      setError('School name and teacher name are required.');
      return;
    }
    onSave(draft);
  };

  return (
    <form
      className="grid gap-4 rounded-md border border-brand-line p-4"
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

      <div className="grid gap-3 sm:grid-cols-2">
        {textFields.map((field) => (
          <label key={field.name} className="grid gap-1 text-body-sm text-brand-ink">
            <span>{field.label}</span>
            <input
              className="min-h-[var(--control-md)] rounded-md border border-brand-line px-3 text-brand-ink"
              name={field.name}
              type={field.type ?? 'text'}
              value={draft[field.name]}
              onChange={(event) => update({ [field.name]: event.target.value })}
            />
          </label>
        ))}

        <label className="grid gap-1 text-body-sm text-brand-ink">
          <span>Max score</span>
          <input
            className="min-h-[var(--control-md)] rounded-md border border-brand-line px-3 text-brand-ink"
            name="maxScore"
            type="number"
            value={draft.maxScore ?? ''}
            onChange={(event) =>
              update({ maxScore: event.target.value === '' ? undefined : Number(event.target.value) })
            }
          />
        </label>
      </div>

      <label className="grid gap-1 text-body-sm text-brand-ink">
        <span>Instructions</span>
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
          Save
        </button>
        <button
          className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
