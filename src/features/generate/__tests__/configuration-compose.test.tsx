import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfigurationCompose from '../ConfigurationCompose';
import { WorkspaceProvider } from '@/src/features/workspace/workspaceContext';
import { ok, err } from '@/src/types/result';

// ── Mock data ──

const MOCK_GRADES = [
  { id: 'g-1', label: 'Kelas 1', status: 'active' as const },
  { id: 'g-4', label: 'Kelas 4', status: 'active' as const },
];

const MOCK_SUBJECTS = [
  { id: 's-4', label: 'Matematika', status: 'active' as const },
  { id: 's-5', label: 'Bahasa Indonesia', status: 'active' as const },
];

const MOCK_MATERIALS = [
  { id: 'm-10', label: 'Bilangan Cacah', status: 'active' as const },
  { id: 'm-11', label: 'Operasi Hitung', status: 'active' as const },
];

// ── Mocks ──

const mockListGrades = vi.fn();
const mockListSubjects = vi.fn();
const mockListMaterials = vi.fn();

vi.mock('@/src/services/catalog/catalogService', () => ({
  catalogService: {
    listGrades: (...args: unknown[]) => mockListGrades(...args),
    listSubjects: (...args: unknown[]) => mockListSubjects(...args),
    listMaterials: (...args: unknown[]) => mockListMaterials(...args),
  },
}));

vi.mock('@/src/features/pdf-source', () => ({
  PrivatePdfSource: ({ onSuccess }: { onSuccess?: (d: string) => void }) => (
    <div data-testid="pdf-source">
      <button onClick={() => onSuccess?.('src-test-01')}>Ready</button>
    </div>
  ),
}));

vi.mock('@/src/features/generate/OutputSettings', () => ({
  OutputSettings: () => <div data-testid="output-settings">Output Settings</div>,
}));

const mockSubmitConfiguration = vi.fn();

vi.mock('@/src/services/generate/generateService', () => ({
  generateService: {
    submitConfiguration: (...args: unknown[]) => mockSubmitConfiguration(...args),
  },
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/app/generate',
  useSearchParams: () => new URLSearchParams(),
}));

// ── Wrapper ──

function Wrapper({ children }: { children: React.ReactNode }) {
  return <WorkspaceProvider>{children}</WorkspaceProvider>;
}

// ── Helpers ──

function getCurriculumSelect() {
  return document.getElementById('compose-curriculumVersionId') as HTMLSelectElement;
}

function getGradeSelect() {
  return document.getElementById('compose-gradeId') as HTMLSelectElement;
}

function getSubjectSelect() {
  return document.getElementById('compose-subjectId') as HTMLSelectElement;
}

// ── Tests ──

describe('ConfigurationCompose — dependency-reset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListGrades.mockResolvedValue(ok(MOCK_GRADES));
    mockListSubjects.mockImplementation((_ws: string, gradeId: string, _curriculum: string) => {
      if (gradeId === 'g-4') return Promise.resolve(ok(MOCK_SUBJECTS));
      return Promise.resolve(ok([]));
    });
    mockListMaterials.mockImplementation(
      (_ws: string, _g: string, subjectId: string, _curriculum: string) => {
        if (subjectId === 's-4') return Promise.resolve(ok(MOCK_MATERIALS));
        return Promise.resolve(ok([]));
      },
    );
  });

  it('clears subject and materials when grade changes', async () => {
    const user = userEvent.setup();
    render(<ConfigurationCompose />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(getCurriculumSelect().options.length).toBeGreaterThan(1);
    });

    await user.selectOptions(getCurriculumSelect(), 'kurmer-2');

    await waitFor(() => {
      expect(getGradeSelect().options.length).toBeGreaterThan(1);
    });

    await user.selectOptions(getGradeSelect(), 'g-4');

    await waitFor(() => {
      expect(getSubjectSelect().options.length).toBeGreaterThan(1);
    });

    await user.selectOptions(getSubjectSelect(), 's-4');

    await waitFor(() => {
      expect(screen.getByText('Bilangan Cacah')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('Bilangan Cacah'));

    // Change grade — subject and materials should clear
    await user.selectOptions(getGradeSelect(), 'g-1');

    await waitFor(() => {
      expect(getSubjectSelect().value).toBe('');
    });
    expect(screen.queryByText('Bilangan Cacah')).not.toBeInTheDocument();
  });

  it('clears materials when subject changes', async () => {
    const user = userEvent.setup();
    render(<ConfigurationCompose />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(getCurriculumSelect().options.length).toBeGreaterThan(1);
    });

    await user.selectOptions(getCurriculumSelect(), 'kurmer-2');

    await waitFor(() => {
      expect(getGradeSelect().options.length).toBeGreaterThan(1);
    });

    await user.selectOptions(getGradeSelect(), 'g-4');

    await waitFor(() => {
      expect(getSubjectSelect().options.length).toBeGreaterThan(1);
    });

    await user.selectOptions(getSubjectSelect(), 's-4');

    await waitFor(() => {
      expect(screen.getByText('Bilangan Cacah')).toBeInTheDocument();
    });
    await user.click(screen.getByLabelText('Bilangan Cacah'));

    // Change subject
    await user.selectOptions(getSubjectSelect(), 's-5');

    await waitFor(() => {
      expect(screen.queryByText('Bilangan Cacah')).not.toBeInTheDocument();
    });
  });
});

