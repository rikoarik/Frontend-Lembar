import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpsPromptsSection } from './OpsPromptsSection';

const mocks = vi.hoisted(() => ({ promptDetail: vi.fn() }));
vi.mock('@/src/services/admin/adminService', () => ({
  adminService: {
    activatePrompt: vi.fn(),
    deactivatePrompt: vi.fn(),
    promptDetail: mocks.promptDetail,
  },
}));

const props = {
  promptsData: [
    { id: 'prompt-1', name: 'Generator soal', owner: 'ops', status: 'active' as const },
  ],
  promptsLoading: false,
  createPromptOpen: false,
  setCreatePromptOpen: vi.fn(),
  createPromptName: '',
  setCreatePromptName: vi.fn(),
  createPromptSlug: '',
  setCreatePromptSlug: vi.fn(),
  createPromptDesc: '',
  setCreatePromptDesc: vi.fn(),
  createPromptText: '',
  setCreatePromptText: vi.fn(),
  createPromptLoading: false,
  setCreatePromptLoading: vi.fn(),
  search: '',
  setSearch: vi.fn(),
  loadPrompts: vi.fn(),
  setToast: vi.fn(),
};

describe('OpsPromptsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.promptDetail.mockResolvedValue({
      ok: true,
      value: {
        id: 'prompt-1',
        name: 'Generator soal',
        slug: 'generator-soal',
        status: 'active',
        version: 2,
        activeVersion: 2,
        versions: [
          {
            id: 'v2',
            version: 2,
            promptText: 'Gunakan bahasa Indonesia.',
            schemaVersion: 1,
            status: 'active',
          },
        ],
      },
    });
  });

  it('membuka drawer, memuat detail, dan menampilkan preview versi read-only', async () => {
    const user = userEvent.setup();
    render(<OpsPromptsSection {...props} />);
    await user.click(screen.getByRole('button', { name: 'Kelola Generator soal' }));
    expect(screen.getByRole('dialog', { name: 'Kelola prompt' })).toBeInTheDocument();
    await waitFor(() => expect(mocks.promptDetail).toHaveBeenCalledWith('prompt-1'));
    expect(screen.getByRole('textbox', { name: 'Preview teks prompt v2' })).toHaveValue(
      'Gunakan bahasa Indonesia.',
    );
    expect(screen.getByRole('textbox', { name: 'Preview teks prompt v2' })).toHaveAttribute(
      'readonly',
    );
  });
});
