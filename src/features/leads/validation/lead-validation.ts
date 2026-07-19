import type { LeadRole } from '@/src/types/leads';

export type ValidationFailure = { field: string; message: string };
export type ValidationResult =
  | { ok: true; value: undefined; failures: [] }
  | { ok: false; failures: ValidationFailure[] };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGIT_PATTERN = /^\d{8,13}$/;
const ROLE_VALUES: LeadRole[] = ['kepala_sekolah', 'guru', 'kurikulum', 'lainnya'];

export type LeadFormInput = {
  name: string;
  email: string;
  phone: string;
  school: string;
  role: string;
  teacherCount: string;
  goal: string;
  consent: boolean;
};

const NAME_MIN = 2;
const NAME_MAX = 80;
const SCHOOL_MIN = 2;
const SCHOOL_MAX = 120;
const GOAL_MAX = 280;

function empty(): ValidationResult {
  return { ok: true, value: undefined, failures: [] };
}

function failed(failures: ValidationFailure[]): ValidationResult {
  return { ok: false, failures };
}

function push(out: ValidationFailure[], field: string, message: string) {
  out.push({ field, message });
}

function normalizeContact(email: string, phone: string) {
  const trimmedEmail = email.trim();
  const trimmedPhone = phone.replace(/\D+/g, '');
  return { trimmedEmail, trimmedPhone };
}

export function validateLeadForm(input: LeadFormInput): ValidationResult {
  const failures: ValidationFailure[] = [];
  const trimmedName = input.name.trim();
  if (trimmedName.length < NAME_MIN || trimmedName.length > NAME_MAX) {
    push(failures, 'name', 'Nama wajib diisi (2–80 karakter).');
  }

  const { trimmedEmail, trimmedPhone } = normalizeContact(input.email, input.phone);
  if (trimmedEmail.length === 0 && trimmedPhone.length === 0) {
    push(failures, 'contact', 'Masukkan email atau nomor telepon kerja.');
  } else {
    if (trimmedEmail.length > 0 && !EMAIL_PATTERN.test(trimmedEmail)) {
      push(failures, 'email', 'Format email tidak valid.');
    }
    if (trimmedPhone.length > 0 && !PHONE_DIGIT_PATTERN.test(trimmedPhone)) {
      push(failures, 'phone', 'Nomor telepon kerja tidak valid.');
    }
  }

  const trimmedSchool = input.school.trim();
  if (trimmedSchool.length < SCHOOL_MIN || trimmedSchool.length > SCHOOL_MAX) {
    push(failures, 'school', 'Sekolah wajib diisi (2–120 karakter).');
  }

  if (!ROLE_VALUES.includes(input.role as LeadRole)) {
    push(failures, 'role', 'Pilih peran Anda di sekolah.');
  }

  const teacherCount = Number(input.teacherCount);
  if (!Number.isFinite(teacherCount) || teacherCount <= 0 || teacherCount > 5000) {
    push(failures, 'teacherCount', 'Perkiraan jumlah guru tidak valid.');
  }

  if (input.goal.trim().length > GOAL_MAX) {
    push(failures, 'goal', 'Tujuan maksimal 280 karakter.');
  }

  if (input.consent !== true) {
    push(failures, 'consent', 'Persetujuan wajib dicentang.');
  }

  return failures.length > 0 ? failed(failures) : empty();
}

export type LeadSubmissionPayload = {
  name: string;
  email?: string;
  phone?: string;
  school: string;
  role: LeadRole;
  teacherCount: number;
  goal?: string;
  consent: boolean;
};

export function toSubmissionPayload(input: LeadFormInput): LeadSubmissionPayload {
  const { trimmedEmail, trimmedPhone } = normalizeContact(input.email, input.phone);
  return {
    name: input.name.trim(),
    email: trimmedEmail.length > 0 ? trimmedEmail : undefined,
    phone: trimmedPhone.length > 0 ? trimmedPhone : undefined,
    school: input.school.trim(),
    role: input.role as LeadRole,
    teacherCount: Number(input.teacherCount),
    goal: input.goal.trim().length > 0 ? input.goal.trim() : undefined,
    consent: input.consent,
  };
}
