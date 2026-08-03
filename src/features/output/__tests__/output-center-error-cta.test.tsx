import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/services/assessments/assessmentService', () => ({
  assessmentService: {
    getOutput: vi.fn(),
    get: vi.fn(),
  },
}));
vi.mock('next/link', () => ({ default: ({ href, children }: any) => <a href={href}>{children}</a> }));
vi.mock('@/src/features/share/ShareManager', () => ({ ShareManager: () => null }));

import { assessmentService } from '@/src/services/assessments/assessmentService';
import { OutputCenterView } from '../OutputCenterView';
import { err } from '@/src/types/result';

const mockService = assessmentService as unknown as {
  getOutput: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
  mockService.get.mockResolvedValue(err({ code: 'UNKNOWN', safeMessage: '', retryable: false }));
});

describe('OutputCenterView error CTA', () => {
  it('hides Ke finalisasi when error is 401', async () => {
    mockService.getOutput.mockResolvedValue(err({ code: 'AUTH_REQUIRED', safeMessage: 'Silakan masuk dulu.', retryable: false, httpStatus: 401 }));
    render(<OutputCenterView assessmentId="asm-1" />);
    expect(await screen.findByText('Hasil belum tersedia')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /finalisasi/i })).not.toBeInTheDocument();
  });

  it('hides Ke finalisasi when error is 403', async () => {
    mockService.getOutput.mockResolvedValue(err({ code: 'PERMISSION_DENIED', safeMessage: 'Tidak punya akses.', retryable: false, httpStatus: 403 }));
    render(<OutputCenterView assessmentId="asm-1" />);
    expect(await screen.findByText('Hasil belum tersedia')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /finalisasi/i })).not.toBeInTheDocument();
  });

  it('shows Ke finalisasi for other errors', async () => {
    mockService.getOutput.mockResolvedValue(err({ code: 'UNKNOWN', safeMessage: 'Coba lagi.', retryable: true }));
    render(<OutputCenterView assessmentId="asm-1" />);
    expect(await screen.findByRole('link', { name: /finalisasi/i })).toBeInTheDocument();
  });
});
