import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../(auth)/masuk/page';
import RegisterPage from '../(auth)/daftar/page';
import ForgotPasswordPage from '../(auth)/lupa-sandi/page';
import ResetPasswordPage from '../(auth)/reset-sandi/page';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('token=demo-reset'),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/reset-sandi',
}));

const lookup = {
  '/v1/auth/login': (body: { identifier: string; password: string }) => {
    if (body.identifier === 'demo' && body.password === 'demo1234') {
      return {
        ok: true as const,
        status: 200,
        body: {
          data: {
            accountId: 'acct_demo',
            workspaceId: 'ws_demo',
            workspaceKind: 'personal',
            activeRole: 'teacher',
          },
        },
      };
    }
    return {
      ok: false as const,
      status: 401,
      body: {
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Username/email/phone dan kata sandi tidak cocok.',
        },
      },
    };
  },
  '/v1/auth/recovery/request': () => ({
    ok: true as const,
    status: 200,
    body: { data: { ok: true } },
  }),
  '/v1/auth/recovery/reset': (body: { token: string }) => {
    if (body.token !== 'demo-reset') {
      return {
        ok: false as const,
        status: 400,
        body: {
          error: {
            code: 'RECOVERY_TOKEN_INVALID',
            message: 'Tautan pemulihan tidak valid.',
          },
        },
      };
    }
    return {
      ok: true as const,
      status: 200,
      body: { data: { ok: true } },
    };
  },
};

beforeEach(() => {
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const handler = Object.entries(lookup).find(([path]) => url.endsWith(path));
    if (!handler) throw new Error(`Unhandled fetch: ${url}`);
    const [, resolve] = handler;
    const payload = init?.body ? JSON.parse(String(init.body)) : undefined;
    const result = resolve(payload);
    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as unknown as typeof fetch;
});

describe('auth pages render', () => {
  it('login page renders heading and form fields', () => {
    render(<LoginPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /Masuk ke lembar/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Username, email, atau nomor telepon/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Kata sandi/i)).toBeInTheDocument();
  });

  it('forgot password page shows a generic notice on submit', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);
    await user.type(
      screen.getByLabelText(/Username, email, atau nomor telepon/i),
      'demo@example.com',
    );
    await user.click(screen.getByRole('button', { name: /Kirim tautan pemulihan/i }));
    expect(await screen.findByText(/Permintaan diterima/i)).toBeInTheDocument();
  });

  it('register page surfaces mismatch error on confirmation', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    await user.type(screen.getByLabelText(/^Username$/i), 'guru_baru');
    await user.type(screen.getByLabelText(/^Email$/i), 'guru@example.com');
    await user.type(screen.getByLabelText(/^Nomor telepon$/i), '81234567890');
    await user.type(screen.getByLabelText(/^Kata sandi$/i), 'Lengkap1234!');
    await user.type(screen.getByLabelText(/^Konfirmasi kata sandi$/i), 'BedaLagi1234!');
    await user.click(screen.getByRole('button', { name: /Buat akun/i }));
    expect(
      await screen.findByText(/Konfirmasi kata sandi tidak cocok/i),
    ).toBeInTheDocument();
  });

  it('reset password page shows success notice with valid token', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordPage />);
    await user.type(screen.getByLabelText(/^Kata sandi baru/i), 'KataSandiBaru123!');
    await user.type(screen.getByLabelText(/^Konfirmasi kata sandi/i), 'KataSandiBaru123!');
    await user.click(screen.getByRole('button', { name: /Simpan kata sandi/i }));
    expect(await screen.findByText(/Kata sandi diperbarui/i)).toBeInTheDocument();
  });
});
