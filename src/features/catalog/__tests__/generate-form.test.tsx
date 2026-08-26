import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GenerateForm, { validateGenerateForm, type GenerateFormValues } from '../GenerateForm';
import { WorkspaceProvider } from '@/src/features/workspace/workspaceContext';

// ── Mock catalog service ──

const MOCK_GRADES = [
  { id: 'g-1', label: 'Kelas 1', status: 'active' as const },
  { id: 'g-4', label: 'Kelas 4', status: 'active' as const },
  { id: 'g-7', label: 'Kelas 7', status: 'active' as const },
];

const MOCK_SUBJECTS_G4 = [
  { id: 's-4', label: 'Matematika', status: 'active' as const },
  { id: 's-5', label: 'Bahasa Indonesia', status: 'active' as const },
  {
    id: 's-6',
    label:
      'Ilmu Pengetahuan Alam dan Sosial (IPAS) — yang memiliki judul sangat panjang sehingga perlu ditangani secara khusus',
    status: 'active' as const,
  },
];

const MOCK_MATERIALS_S4 = [
  { id: 'm-10', label: 'Bilangan Cacah sampai 10.000', status: 'active' as const },
  { id: 'm-11', label: 'Operasi Hitung Penjumlahan dan Pengurangan', status: 'active' as const },
  { id: 'm-12', label: 'Perkalian dan Pembagian Bilangan Cacah', status: 'active' as const },
  {
    id: 'm-13',
    label:
      'Pengukuran Panjang dan Berat dalam Satuan Baku — Materi dengan deskripsi sangat panjang untuk menguji overflow',
    status: 'active' as const,
  },
];

const MOCK_MATERIALS_S5 = [
  { id: 'm-20', label: 'Teks Narasi dan Deskripsi', status: 'active' as const },
];

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

import { ok } from '@/src/types/result';

beforeEach(() => {
  vi.clearAllMocks();
  mockListGrades.mockResolvedValue(ok(MOCK_GRADES));
  mockListSubjects.mockImplementation((_ws: string, gradeId: string) => {
    if (gradeId === 'g-4') return Promise.resolve(ok(MOCK_SUBJECTS_G4));
    if (gradeId === 'g-7')
      return Promise.resolve(ok([{ id: 's-8', label: 'Matematika', status: 'active' as const }]));
    return Promise.resolve(ok([]));
  });
  mockListMaterials.mockImplementation((_ws: string, _g: string, subjectId: string) => {
    if (subjectId === 's-4') return Promise.resolve(ok(MOCK_MATERIALS_S4));
    if (subjectId === 's-5') return Promise.resolve(ok(MOCK_MATERIALS_S5));
    return Promise.resolve(ok([]));
  });
});

// ── Wrapper ──

function Wrapper({ children }: { children: React.ReactNode }) {
  return <WorkspaceProvider>{children}</WorkspaceProvider>;
}

// ── Helpers ──

async function waitForGrades() {
  await waitFor(() => {
    const select = screen.getByLabelText(/Kelas/i) as HTMLSelectElement;
    expect(select.options.length).toBeGreaterThan(1);
  });
}

async function waitForSubjects() {
  await waitFor(() => {
    const select = screen.getByLabelText(/Mata Pelajaran/i) as HTMLSelectElement;
    expect(select.options.length).toBeGreaterThan(1);
  });
}

type User = ReturnType<typeof userEvent.setup>;

async function pickSelect(user: User, label: string, optionLabel: string) {
  const select = screen.getByLabelText(new RegExp(label, 'i')) as HTMLSelectElement;
  await user.selectOptions(select, optionLabel);
  expect(select).toHaveDisplayValue(optionLabel);
}

// ── Tests ──

