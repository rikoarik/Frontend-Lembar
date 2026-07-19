export type ValidationFailure = { field: string; message: string };
export type ValidationResult =
  | { ok: true; value: undefined; failures: [] }
  | { ok: false; failures: ValidationFailure[] };

const ID_PATTERN = /^[a-zA-Z0-9_.-]{3,32}$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_.]{3,24}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGIT_PATTERN = /^\d{8,13}$/;
const PHONE_HAS_DIGITS = /\d{8,}/;
const MIN_PASSWORD = 12;
const PASSWORD_UPPER = /[A-Z]/;
const PASSWORD_NUMBER = /\d/;
const PASSWORD_SYMBOL = /[^A-Za-z0-9]/;

export type PasswordRule = {
  key: 'length' | 'uppercase' | 'number' | 'symbol';
  label: string;
  valid: boolean;
};

export function passwordRules(password: string): PasswordRule[] {
  return [
    {
      key: 'length',
      label: `Minimal ${MIN_PASSWORD} karakter`,
      valid: password.length >= MIN_PASSWORD,
    },
    {
      key: 'uppercase',
      label: 'Ada huruf besar',
      valid: PASSWORD_UPPER.test(password),
    },
    {
      key: 'number',
      label: 'Ada angka',
      valid: PASSWORD_NUMBER.test(password),
    },
    {
      key: 'symbol',
      label: 'Ada simbol',
      valid: PASSWORD_SYMBOL.test(password),
    },
  ];
}

function passwordFailure(password: string): string | null {
  return passwordRules(password).every((rule) => rule.valid)
    ? null
    : 'Kata sandi harus minimal 12 karakter, berisi huruf besar, angka, dan simbol.';
}

function empty(): ValidationResult {
  return { ok: true, value: undefined, failures: [] };
}

function failed(failures: ValidationFailure[]): ValidationResult {
  return { ok: false, failures };
}

function push(out: ValidationFailure[], field: string, message: string) {
  out.push({ field, message });
}

export function validateLogin(input: { identifier: string; password: string }): ValidationResult {
  const failures: ValidationFailure[] = [];
  const identifier = input.identifier.trim();
  if (identifier.length === 0) {
    push(failures, 'identifier', 'Masukkan username, email, atau nomor telepon.');
  } else if (identifier.includes('@')) {
    if (!EMAIL_PATTERN.test(identifier)) {
      push(failures, 'identifier', 'Format email tidak valid.');
    }
  } else if (!PHONE_HAS_DIGITS.test(identifier) && !ID_PATTERN.test(identifier)) {
    push(failures, 'identifier', 'Format identitas tidak dikenali.');
  }
  if (input.password.length === 0) {
    push(failures, 'password', 'Masukkan kata sandi.');
  }
  return failures.length > 0 ? failed(failures) : empty();
}

export function validateRegister(input: {
  username: string;
  email: string;
  phone: string;
  password: string;
}): ValidationResult {
  const failures: ValidationFailure[] = [];
  if (!USERNAME_PATTERN.test(input.username.trim())) {
    push(failures, 'username', 'Gunakan 3–24 karakter, huruf, angka, titik, atau underscore.');
  }
  if (!EMAIL_PATTERN.test(input.email.trim())) {
    push(failures, 'email', 'Format email tidak valid.');
  }
  if (!PHONE_DIGIT_PATTERN.test(input.phone.replace(/\D+/g, ''))) {
    push(
      failures,
      'phone',
      input.phone.trim().length === 0 ? 'Masukkan nomor telepon.' : 'Nomor telepon tidak valid.',
    );
  }
  const passwordError = passwordFailure(input.password);
  if (passwordError) {
    push(failures, 'password', passwordError);
  }
  return failures.length > 0 ? failed(failures) : empty();
}

export function validateRecoveryRequest(input: { identifier: string }): ValidationResult {
  const failures: ValidationFailure[] = [];
  const identifier = input.identifier.trim();
  if (identifier.length === 0) {
    push(failures, 'identifier', 'Masukkan username, email, atau nomor telepon.');
  } else if (identifier.includes('@')) {
    if (!EMAIL_PATTERN.test(identifier)) {
      push(failures, 'identifier', 'Format email tidak valid.');
    }
  } else if (!PHONE_HAS_DIGITS.test(identifier) && !ID_PATTERN.test(identifier)) {
    push(failures, 'identifier', 'Format identitas tidak dikenali.');
  }
  return failures.length > 0 ? failed(failures) : empty();
}

export function validateResetPassword(input: {
  token: string;
  password: string;
}): ValidationResult {
  const failures: ValidationFailure[] = [];
  if (input.token.trim().length === 0) {
    push(failures, 'token', 'Tautan pemulihan tidak ditemukan.');
  }
  const passwordError = passwordFailure(input.password);
  if (passwordError) {
    push(failures, 'password', passwordError);
  }
  return failures.length > 0 ? failed(failures) : empty();
}

export function validateInvitationAccept(input: {
  username: string;
  email: string;
  phone: string;
  password: string;
}): ValidationResult {
  return validateRegister(input);
}

export const PASSWORD_MIN = MIN_PASSWORD;
