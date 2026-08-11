import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SupportChat from '../components/marketing/SupportChat';

const backendFetch = vi.fn();
vi.mock('@/src/lib/api/session', () => ({ backendFetch }));

beforeEach(() => {
  backendFetch.mockReset();
  globalThis.fetch = vi.fn();
});

describe('public support chat route', () => {
  it('rejects messages longer than 500 characters without calling the backend', async () => {
    const { POST } = await import('../v1/public/support/chat/route');
    const response = await POST(
      new Request('http://localhost/v1/public/support/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'a'.repeat(501) }),
      }),
    );

    expect(response.status).toBe(400);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('forwards a valid message to the public backend endpoint', async () => {
    backendFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { answered: true, message: 'Jawaban Lembar', whatsappUrl: 'https://wa.me/1' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    const { POST } = await import('../v1/public/support/chat/route');
    const response = await POST(
      new Request('http://localhost/v1/public/support/chat', {
        method: 'POST',
        body: JSON.stringify({ message: '  Apa itu Lembar?  ' }),
      }),
    );

    expect(backendFetch).toHaveBeenCalledWith('/v1/public/support/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Apa itu Lembar?' }),
    });
    expect(response.status).toBe(200);
  });
});

describe('SupportChat', () => {
  it('opens an accessible dialog, documents its scope, and closes with Escape', async () => {
    const user = userEvent.setup();
    render(<SupportChat />);

    const launcher = screen.getByRole('button', { name: /buka chat layanan pelanggan/i });
    await user.click(launcher);

    expect(screen.getByRole('dialog', { name: /tanya lembar/i })).toBeInTheDocument();
    expect(screen.getByText(/hanya menjawab pertanyaan tentang Lembar/i)).toBeInTheDocument();
    expect(
      screen.getByText(/tidak dapat menjawab topik coding atau topik umum/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/pertanyaan/i)).toHaveAttribute('maxLength', '500');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buka chat layanan pelanggan/i })).toHaveFocus();
  });

  it('shows WhatsApp fallback when the service cannot answer', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            answered: false,
            message: 'Belum dapat dijawab.',
            whatsappUrl: 'https://wa.me/other',
          },
        }),
        { status: 200 },
      ),
    );
    render(<SupportChat />);

    await user.click(screen.getByRole('button', { name: /buka chat/i }));
    await user.type(screen.getByLabelText(/pertanyaan/i), 'Bagaimana cara memakai Lembar?');
    await user.click(screen.getByRole('button', { name: /kirim/i }));

    expect(await screen.findByText('Belum dapat dijawab.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /lanjutkan di whatsapp/i })).toHaveAttribute(
      'href',
      'https://wa.me/other',
    );
  });

  it('renders a valid rate-limit fallback returned by the BFF instead of replacing it with a generic outage', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            answered: false,
            message: 'Bantuan manusia tersedia.',
            whatsappUrl: 'https://wa.me/rate-limited',
          },
        }),
        { status: 429 },
      ),
    );
    render(<SupportChat />);

    await user.click(screen.getByRole('button', { name: /buka chat/i }));
    await user.type(screen.getByLabelText(/pertanyaan/i), 'halo');
    await user.click(screen.getByRole('button', { name: /kirim/i }));

    expect(await screen.findByText('Bantuan manusia tersedia.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /lanjutkan di whatsapp/i })).toHaveAttribute(
      'href',
      'https://wa.me/rate-limited',
    );
    expect(screen.queryByText(/layanan chat sedang tidak tersedia/i)).not.toBeInTheDocument();
  });

  it('shows a clear loading state and fallback on request errors', async () => {
    const user = userEvent.setup();
    let rejectRequest!: (reason?: unknown) => void;
    vi.mocked(fetch).mockReturnValue(new Promise((_, reject) => (rejectRequest = reject)));
    render(<SupportChat />);

    await user.click(screen.getByRole('button', { name: /buka chat/i }));
    await user.type(screen.getByLabelText(/pertanyaan/i), 'Harga Lembar');
    await user.click(screen.getByRole('button', { name: /kirim/i }));
    expect(screen.getByRole('button', { name: /mengirim/i })).toBeDisabled();

    rejectRequest(new Error('offline'));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/tidak dapat menghubungi/i),
    );
    expect(screen.getByRole('link', { name: /lanjutkan di whatsapp/i })).toBeInTheDocument();
  });
});
