import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudentRunner from '../StudentRunner';

// Mock the BFF fetch calls
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const ASSESSMENT_ID = 'asm_test_001';

const MOCK_QUESTIONS = {
  data: {
    assessmentId: ASSESSMENT_ID,
    title: 'Ulangan Harian Matematika',
    subject: 'Matematika',
    gradeLabel: 'Kelas 7',
    questionCount: 2,
    questions: [
      {
        number: 1,
        stem: 'Berapakah 2 + 2?',
        questionType: 'multiple_choice',
        options: [
          { key: 'a', text: '3' },
          { key: 'b', text: '4' },
          { key: 'c', text: '5' },
        ],
      },
      {
        number: 2,
        stem: 'Sebutkan contoh bilangan prima!',
        questionType: 'essay',
      },
    ],
  },
};

const MOCK_ATTEMPT = {
  data: {
    id: 'attempt_001',
    assessmentId: ASSESSMENT_ID,
    guestName: 'Budi',
    guestClass: '7A',
    startedAt: new Date().toISOString(),
    answers: [],
  },
};

const MOCK_SUBMIT_OK = {
  data: {
    id: 'attempt_001',
    submittedAt: new Date().toISOString(),
  },
};

function makeOkResponse(body: unknown) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function makeErrorResponse(status: number, code: string, message: string) {
  return Promise.resolve(
    new Response(JSON.stringify({ error: { code, message } }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  // Default happy-path: questions load, attempt starts, submit succeeds
  mockFetch.mockImplementation((url: string, init?: RequestInit) => {
    // GET questions
    if (typeof url === 'string' && url.includes('/lms/attempts') && (!init?.method || init.method === 'GET')) {
      return makeOkResponse(MOCK_QUESTIONS);
    }
    // POST start attempt
    if (typeof url === 'string' && url.includes('/lms/attempts') && init?.method === 'POST') {
      return makeOkResponse(MOCK_ATTEMPT);
    }
    // PUT submit
    if (typeof url === 'string' && url.includes('/lms/attempts') && init?.method === 'PUT') {
      return makeOkResponse(MOCK_SUBMIT_OK);
    }
    return makeErrorResponse(404, 'NOT_FOUND', 'Not found');
  });
});

describe('StudentRunner — identitas form', () => {
  it('shows identity form before starting', () => {
    render(<StudentRunner assessmentId={ASSESSMENT_ID} />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText(/nama/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/kelas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mulai/i })).toBeInTheDocument();
  });

  it('disables mulai button when nama is empty', () => {
    render(<StudentRunner assessmentId={ASSESSMENT_ID} />);
    expect(screen.getByRole('button', { name: /mulai/i })).toBeDisabled();
  });

  it('enables mulai button when nama is filled', async () => {
    const user = userEvent.setup();
    render(<StudentRunner assessmentId={ASSESSMENT_ID} />);
    await user.type(screen.getByLabelText(/nama/i), 'Budi');
    expect(screen.getByRole('button', { name: /mulai/i })).not.toBeDisabled();
  });

  it('requires only nama — kelas is optional', async () => {
    const user = userEvent.setup();
    render(<StudentRunner assessmentId={ASSESSMENT_ID} />);
    await user.type(screen.getByLabelText(/nama/i), 'Budi');
    expect(screen.getByRole('button', { name: /mulai/i })).not.toBeDisabled();
  });
});

describe('StudentRunner — loading soal', () => {
  it('shows loading state after submitting identity', async () => {
    const user = userEvent.setup();
    // Make questions fetch hang so we can catch the loading state
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<StudentRunner assessmentId={ASSESSMENT_ID} />);
    await user.type(screen.getByLabelText(/nama/i), 'Budi');
    await user.click(screen.getByRole('button', { name: /mulai/i }));
    await waitFor(() => {
      expect(screen.getByText(/memuat/i)).toBeInTheDocument();
    });
  });

  it('renders questions after fetch succeeds', async () => {
    const user = userEvent.setup();
    render(<StudentRunner assessmentId={ASSESSMENT_ID} />);
    await user.type(screen.getByLabelText(/nama/i), 'Budi');
    await user.type(screen.getByLabelText(/kelas/i), '7A');
    await user.click(screen.getByRole('button', { name: /mulai/i }));
    await waitFor(() => {
      expect(screen.getByText(/berapakah 2 \+ 2/i)).toBeInTheDocument();
    });
  });

  it('shows fetch error when BFF fails', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Lembar tidak ditemukan.' } }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    render(<StudentRunner assessmentId={ASSESSMENT_ID} />);
    await user.type(screen.getByLabelText(/nama/i), 'Budi');
    await user.click(screen.getByRole('button', { name: /mulai/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});

describe('StudentRunner — menjawab soal', () => {
  async function startRunner() {
    const user = userEvent.setup();
    render(<StudentRunner assessmentId={ASSESSMENT_ID} />);
    await user.type(screen.getByLabelText(/nama/i), 'Budi');
    await user.type(screen.getByLabelText(/kelas/i), '7A');
    await user.click(screen.getByRole('button', { name: /mulai/i }));
    await waitFor(() => screen.getByText(/berapakah 2 \+ 2/i));
    return user;
  }

  it('renders all questions on screen', async () => {
    await startRunner();
    expect(screen.getByText(/berapakah 2 \+ 2/i)).toBeInTheDocument();
    expect(screen.getByText(/contoh bilangan prima/i)).toBeInTheDocument();
  });

  it('renders multiple choice options as radio inputs', async () => {
    await startRunner();
    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBeGreaterThanOrEqual(3);
  });

  it('renders essay question as textarea', async () => {
    await startRunner();
    expect(screen.getByRole('textbox', { name: /soal 2/i })).toBeInTheDocument();
  });

  it('selecting a radio option records the answer', async () => {
    const user = await startRunner();
    const option = screen.getByRole('radio', { name: /^b/i });
    await user.click(option);
    expect(option).toBeChecked();
  });

  it('typing in essay textarea records the answer', async () => {
    const user = await startRunner();
    const textarea = screen.getByRole('textbox', { name: /soal 2/i });
    await user.type(textarea, '2, 3, 5, 7');
    expect(textarea).toHaveValue('2, 3, 5, 7');
  });
});

describe('StudentRunner — submit', () => {
  async function fillAndStart() {
    const user = userEvent.setup();
    render(<StudentRunner assessmentId={ASSESSMENT_ID} />);
    await user.type(screen.getByLabelText(/nama/i), 'Budi');
    await user.type(screen.getByLabelText(/kelas/i), '7A');
    await user.click(screen.getByRole('button', { name: /mulai/i }));
    await waitFor(() => screen.getByText(/berapakah 2 \+ 2/i));
    return user;
  }

  it('shows submit button when questions are loaded', async () => {
    await fillAndStart();
    expect(screen.getByRole('button', { name: /kirim/i })).toBeInTheDocument();
  });

  it('calls PUT /lms/attempts on submit', async () => {
    const user = await fillAndStart();
    await user.click(screen.getByRole('button', { name: /kirim/i }));
    await waitFor(() => {
      const putCall = mockFetch.mock.calls.find(
        ([, init]) => (init as RequestInit)?.method === 'PUT',
      );
      expect(putCall).toBeDefined();
    });
  });

  it('shows konfirmasi after successful submit', async () => {
    const user = await fillAndStart();
    await user.click(screen.getByRole('button', { name: /kirim/i }));
    await waitFor(() => {
      expect(screen.getByText(/berhasil/i)).toBeInTheDocument();
    });
  });

  it('shows error alert when submit fails', async () => {
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (typeof url === 'string' && url.includes('/lms/attempts') && (!init?.method || init.method === 'GET')) {
        return makeOkResponse(MOCK_QUESTIONS);
      }
      if (typeof url === 'string' && url.includes('/lms/attempts') && init?.method === 'POST') {
        return makeOkResponse(MOCK_ATTEMPT);
      }
      if (typeof url === 'string' && url.includes('/lms/attempts') && init?.method === 'PUT') {
        return makeErrorResponse(500, 'SERVER_ERROR', 'Gagal menyimpan jawaban.');
      }
      return makeErrorResponse(404, 'NOT_FOUND', 'Not found');
    });
    const user = await fillAndStart();
    await user.click(screen.getByRole('button', { name: /kirim/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
