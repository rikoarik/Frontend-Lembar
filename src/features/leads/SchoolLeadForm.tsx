'use client';

import { useState } from 'react';
import { leadsService } from '@/src/services/leads/leadsService';
import { useLeadSubmit } from './state/useLeadSubmit';
import {
  toSubmissionPayload,
  validateLeadForm,
  type LeadFormInput,
} from './validation/lead-validation';

type FieldKey = keyof LeadFormInput | 'contact';

const initialForm: LeadFormInput = {
  name: '',
  email: '',
  phone: '',
  school: '',
  role: '',
  teacherCount: '',
  goal: '',
  consent: false,
};

const fieldClass =
  'w-full rounded-lg border border-border-strong bg-surface px-unit-4 py-unit-3 font-body-sm text-body-sm text-ink placeholder:text-secondary transition-colors focus-visible:border-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/25 disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:text-secondary';
const labelClass = 'font-label-semibold text-caption text-ink';
const errorClass = 'font-caption text-caption text-burgundy';
const helpClass = 'font-caption text-caption text-secondary';

const FIELD_IDS = {
  name: 'lead-name',
  email: 'lead-email',
  phone: 'lead-phone',
  school: 'lead-school',
  role: 'lead-role',
  teacherCount: 'lead-teacher-count',
  goal: 'lead-goal',
  consent: 'lead-consent',
} as const satisfies Partial<Record<keyof LeadFormInput, string>>;

function fieldError(
  localErrors: Partial<Record<FieldKey, string>>,
  serverErrors: Record<string, string[]>,
  key: FieldKey,
): string | undefined {
  return localErrors[key] ?? serverErrors[key]?.[0];
}

function describedBy(...ids: Array<string | undefined>) {
  return ids.filter(Boolean).join(' ') || undefined;
}

function FormStatus({ message, tone }: { message?: string; tone: 'idle' | 'alert' | 'success' }) {
  if (!message) return null;
  const role = tone === 'alert' ? 'alert' : 'status';
  const className =
    tone === 'alert'
      ? 'rounded-lg border border-border-strong bg-red-50 px-unit-4 py-unit-3 font-body-sm text-body-sm text-burgundy'
      : tone === 'success'
        ? 'rounded-lg border border-border-subtle bg-surface-container-low px-unit-4 py-unit-3 font-body-sm text-body-sm text-ink'
        : 'rounded-lg border border-border-subtle bg-surface-container-low px-unit-4 py-unit-3 font-body-sm text-body-sm text-ink';
  return (
    <p role={role} aria-live={tone === 'alert' ? 'assertive' : 'polite'} className={className}>
      {message}
    </p>
  );
}