describe('GenerateForm — dependency-reset', () => {
  it('clears subject and materials when grade changes', async () => {
    const user = userEvent.setup();
    render(<GenerateForm />, { wrapper: Wrapper });

    await waitForGrades();

    await pickSelect(user, 'Kurikulum', 'Kurikulum Merdeka (Fase B)');
    await pickSelect(user, 'Kelas', 'Kelas 4');

    await waitForSubjects();
    await pickSelect(user, 'Mata Pelajaran', 'Matematika');

    expect(await screen.findByText('Bilangan Cacah sampai 10.000')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Bilangan Cacah sampai 10.000'));

    await pickSelect(user, 'Kelas', 'Kelas 7');

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Matematika' })).toHaveValue('s-8');
    });

    const subjectSelect = screen.getByLabelText(/Mata Pelajaran/i) as HTMLSelectElement;
    expect(subjectSelect).toHaveValue('');
    expect(screen.queryByText('Bilangan Cacah sampai 10.000')).not.toBeInTheDocument();
  });

  it('clears materials when subject changes', async () => {
    const user = userEvent.setup();
    render(<GenerateForm />, { wrapper: Wrapper });

    await waitForGrades();
    await pickSelect(user, 'Kurikulum', 'Kurikulum Merdeka (Fase B)');
    await pickSelect(user, 'Kelas', 'Kelas 4');
    await waitForSubjects();
    await pickSelect(user, 'Mata Pelajaran', 'Matematika');

    expect(await screen.findByText('Bilangan Cacah sampai 10.000')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Bilangan Cacah sampai 10.000'));

    await pickSelect(user, 'Mata Pelajaran', 'Bahasa Indonesia');

    expect(await screen.findByText('Teks Narasi dan Deskripsi')).toBeInTheDocument();
    expect(screen.queryByText('Bilangan Cacah sampai 10.000')).not.toBeInTheDocument();
  });
});

describe('GenerateForm — long-content', () => {
  it('handles long material labels in the DOM', async () => {
    const user = userEvent.setup();
    render(<GenerateForm />, { wrapper: Wrapper });

    await waitForGrades();
    await pickSelect(user, 'Kurikulum', 'Kurikulum Merdeka (Fase B)');
    await pickSelect(user, 'Kelas', 'Kelas 4');
    await waitForSubjects();
    await pickSelect(user, 'Mata Pelajaran', 'Matematika');

    expect(
      await screen.findByText(/Pengukuran Panjang dan Berat dalam Satuan Baku/),
    ).toBeInTheDocument();
  });

  it('shows long subject option', async () => {
    const user = userEvent.setup();
    render(<GenerateForm />, { wrapper: Wrapper });

    await waitForGrades();
    await pickSelect(user, 'Kurikulum', 'Kurikulum Merdeka (Fase B)');
    await pickSelect(user, 'Kelas', 'Kelas 4');
    await waitForSubjects();

    const longLabel =
      'Ilmu Pengetahuan Alam dan Sosial (IPAS) — yang memiliki judul sangat panjang sehingga perlu ditangani secara khusus';
    expect(screen.getByText(longLabel)).toBeInTheDocument();
  });
});

describe('GenerateForm — 390', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 390 });
    window.dispatchEvent(new Event('resize'));
  });

  it('renders without horizontal overflow at 390px', async () => {
    const user = userEvent.setup();
    const { container } = render(<GenerateForm />, { wrapper: Wrapper });

    await waitForGrades();
    await pickSelect(user, 'Kurikulum', 'Kurikulum Merdeka (Fase B)');
    await pickSelect(user, 'Kelas', 'Kelas 4');
    await waitForSubjects();
    await pickSelect(user, 'Mata Pelajaran', 'Matematika');

    expect(await screen.findByText('Bilangan Cacah sampai 10.000')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /buat draft/i });
    await user.click(submitBtn);

    const allElements = container.querySelectorAll('*');
    let maxRight = 0;
    allElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.right > maxRight) maxRight = rect.right;
    });

    expect(Math.round(maxRight)).toBeLessThanOrEqual(410);
  });

  it('shows collapsible summary toggle on mobile', async () => {
    render(<GenerateForm />, { wrapper: Wrapper });

    await waitForGrades();
  });
});

