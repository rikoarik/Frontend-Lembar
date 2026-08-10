import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudentRunner from '../StudentRunner';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);
const resolved = { data: { assessmentId: 'asm-1', title: 'Ulangan', questions: [
  { id: 'q-uuid-1', number: 1, stem: 'Dua tambah dua?', questionType: 'multiple_choice', options: [{ key: 'A', text: '3' }, { key: 'B', text: '4' }] },
  { id: 'q-uuid-2', number: 2, stem: 'Jelaskan', questionType: 'essay', options: [] },
  { id: 'q-uuid-3', number: 3, stem: 'Benar?', questionType: 'true_false', options: [] },
] } };
const response = (body: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));

beforeEach(() => {
  vi.clearAllMocks();
  fetchMock.mockImplementation((url: string, init?: RequestInit) => {
    if (url === '/v1/public/shares/token-1' && !init?.method) return response(resolved);
    if (url.endsWith('/attempts') && init?.method === 'POST') return response({ data: { id: 'attempt-1' } });
    if (url.endsWith('/answers') && init?.method === 'PUT') return response({ data: {} });
    if (url.endsWith('/submit') && init?.method === 'POST') return response({ data: { submittedAt: '2026-08-09' } });
    return response({ error: { message: 'Tidak ditemukan' } }, 404);
  });
});

describe('StudentRunner token publik', () => {
  it('resolve dulu lalu meminta identitas tanpa membocorkan jawaban', async () => {
    render(<StudentRunner token="token-1" />);
    expect(await screen.findByText('Ulangan')).toBeInTheDocument();
    expect(screen.getByLabelText('Nama')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/v1/public/shares/token-1', undefined);
    expect(screen.queryByText(/penjelasan|kunci jawaban/i)).not.toBeInTheDocument();
  });

  it('memulai attempt sesudah resolve dan memakai UUID untuk autosave', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<StudentRunner token="token-1" />);
    await screen.findByText('Ulangan');
    await user.type(screen.getByLabelText('Nama'), 'Budi');
    await user.click(screen.getByRole('button', { name: /mulai/i }));
    await screen.findByText(/Dua tambah dua/);
    await user.click(screen.getByRole('radio', { name: /B\. 4/ }));
    vi.advanceTimersByTime(700);
    await waitFor(() => expect(fetchMock.mock.calls.some(([url, init]) => url.endsWith('/answers') && init.method === 'PUT' && init.body === JSON.stringify({ answers: { 'q-uuid-1': 'B' } }))).toBe(true));
    vi.useRealTimers();
  });

  it('menampilkan progres jawaban dan status autosave tanpa scroll library', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<StudentRunner token="token-1" />);
    await screen.findByText('Ulangan');
    await user.type(screen.getByLabelText('Nama'), 'Budi');
    await user.click(screen.getByRole('button', { name: /mulai/i }));
    expect(await screen.findByText('0 dari 3 soal terjawab')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /B\. 4/ }));
    expect(screen.getByText('1 dari 3 soal terjawab')).toBeInTheDocument();
    vi.advanceTimersByTime(700);
    expect(await screen.findByText('Jawaban tersimpan')).toBeInTheDocument();
    expect(document.querySelector('[data-lenis]')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('merender true false sebagai pilihan dan esai sebagai textarea', async () => {
    const user = userEvent.setup();
    render(<StudentRunner token="token-1" />);
    await screen.findByText('Ulangan');
    await user.type(screen.getByLabelText('Nama'), 'Budi');
    await user.click(screen.getByRole('button', { name: /mulai/i }));
    expect(await screen.findByRole('textbox', { name: /soal 2/i })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
  });

  it('submit gagal tetap menampilkan soal, jawaban, dan tombol coba lagi', async () => {
    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      if (url === '/v1/public/shares/token-1') return response(resolved);
      if (url.endsWith('/attempts')) return response({ data: { id: 'attempt-1' } });
      if (url.endsWith('/submit')) return response({ error: { message: 'Koneksi putus' } }, 500);
      return response({ data: {} });
    });
    const user = userEvent.setup();
    render(<StudentRunner token="token-1" />);
    await screen.findByText('Ulangan');
    await user.type(screen.getByLabelText('Nama'), 'Budi');
    await user.click(screen.getByRole('button', { name: /mulai/i }));
    await user.type(await screen.findByRole('textbox', { name: /soal 2/i }), 'Jawaban saya');
    await user.click(screen.getByRole('button', { name: /kirim/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Koneksi putus');
    expect(screen.getByRole('textbox', { name: /soal 2/i })).toHaveValue('Jawaban saya');
    expect(screen.getByRole('button', { name: /coba kirim lagi/i })).toBeInTheDocument();
  });

  it('membedakan tautan kedaluwarsa dan dicabut', async () => {
    fetchMock.mockReturnValueOnce(response({ error: { code: 'SHARE_REVOKED' } }, 410));
    render(<StudentRunner token="token-1" />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/dicabut/i);
  });
});
