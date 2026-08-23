import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfigurationCompose from '../ConfigurationCompose';
import { WorkspaceProvider } from '@/src/features/workspace/workspaceContext';
import { ok } from '@/src/types/result';

const MOCK_GRADES = [{ id: 'g-4', label: 'Kelas 4', status: 'active' as const }];
const MOCK_SUBJECTS = [{ id: 's-4', label: 'Matematika', status: 'active' as const }];
const MOCK_MATERIALS = [{ id: 'm-10', label: 'Bilangan Cacah', status: 'active' as const }];

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
  PrivatePdfSource: () => <div data-testid="pdf-source" />,
}));

vi.mock('@/src/features/generate/OutputSettings', () => ({
  OutputSettings: () => <div data-testid="output-settings" />,
}));

const mockSubmitConfiguration = vi.fn();

vi.mock('@/src/services/generate/generateService', () => ({
  generateService: {
    submitConfiguration: (...args: unknown[]) => mockSubmitConfiguration(...args),
  },
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => '/app/generate',
  useSearchParams: () => new URLSearchParams(),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <WorkspaceProvider>{children}</WorkspaceProvider>;
}

function getCurriculumSelect() {
  return document.getElementById('compose-curriculumVersionId') as HTMLSelectElement;
}
function getGradeSelect() {
  return document.getElementById('compose-gradeId') as HTMLSelectElement;
}
function getSubjectSelect() {
  return document.getElementById('compose-subjectId') as HTMLSelectElement;
}
function getQuestionCountInput() {
  return document.getElementById('compose-questionCount') as HTMLInputElement;
}

async function fillKatalogRequired(user: ReturnType<typeof userEvent.setup>) {
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
}

describe('ConfigurationCompose — distribution controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListGrades.mockResolvedValue(ok(MOCK_GRADES));
    mockListSubjects.mockResolvedValue(ok(MOCK_SUBJECTS));
    mockListMaterials.mockResolvedValue(ok(MOCK_MATERIALS));
    mockSubmitConfiguration.mockResolvedValue(
      ok({ status: 'accepted', jobId: 'job_test_01', compositionId: 'comp_test_01' }),
    );
  });

  it('renders a count input for every supported question type', async () => {
    render(<ConfigurationCompose />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Materi Ujian/i)).toBeInTheDocument();
    });

    expect(
      document.getElementById('compose-questionTypeCounts-multiple_choice'),
    ).toBeInTheDocument();
    expect(document.getElementById('compose-questionTypeCounts-short_answer')).toBeInTheDocument();
    expect(document.getElementById('compose-questionTypeCounts-essay')).toBeInTheDocument();
    expect(document.getElementById('compose-questionTypeCounts-true_false')).toBeInTheDocument();
  });

  it('seeds per-type counts to total / 4 and routes remainder to the earliest types', async () => {
    render(<ConfigurationCompose />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Materi Ujian/i)).toBeInTheDocument();
    });

    // Default questionCount = 20 → 5 each, no remainder (20/4 = 5)
    expect(
      (document.getElementById('compose-questionTypeCounts-multiple_choice') as HTMLInputElement)
        .value,
    ).toBe('5');
    expect(
      (document.getElementById('compose-questionTypeCounts-short_answer') as HTMLInputElement)
        .value,
    ).toBe('5');
    expect(
      (document.getElementById('compose-questionTypeCounts-essay') as HTMLInputElement).value,
    ).toBe('5');
    expect(
      (document.getElementById('compose-questionTypeCounts-true_false') as HTMLInputElement).value,
    ).toBe('5');

    // Change total to 7 → 1 each with 3 remainder. Remainder routes to earliest: mc+1, sa+1, essay+1, tf+0
    fireEvent.change(getQuestionCountInput(), { target: { value: '7' } });
    fireEvent.blur(getQuestionCountInput());

    const mc = document.getElementById(
      'compose-questionTypeCounts-multiple_choice',
    ) as HTMLInputElement;
    const sa = document.getElementById(
      'compose-questionTypeCounts-short_answer',
    ) as HTMLInputElement;
    const essay = document.getElementById('compose-questionTypeCounts-essay') as HTMLInputElement;
    const tf = document.getElementById('compose-questionTypeCounts-true_false') as HTMLInputElement;
    expect(mc.value).toBe('2');
    expect(sa.value).toBe('2');
    expect(essay.value).toBe('2');
    expect(tf.value).toBe('1');
    // sum equals total
    expect(Number(mc.value) + Number(sa.value) + Number(essay.value) + Number(tf.value)).toBe(7);
  });

  it('keeps per-type counts in sync when the user edits a single per-type input', async () => {
    const user = userEvent.setup();
    render(<ConfigurationCompose />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Materi Ujian/i)).toBeInTheDocument();
    });

    const mc = document.getElementById(
      'compose-questionTypeCounts-multiple_choice',
    ) as HTMLInputElement;
    await user.clear(mc);
    await user.type(mc, '8');
    await user.tab();

    // Sum must always equal values.questionCount (default 20)
    const sa = document.getElementById(
      'compose-questionTypeCounts-short_answer',
    ) as HTMLInputElement;
    const essay = document.getElementById('compose-questionTypeCounts-essay') as HTMLInputElement;
    const tf = document.getElementById('compose-questionTypeCounts-true_false') as HTMLInputElement;
    const sum = Number(mc.value) + Number(sa.value) + Number(essay.value) + Number(tf.value);
    expect(sum).toBe(20);
  });

  it('submit payload includes questionTypeCounts that sum to the total questionCount', async () => {
    const user = userEvent.setup();
    render(<ConfigurationCompose />, { wrapper: Wrapper });

    await fillKatalogRequired(user);

    // Override distribution: 6 MC, 5 SA, 4 essay, 5 TF = 20
    const mc = document.getElementById(
      'compose-questionTypeCounts-multiple_choice',
    ) as HTMLInputElement;
    const sa = document.getElementById(
      'compose-questionTypeCounts-short_answer',
    ) as HTMLInputElement;
    const essay = document.getElementById('compose-questionTypeCounts-essay') as HTMLInputElement;
    const tf = document.getElementById('compose-questionTypeCounts-true_false') as HTMLInputElement;

    fireEvent.change(mc, { target: { value: '6' } });
    fireEvent.blur(mc);
    fireEvent.change(sa, { target: { value: '5' } });
    fireEvent.blur(sa);
    fireEvent.change(essay, { target: { value: '4' } });
    fireEvent.blur(essay);
    fireEvent.change(tf, { target: { value: '5' } });
    fireEvent.blur(tf);

    await user.click(screen.getByRole('button', { name: /Buat draft/i }));

    await waitFor(() => {
      expect(mockSubmitConfiguration).toHaveBeenCalledOnce();
    });

    const submitted = mockSubmitConfiguration.mock.calls[0]![0] as Record<string, unknown>;
    expect(submitted.questionCount).toBe(20);
    expect(submitted.questionTypeCounts).toEqual({
      multiple_choice: 6,
      short_answer: 5,
      essay: 4,
      true_false: 5,
    });
  });

  it('routes all counts to a single type when total questionCount is less than 1', async () => {
    const user = userEvent.setup();
    render(<ConfigurationCompose />, { wrapper: Wrapper });

    await fillKatalogRequired(user);

    // Force total below 1 by clearing then blurring on 0
    const total = getQuestionCountInput();
    fireEvent.change(total, { target: { value: '0' } });
    fireEvent.blur(total);

    await user.click(screen.getByRole('button', { name: /Buat draft/i }));

    await waitFor(() => {
      expect(mockSubmitConfiguration).toHaveBeenCalledOnce();
    });

    const submitted = mockSubmitConfiguration.mock.calls[0]![0] as Record<string, unknown>;
    expect(submitted.questionCount).toBe(1); // clamped up to MIN
    const counts = submitted.questionTypeCounts as Record<string, number>;
    const routedTypes = (Object.entries(counts) as [string, number][]).filter(([, n]) => n > 0);
    expect(routedTypes).toHaveLength(1);
    // single-type routed count must equal the (clamped) total
    expect(routedTypes[0]![1]).toBe(1);
    // all other types must be 0
    for (const [type, n] of Object.entries(counts)) {
      if (type !== routedTypes[0]![0]) expect(n).toBe(0);
    }
  });
});