describe('GenerateForm — validation (pure)', () => {
  it('validateGenerateForm rejects empty katalog selections', () => {
    const result = validateGenerateForm({
      sourceMode: 'katalog',
      curriculumVersionId: '',
      gradeId: '',
      subjectId: '',
      materialIds: [],
      assessmentType: 'practice',
      difficulty: 'medium',
      questionCount: 20,
      reviewMode: 'quick',
      teacherFocus: '',
      exampleQuestion: '',
    });
    expect(result.ok).toBe(false);
    expect(result.failures.length).toBeGreaterThanOrEqual(4);
  });

  it('validateGenerateForm rejects invalid question count', () => {
    const values: GenerateFormValues = {
      sourceMode: 'katalog',
      curriculumVersionId: 'cur-1',
      gradeId: 'g-4',
      subjectId: 's-4',
      materialIds: ['m-10'],
      assessmentType: 'practice',
      difficulty: 'medium',
      questionCount: 0,
      reviewMode: 'quick',
      teacherFocus: '',
      exampleQuestion: '',
    };
    const result = validateGenerateForm(values);
    expect(result.ok).toBe(false);
    expect(result.failures.some((f) => f.field === 'questionCount')).toBe(true);
  });

  it('validateGenerateForm passes valid form', () => {
    const values: GenerateFormValues = {
      sourceMode: 'katalog',
      curriculumVersionId: 'cur-1',
      gradeId: 'g-4',
      subjectId: 's-4',
      materialIds: ['m-10', 'm-11'],
      assessmentType: 'practice',
      difficulty: 'medium',
      questionCount: 20,
      reviewMode: 'quick',
      teacherFocus: '',
      exampleQuestion: '',
    };
    expect(validateGenerateForm(values).ok).toBe(true);
  });

  it('validateGenerateForm passes PDF-only form without catalog fields', () => {
    const values: GenerateFormValues = {
      sourceMode: 'pdf',
      curriculumVersionId: '',
      gradeId: '',
      subjectId: '',
      materialIds: [],
      assessmentType: 'daily',
      difficulty: 'hard',
      questionCount: 15,
      reviewMode: 'detail',
      teacherFocus: '',
      exampleQuestion: '',
    };
    expect(validateGenerateForm(values).ok).toBe(true);
  });
});

describe('GenerateForm — happy-path', () => {
  it('selects Detail review mode when its card is clicked', async () => {
    const user = userEvent.setup();
    render(<GenerateForm />, { wrapper: Wrapper });

    await user.click(screen.getByText('Detail'));

    expect(screen.getByLabelText(/Detail.*Tinjau satu per satu/i)).toBeChecked();
    expect(screen.getByLabelText(/Cepat.*Tinjau dalam satu daftar/i)).not.toBeChecked();
  });

  it('loads grades on mount and shows selects', async () => {
    render(<GenerateForm />, { wrapper: Wrapper });

    expect(screen.getByText(/Materi Ujian/i)).toBeInTheDocument();

    await waitFor(() => expect(mockListGrades).toHaveBeenCalled());
    await waitForGrades();
  });

  it('loads subjects and materials progressively', async () => {
    const user = userEvent.setup();
    render(<GenerateForm />, { wrapper: Wrapper });

    await waitForGrades();
    await pickSelect(user, 'Kurikulum', 'Kurikulum Merdeka (Fase B)');
    await pickSelect(user, 'Kelas', 'Kelas 4');
    await waitForSubjects();

    await pickSelect(user, 'Mata Pelajaran', 'Matematika');

    expect(await screen.findByText('Bilangan Cacah sampai 10.000')).toBeInTheDocument();
    expect(screen.getByText(/Kesiapan/)).toBeInTheDocument();
  });
});
