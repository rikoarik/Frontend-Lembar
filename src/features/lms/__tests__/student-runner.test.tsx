import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudentRunner from '../StudentRunner';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);
const resolved = {
  data: {
    assessmentId: 'asm-1',
    title: 'Ulangan',
    questions: [
      {
        id: 'q-uuid-1',
        number: 1,
        stem: 'Dua tambah dua?',
        questionType: 'multiple_choice',
        options: [
          { key: 'A', text: '3' },
          { key: 'B', text: '4' },
        ],
      },
      { id: 'q-uuid-2', number: 2, stem: 'Jelaskan', questionType: 'essay', options: [] },
      { id: 'q-uuid-3', number: 3, stem: 'Benar?', questionType: 'true_false', options: [] },
    ],
  },
};
const response = (body: unknown, status = 200) =>
  Promise.resolve(
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }),
  );

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

beforeEach(() => {
  vi.clearAllMocks();
  window.sessionStorage.clear();
  fetchMock.mockImplementation((url: string, init?: RequestInit) => {
    if (url === '/v1/public/shares/token-1' && !init?.method) return response(resolved);
    if (url.endsWith('/attempts') && init?.method === 'POST')
      return response({ data: { id: 'attempt-1' } });
    if (url.endsWith('/answers') && init?.method === 'PUT') return response({ data: {} });
    if (url.endsWith('/submit') && init?.method === 'POST')
      return response({ data: { submittedAt: '2026-08-09' } });
    return response({ error: { message: 'Tidak ditemukan' } }, 404);
  });
});

afterEach(() => {
  vi.useRealTimers();
  window.sessionStorage.clear();
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
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) =>
            url.endsWith('/answers') &&
            init.method === 'PUT' &&
            init.body === JSON.stringify({ answers: { 'q-uuid-1': 'B' } }),
        ),
      ).toBe(true),
    );
    vi.useRealTimers();
  });

  it('waits for older and latest queued saves before sending submit', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const olderPut = deferred<Response>();
    const latestPut = deferred<Response>();
    let putCount = 0;

    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      if (url === '/v1/public/shares/token-1' && !init?.method) return response(resolved);
      if (url.endsWith('/attempts') && init?.method === 'POST') {
        return response({ data: { id: 'attempt-1' } });
      }
      if (url.endsWith('/answers') && init?.method === 'PUT') {
        putCount += 1;
        return putCount === 1 ? olderPut.promise : latestPut.promise;
      }
      if (url.endsWith('/submit') && init?.method === 'POST') {
        return response({ data: { submittedAt: '2026-08-09' } });
      }
      return response({ error: { message: 'Tidak ditemukan' } }, 404);
    });

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<StudentRunner token="token-1" />);
    await screen.findByText('Ulangan');
    await user.type(screen.getByLabelText('Nama'), 'Budi');
    await user.click(screen.getByRole('button', { name: /mulai/i }));
    await user.click(await screen.findByRole('radio', { name: /B\. 4/ }));
    vi.advanceTimersByTime(700);
    await waitFor(() => expect(putCount).toBe(1));

    await user.click(screen.getByRole('button', { name: /soal 3, belum dijawab/i }));
    await user.click(screen.getByRole('radio', { name: /true\. Benar/i }));
    await user.click(screen.getByRole('button', { name: /^kirim jawaban$/i }));

    expect(putCount).toBe(1);
    expect(fetchMock.mock.calls.some(([url]) => url.endsWith('/submit'))).toBe(false);

    olderPut.resolve(await response({ error: { message: 'Autosave lama gagal' } }, 500));
    await waitFor(() => expect(putCount).toBe(2));

    const answerCalls = fetchMock.mock.calls.filter(
      ([url, init]) => url.endsWith('/answers') && init?.method === 'PUT',
    );
    expect(answerCalls.map(([, init]) => init?.body)).toEqual([
      JSON.stringify({ answers: { 'q-uuid-1': 'B' } }),
      JSON.stringify({ answers: { 'q-uuid-1': 'B', 'q-uuid-3': 'true' } }),
    ]);
    expect(fetchMock.mock.calls.some(([url]) => url.endsWith('/submit'))).toBe(false);

    latestPut.resolve(await response({ data: {} }));
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) =>
            url.endsWith('/submit') &&
            init?.method === 'POST' &&
            init.body === JSON.stringify({ answers: { 'q-uuid-1': 'B', 'q-uuid-3': 'true' } }),
        ),
      ).toBe(true),
    );
    expect(await screen.findByText('Jawaban terkirim')).toBeInTheDocument();
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
    await user.click(await screen.findByRole('button', { name: /soal 2, belum dijawab/i }));
    expect(screen.getByRole('textbox', { name: /soal 2/i })).toBeInTheDocument();
    expect(screen.getByText(/0 karakter/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /soal 3, belum dijawab/i }));
    expect(screen.getAllByRole('radio')).toHaveLength(2);
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
    await user.click(await screen.findByRole('button', { name: /soal 2, belum dijawab/i }));
    await user.type(screen.getByRole('textbox', { name: /soal 2/i }), 'Jawaban saya');
    await user.click(screen.getByRole('button', { name: /kirim semua jawaban/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Koneksi putus');
    expect(screen.getByRole('textbox', { name: /soal 2/i })).toHaveValue('Jawaban saya');
    expect(screen.getByRole('button', { name: /coba kirim lagi/i })).toBeInTheDocument();
  });

  it('restores an active attempt and answers after refresh', async () => {
    window.sessionStorage.setItem(
      'lembar.attempt.token-1',
      JSON.stringify({
        attemptId: 'attempt-existing',
        name: 'Budi',
        klass: '5A',
        answers: { 'q-uuid-1': 'B' },
        startedAt: Date.now(),
      }),
    );

    render(<StudentRunner token="token-1" />);

    expect(await screen.findByText('1 dari 3 soal terjawab')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /B\. 4/ })).toBeChecked();
    expect(fetchMock.mock.calls.some(([url]) => url.endsWith('/attempts'))).toBe(false);
  });

  it('shows autosave failures instead of silently hiding them', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      if (url === '/v1/public/shares/token-1') return response(resolved);
      if (url.endsWith('/attempts')) return response({ data: { id: 'attempt-1' } });
      if (url.endsWith('/answers') && init?.method === 'PUT') {
        return response({ error: { message: 'Autosave terputus' } }, 500);
      }
      return response({ data: {} });
    });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<StudentRunner token="token-1" />);
    await screen.findByText('Ulangan');
    await user.type(screen.getByLabelText('Nama'), 'Budi');
    await user.click(screen.getByRole('button', { name: /mulai/i }));
    await user.click(await screen.findByRole('radio', { name: /B\. 4/ }));
    vi.advanceTimersByTime(700);

    expect(await screen.findByText('Gagal menyimpan')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Autosave terputus');
  });

  it('membedakan tautan kedaluwarsa dan dicabut', async () => {
    fetchMock.mockReturnValueOnce(response({ error: { code: 'SHARE_REVOKED' } }, 410));
    render(<StudentRunner token="token-1" />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/dicabut/i);
  });
});
