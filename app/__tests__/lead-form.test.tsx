import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KontakPage from '../(marketing)/kontak/page';

const leadsLookup: Record<
  string,
  (body: Record<string, unknown>) => {
    ok: boolean;
    status: number;
    body: Record<string, unknown>;
  }
> = {
  '/v1/leads/school': (body) => {
    const name = String(body.name ?? '').trim();
    const school = String(body.school ?? '').trim();
    const role = String(body.role ?? '');
    const teacherCountRaw = body.teacherCount;
    const teacherCount =
      typeof teacherCountRaw === 'number' ? teacherCountRaw : Number(teacherCountRaw);
    const contact = String(body.email ?? body.phone ?? '').trim();
    const consent = body.consent === true;
    if (!name || !school || !contact || !consent || !Number.isFinite(teacherCount) || teacherCount <= 0) {
      return {
        ok: false,
        status: 400,
        body: {
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Periksa kembali isian formulir.',
            fieldErrors: !consent ? { consent: ['Wajib dicentang.'] } : {},
          },
        },
      };
    }
    if (contact === 'rate-limited@example.com') {
      return {
        ok: false,
        status: 429,
        body: {
          error: {
            code: 'RATE_LIMITED',
            message: 'Terlalu banyak percobaan.',
            retryable: true,
          },
        },
      };
    }
    if (String(body.email ?? '') === 'unknown@example.com') {
      return {
        ok: false,
        status: 404,
        body: { error: { code: 'UNKNOWN', message: 'Tidak ditemukan.' } },
      };
    }
    return {
      ok: true,
      status: 200,
      body: { data: { leadId: 'lead_demo' } },
    };
  },
};

beforeEach(() => {
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const handler = Object.entries(leadsLookup).find(([path]) => url.endsWith(path));
    if (!handler) throw new Error(`Unhandled fetch: ${url}`);
    const [, resolve] = handler;
    const payload = init?.body ? JSON.parse(String(init.body)) : {};
    const result = resolve(payload);
    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as unknown as typeof fetch;
});

describe('school lead form', () => {
  it('renders required fields with accessible labels and consent', () => {
    render(<KontakPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Nama$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email kerja/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nomor telepon kerja/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Sekolah$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Peran$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Perkiraan jumlah guru/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tujuan/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/saya menyetujui pemrosesan data/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Kirim permintaan/i }),
    ).toBeInTheDocument();
  });

  it('shows inline validation when required fields missing', async () => {
    const user = userEvent.setup();
    render(<KontakPage />);
    await user.click(screen.getByRole('button', { name: /Kirim permintaan/i }));
    expect(await screen.findByText(/Nama wajib diisi/i)).toBeInTheDocument();
    expect(screen.getByText(/Sekolah wajib diisi/i)).toBeInTheDocument();
    expect(screen.getByText(/Masukkan email atau nomor telepon/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Pilih peran Anda di sekolah/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Perkiraan jumlah guru tidak valid/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Persetujuan wajib dicentang/i),
    ).toBeInTheDocument();
  });

  it('submits successfully with phone instead of email without revealing contact existence', async () => {
    const user = userEvent.setup();
    render(<KontakPage />);
    await user.type(screen.getByLabelText(/^Nama$/), 'Ibu Sari');
    await user.type(screen.getByLabelText(/Nomor telepon kerja/i), '81234567890');
    await user.type(screen.getByLabelText(/^Sekolah$/), 'SDN Contoh 01');
    await user.selectOptions(screen.getByLabelText(/^Peran$/), 'kepala_sekolah');
    await user.type(screen.getByLabelText(/Perkiraan jumlah guru/i), '24');
    await user.click(screen.getByLabelText(/saya menyetujui pemrosesan data/i));
    await user.click(screen.getByRole('button', { name: /Kirim permintaan/i }));

    expect(await screen.findByText(/Permintaan terkirim/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/tidak ditemukan|not found|tidak terdaftar/i),
    ).not.toBeInTheDocument();
  });

  it('surfaces rate-limit copy (HTTP 429) without exposing internals', async () => {
    const user = userEvent.setup();
    render(<KontakPage />);
    await user.type(screen.getByLabelText(/^Nama$/), 'Ibu Sari');
    await user.type(screen.getByLabelText(/Email kerja/i), 'rate-limited@example.com');
    await user.type(screen.getByLabelText(/^Sekolah$/), 'SDN Contoh 01');
    await user.selectOptions(screen.getByLabelText(/^Peran$/), 'guru');
    await user.type(screen.getByLabelText(/Perkiraan jumlah guru/i), '12');
    await user.click(screen.getByLabelText(/saya menyetujui pemrosesan data/i));
    await user.click(screen.getByRole('button', { name: /Kirim permintaan/i }));

    expect(await screen.findByText(/Terlalu banyak permintaan/i)).toBeInTheDocument();
  });
});
