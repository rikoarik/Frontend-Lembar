import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfigurationCompose from '../ConfigurationCompose';
import { WorkspaceProvider } from '@/src/features/workspace/workspaceContext';
import { ok } from '@/src/types/result';

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
  PrivatePdfSource: ({ onSuccess }: { onSuccess?: (d: unknown) => void }) => (
    <div data-testid="pdf-source">
      <button onClick={() => onSuccess?.({ uploadId: 'test-up' })}>Ready</button>
    </div>
  ),
}));

vi.mock('@/src/features/generate/OutputSettings', () => ({
  OutputSettings: () => <div data-testid="output-settings">Output Settings</div>,
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
