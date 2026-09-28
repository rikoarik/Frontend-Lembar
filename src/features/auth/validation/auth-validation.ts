export type ValidationFailure = { field: string; message: AuthValidationKey };
export type ValidationResult =
  | { ok: true; value: undefined; failures: [] }
  | { ok: false; failures: ValidationFailure[] };

/**
 * Message keys relative to the `auth` namespace (`messages/<locale>/auth.json`).
 * Renderers resolve them with `useTranslations('auth')`, so this module stays
 * locale-free and never hardcodes user-visible copy.
 */
export type AuthValidationKey =
  | 'validation.identifierRequired'
  | 'validation.emailInvalid'
  | 'validation.identifierUnrecognized'
  | 'validation.passwordRequired'
  | 'validation.passwordTooWeak'
  | 'validation.usernameInvalid'
  | 'validation.phoneRequired'
  | 'validation.phoneInvalid'
  | 'validation.tokenMissing';

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
  valid: boolean;
};

export function passwordRules(password: string): PasswordRule[] {
  return [
    {
      key: 'length',
      valid: password.length >= MIN_PASSWORD,
    },
    {
      key: 'uppercase',
      valid: PASSWORD_UPPER.test(password),
    },
    {
      key: 'number',
      valid: PASSWORD_NUMBER.test(password),
    },
    {
      key: 'symbol',
      valid: PASSWORD_SYMBOL.test(password),
    },
  ];
}

function passwordFailure(password: string): AuthValidationKey | null {
  return passwordRules(password).every((rule) => rule.valid) ? null : 'validation.passwordTooWeak';
}

function empty(): ValidationResult {
  return { ok: true, value: undefined, failures: [] };
}

function failed(failures: ValidationFailure[]): ValidationResult {
  return { ok: false, failures };
}

function push(out: ValidationFailure[], field: string, message: AuthValidationKey) {
  out.push({ field, message });
}

export function validateLogin(input: { identifier: string; password: string }): ValidationResult {
  const failures: ValidationFailure[] = [];
  const identifier = input.identifier.trim();
  if (identifier.length === 0) {
    push(failures, 'identifier', 'validation.identifierRequired');
  } else if (identifier.includes('@')) {
    if (!EMAIL_PATTERN.test(identifier)) {
      push(failures, 'identifier', 'validation.emailInvalid');
    }
  } else if (!PHONE_HAS_DIGITS.test(identifier) && !ID_PATTERN.test(identifier)) {
    push(failures, 'identifier', 'validation.identifierUnrecognized');
  }
  if (input.password.length === 0) {
    push(failures, 'password', 'validation.passwordRequired');
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
    push(failures, 'username', 'validation.usernameInvalid');
  }
  if (!EMAIL_PATTERN.test(input.email.trim())) {
    push(failures, 'email', 'validation.emailInvalid');
  }
  if (!PHONE_DIGIT_PATTERN.test(input.phone.replace(/\D+/g, ''))) {
    push(
      failures,
      'phone',
      input.phone.trim().length === 0 ? 'validation.phoneRequired' : 'validation.phoneInvalid',
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
    push(failures, 'identifier', 'validation.identifierRequired');
  } else if (identifier.includes('@')) {
    if (!EMAIL_PATTERN.test(identifier)) {
      push(failures, 'identifier', 'validation.emailInvalid');
    }
  } else if (!PHONE_HAS_DIGITS.test(identifier) && !ID_PATTERN.test(identifier)) {
    push(failures, 'identifier', 'validation.identifierUnrecognized');
  }
  return failures.length > 0 ? failed(failures) : empty();
}

export function validateResetPassword(input: {
  token: string;
  password: string;
}): ValidationResult {
  const failures: ValidationFailure[] = [];
  if (input.token.trim().length === 0) {
    push(failures, 'token', 'validation.tokenMissing');
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