export default function SchoolLeadForm() {
  const [form, setForm] = useState<LeadFormInput>(initialForm);
  const [localErrors, setLocalErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const submit = useLeadSubmit({
    submit: (input, idempotencyKey) => leadsService.submitSchoolLead(input, idempotencyKey),
  });

  const errors = {
    name: fieldError(localErrors, submit.fieldErrors, 'name'),
    contact: fieldError(localErrors, submit.fieldErrors, 'contact'),
    email: fieldError(localErrors, submit.fieldErrors, 'email'),
    phone: fieldError(localErrors, submit.fieldErrors, 'phone'),
    school: fieldError(localErrors, submit.fieldErrors, 'school'),
    role: fieldError(localErrors, submit.fieldErrors, 'role'),
    teacherCount: fieldError(localErrors, submit.fieldErrors, 'teacherCount'),
    goal: fieldError(localErrors, submit.fieldErrors, 'goal'),
    consent: fieldError(localErrors, submit.fieldErrors, 'consent'),
  };

  const update = <K extends keyof LeadFormInput>(key: K, value: LeadFormInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setLocalErrors((current) => {
      if (!current[key] && !(key === 'email' || key === 'phone') && !current.contact) {
        return current;
      }
      const next = { ...current };
      delete next[key];
      if (key === 'email' || key === 'phone') delete next.contact;
      return next;
    });
  };

  const focusFirstInvalid = (failures: Array<{ field: string }>) => {
    const first = failures[0]?.field;
    const target = (first === 'contact' ? 'email' : first) as keyof LeadFormInput;
    const id = FIELD_IDS[target];
    if (!id) return;
    const node = document.getElementById(id);
    if (node instanceof HTMLElement) node.focus();
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateLeadForm(form);
    if (!validation.ok) {
      const next: Partial<Record<FieldKey, string>> = {};
      for (const failure of validation.failures) {
        next[failure.field as FieldKey] = failure.message;
      }
      setLocalErrors(next);
      focusFirstInvalid(validation.failures);
      return;
    }
    setLocalErrors({});
    void submit.submit(toSubmissionPayload(form));
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-unit-5 rounded-2xl border border-border-strong bg-paper p-unit-6 sm:p-unit-8"
      noValidate
      aria-busy={submit.busy}
    >
      <div className="flex flex-col gap-unit-2">
        <h2 className="font-h3 text-h3 text-ink">Minta konsultasi sekolah</h2>
        <p className="font-body-sm text-body-sm text-secondary">
          Isi data singkat. Tim lembar akan meninjau kebutuhan sekolah sebelum menghubungi Anda.
        </p>
      </div>

      <FormStatus
        tone={submit.error ? 'alert' : submit.submitted ? 'success' : 'idle'}
        message={submit.statusMessage}
      />

      <div className="flex flex-col gap-unit-2">
        <label htmlFor="lead-name" className={labelClass}>
          Nama
        </label>
        <input
          id="lead-name"
          value={form.name}
          onChange={(event) => update('name', event.target.value)}
          className={fieldClass}
          placeholder="Nama lengkap"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describedBy(errors.name ? 'lead-name-error' : undefined)}
          disabled={submit.busy}
        />
        {errors.name ? (
          <p id="lead-name-error" className={errorClass}>
            {errors.name}
          </p>
        ) : null}
      </div>

      <fieldset className="flex flex-col gap-unit-3">
        <legend className={labelClass}>Kontak kerja</legend>
        <p id="lead-contact-help" className={helpClass}>
          Isi email kerja atau nomor telepon kerja. Salah satu cukup.
        </p>
        {errors.contact ? (
          <p id="lead-contact-error" role="alert" className={errorClass}>
            {errors.contact}
          </p>
        ) : null}
        <div className="grid grid-cols-1 gap-unit-4 sm:grid-cols-2">
          <div className="flex flex-col gap-unit-2">
            <label htmlFor="lead-email" className={labelClass}>
              Email kerja
            </label>
            <input
              id="lead-email"
              type="email"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              className={fieldClass}
              placeholder="nama@sekolah.sch.id"
              aria-invalid={errors.email || errors.contact ? true : undefined}
              aria-describedby={describedBy(
                'lead-contact-help',
                errors.contact ? 'lead-contact-error' : undefined,
                errors.email ? 'lead-email-error' : undefined,
              )}
              disabled={submit.busy}
            />
            {errors.email ? (
              <p id="lead-email-error" className={errorClass}>
                {errors.email}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-unit-2">
            <label htmlFor="lead-phone" className={labelClass}>
              Nomor telepon kerja
            </label>
            <input
              id="lead-phone"
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
              className={fieldClass}
              placeholder="081234567890"
              aria-invalid={errors.phone || errors.contact ? true : undefined}
              aria-describedby={describedBy(
                'lead-contact-help',
                errors.contact ? 'lead-contact-error' : undefined,
                errors.phone ? 'lead-phone-error' : undefined,
              )}
              disabled={submit.busy}
            />
            {errors.phone ? (
              <p id="lead-phone-error" className={errorClass}>
                {errors.phone}
              </p>
            ) : null}
          </div>
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-unit-4 sm:grid-cols-2">
        <div className="flex flex-col gap-unit-2 sm:col-span-2">
          <label htmlFor="lead-school" className={labelClass}>
            Sekolah
          </label>
          <input
            id="lead-school"
            value={form.school}
            onChange={(event) => update('school', event.target.value)}
            className={fieldClass}
            placeholder="Nama sekolah"
            aria-invalid={errors.school ? true : undefined}
            aria-describedby={describedBy(errors.school ? 'lead-school-error' : undefined)}
            disabled={submit.busy}
          />
          {errors.school ? (
            <p id="lead-school-error" className={errorClass}>
              {errors.school}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-unit-2">
          <label htmlFor="lead-role" className={labelClass}>
            Peran
          </label>
          <select
            id="lead-role"
            value={form.role}
            onChange={(event) => update('role', event.target.value)}
            className={fieldClass}
            aria-invalid={errors.role ? true : undefined}
            aria-describedby={describedBy(errors.role ? 'lead-role-error' : undefined)}
            disabled={submit.busy}
          >
            <option value="">Pilih peran</option>
            <option value="kepala_sekolah">Kepala Sekolah</option>
            <option value="guru">Guru</option>
            <option value="kurikulum">Kurikulum</option>
            <option value="lainnya">Lainnya</option>
          </select>
          {errors.role ? (
            <p id="lead-role-error" className={errorClass}>
              {errors.role}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-unit-2">
          <label htmlFor="lead-teacher-count" className={labelClass}>
            Perkiraan jumlah guru
          </label>
          <input
            id="lead-teacher-count"
            type="number"
            min="1"
            value={form.teacherCount}
            onChange={(event) => update('teacherCount', event.target.value)}
            className={fieldClass}
            placeholder="Contoh: 24"
            aria-invalid={errors.teacherCount ? true : undefined}
            aria-describedby={describedBy(
              errors.teacherCount ? 'lead-teacher-count-error' : undefined,
            )}
            disabled={submit.busy}
          />
          {errors.teacherCount ? (
            <p id="lead-teacher-count-error" className={errorClass}>
              {errors.teacherCount}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-unit-2">
        <label htmlFor="lead-goal" className={labelClass}>
          Tujuan (opsional)
        </label>
        <textarea
          id="lead-goal"
          value={form.goal}
          onChange={(event) => update('goal', event.target.value)}
          className={`${fieldClass} min-h-28 resize-y`}
          placeholder="Ceritakan kebutuhan sekolah secara singkat"
          aria-invalid={errors.goal ? true : undefined}
          aria-describedby={describedBy(
            'lead-goal-help',
            errors.goal ? 'lead-goal-error' : undefined,
          )}
          disabled={submit.busy}
        />
        <p id="lead-goal-help" className={helpClass}>
          Jangan tulis data siswa atau informasi sensitif.
        </p>
        {errors.goal ? (
          <p id="lead-goal-error" className={errorClass}>
            {errors.goal}
          </p>
        ) : null}
      </div>

      <div className="flex items-start gap-unit-3 rounded-lg border border-border-subtle bg-surface px-unit-4 py-unit-3">
        <input
          id="lead-consent"
          type="checkbox"
          checked={form.consent}
          onChange={(event) => update('consent', event.target.checked)}
          className="mt-1 h-5 w-5 rounded border-border-strong text-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/25"
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={describedBy(errors.consent ? 'lead-consent-error' : undefined)}
          disabled={submit.busy}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="lead-consent" className="font-body-sm text-body-sm text-ink">
            Saya menyetujui pemrosesan data untuk menindaklanjuti permintaan sekolah.
          </label>
          {errors.consent ? (
            <p id="lead-consent-error" className={errorClass}>
              {errors.consent}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={submit.busy}
        className="min-h-12 rounded-lg bg-burgundy px-unit-6 py-unit-3 font-label-semibold text-body-default text-on-primary transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-secondary disabled:text-on-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/30 focus-visible:ring-offset-2"
      >
        {submit.busy ? 'Mengirim…' : 'Kirim permintaan'}
      </button>
    </form>
  );
}
