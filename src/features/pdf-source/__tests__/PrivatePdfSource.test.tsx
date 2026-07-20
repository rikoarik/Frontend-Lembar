import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrivatePdfSource } from '@/src/features/pdf-source/PrivatePdfSource';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/src/services/source/sourceService', () => ({
  sourceService: {
    createUploadIntent: vi.fn(),
    uploadFile: vi.fn(),
    getSource: vi.fn(),
    deleteSource: vi.fn(),
  },
}));

function createMockFile(
  name: string,
  size: number,
  type: string = 'application/pdf',
): File {
  const content = new Uint8Array(size);
  return new File([content], name, { type });
}

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe('PrivatePdfSource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state initially', () => {
    renderWithQueryClient(
      <PrivatePdfSource workspaceId="test-workspace" />,
    );

    expect(screen.getByText('Unggah dokumen PDF')).toBeInTheDocument();
    expect(screen.getByText('Pilih file')).toBeInTheDocument();
  });

  it('should show file input when clicking select button', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <PrivatePdfSource workspaceId="test-workspace" />,
    );

    const fileInput = screen.getByLabelText('Pilih file PDF');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', '.pdf,application/pdf');
  });

  it('should show validation error for invalid file type', async () => {
    renderWithQueryClient(
      <PrivatePdfSource workspaceId="test-workspace" />,
    );

    const fileInput = screen.getByLabelText('Pilih file PDF');
    const file = createMockFile('test.txt', 1024, 'text/plain');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('should show validation error for oversized file', async () => {
    renderWithQueryClient(
      <PrivatePdfSource workspaceId="test-workspace" />,
    );

    const fileInput = screen.getByLabelText('Pilih file PDF');
    const file = createMockFile('large.pdf', 51 * 1024 * 1024);

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('should have proper ARIA attributes on panel', () => {
    renderWithQueryClient(
      <PrivatePdfSource workspaceId="test-workspace" />,
    );

    const heading = screen.getByRole('heading', { name: 'Sumber PDF Pribadi' });
    expect(heading).toBeInTheDocument();
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <PrivatePdfSource workspaceId="test-workspace" />,
    );

    const selectButton = screen.getByRole('button', { name: 'Pilih file' });
    await user.tab();
    expect(selectButton).toHaveFocus();
  });

  it('should render drag and drop zone', () => {
    renderWithQueryClient(
      <PrivatePdfSource workspaceId="test-workspace" />,
    );

    const dropZone = screen.getByText('Unggah dokumen PDF').closest('[class*="border-dashed"]');
    expect(dropZone).toBeInTheDocument();
  });
});