describe('ConfigurationCompose — empty state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListGrades.mockResolvedValue(ok(MOCK_GRADES));
    mockListSubjects.mockResolvedValue(ok([]));
    mockListMaterials.mockResolvedValue(ok([]));
  });

  it('renders with empty state on initial load', async () => {
    render(<ConfigurationCompose />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Materi Ujian/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Materi Ujian/i)).toBeInTheDocument();
  });
});

describe('ConfigurationCompose — 390px', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 390 });
    window.dispatchEvent(new Event('resize'));
    mockListGrades.mockResolvedValue(ok(MOCK_GRADES));
    mockListSubjects.mockImplementation((_ws: string, gradeId: string, _curriculum: string) => {
      if (gradeId === 'g-4') return Promise.resolve(ok(MOCK_SUBJECTS));
      return Promise.resolve(ok([]));
    });
    mockListMaterials.mockImplementation(
      (_ws: string, _g: string, subjectId: string, _curriculum: string) => {
        if (subjectId === 's-4') return Promise.resolve(ok(MOCK_MATERIALS));
        return Promise.resolve(ok([]));
      },
    );
  });

  it('renders without horizontal overflow at 390px', async () => {
    const { container } = render(<ConfigurationCompose />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(getCurriculumSelect().options.length).toBeGreaterThan(1);
    });

    await userEvent.setup().selectOptions(getCurriculumSelect(), 'kurmer-2');

    await waitFor(() => {
      expect(getGradeSelect().options.length).toBeGreaterThan(1);
    });

    const allElements = container.querySelectorAll('*');
    let maxRight = 0;
    allElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.right > maxRight) maxRight = rect.right;
    });

    expect(Math.round(maxRight)).toBeLessThanOrEqual(410);
  });
});

// ── State: permission & success ──

describe('ConfigurationCompose — permission state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows permission banner when catalog returns RATE_LIMITED', async () => {
    mockListGrades.mockResolvedValue(
      err({
        code: 'RATE_LIMITED',
        safeMessage: 'Kuota habis',
        retryable: true,
      }),
    );

    render(<ConfigurationCompose />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Kuota habis')).toBeInTheDocument();
    });

    // Submit button must be disabled in permission state
    const submit = screen.getByRole('button', { name: /Buat draft/i });
    expect(submit).toBeDisabled();

    // Retry button should be present
    expect(screen.getByRole('button', { name: /Coba lagi/i })).toBeInTheDocument();
  });
});

describe('ConfigurationCompose — success state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListGrades.mockResolvedValue(ok(MOCK_GRADES));
    mockListSubjects.mockResolvedValue(ok(MOCK_SUBJECTS));
    mockListMaterials.mockResolvedValue(ok(MOCK_MATERIALS));
    mockSubmitConfiguration.mockResolvedValue(
      ok({ status: 'accepted', jobId: 'job_test_01', compositionId: 'comp_test_01' }),
    );
  });

  it('shows success banner after submit resolves successfully', async () => {
    const user = userEvent.setup();
    render(<ConfigurationCompose />, { wrapper: Wrapper });

    // Fill in all required katalog fields
    await waitFor(() => {
      expect(getCurriculumSelect().options.length).toBeGreaterThan(1);
    });
    await user.selectOptions(getCurriculumSelect(), 'kurmer-2');

    await waitFor(() => {
      expect(getGradeSelect().options.length).toBeGreaterThan(1);
    });
    await user.selectOptions(getGradeSelect(), 'g-4');

    await waitFor(() => {
      expect(getSubjectSelect().options.length).toBeGreaterThan(1);
    });
    await user.selectOptions(getSubjectSelect(), 's-4');

    await waitFor(() => {
      expect(screen.getByText('Bilangan Cacah')).toBeInTheDocument();
    });
    await user.click(screen.getByLabelText('Bilangan Cacah'));

    // Submit the form (katalog mode — sourceId not required)
    const submit = screen.getByRole('button', { name: /Buat draft/i });
    await user.click(submit);

    await waitFor(() => {
      expect(mockSubmitConfiguration).toHaveBeenCalledOnce();
    });

    // Success state banner should appear
    await waitFor(() => {
      expect(screen.getByText('Generate diterima')).toBeInTheDocument();
    });
    expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/^\/app\/jobs\//));

    // Submit should be disabled in success state
    expect(screen.getByRole('button', { name: /Buat draft/i })).toBeDisabled();
  });
});
