import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ShareManager } from '@/src/features/share/ShareManager';

describe('ShareManager', () => {
  it('mencabut tautan melalui POST yang didukung BFF', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [{ id: '1', token: 'tok-1', assessmentId: 'asm-1', expiresAt: null, revokedAt: null, createdAt: '' }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: '1', token: 'tok-1', assessmentId: 'asm-1', expiresAt: null, revokedAt: '2026-08-09', createdAt: '' } }) });
    vi.stubGlobal('fetch', fetchMock);

    render(<ShareManager assessmentId="asm-1" title="Ujian" />);
    await screen.findByText('tok-1');
    await userEvent.click(screen.getByRole('button', { name: 'Cabut' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'POST' });
  });
});
