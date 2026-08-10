import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ShareManager } from '@/src/features/share/ShareManager';

describe('ShareManager', () => {
  it('menerbitkan tautan attempt dengan ttlSeconds dan mencabut via DELETE', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [{ id: '1', token: 'tok-1', assessmentId: 'asm-1', expiresAt: null, revokedAt: null, createdAt: '' }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: '1', token: 'tok-1', assessmentId: 'asm-1', expiresAt: null, revokedAt: null, createdAt: '' } }) });
    vi.stubGlobal('fetch', fetchMock);

    render(<ShareManager assessmentId="asm-1" title="Ujian" />);
    await screen.findByText('tok-1');
    expect(screen.getByRole('link', { name: /buka asesmen/i })).toHaveAttribute('href', '/attempt/tok-1');
    await userEvent.click(screen.getByRole('button', { name: /terbitkan asesmen/i }));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({ assessmentId: 'asm-1', ttlSeconds: 2592000 });
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: '1', token: 'tok-1', assessmentId: 'asm-1', revokedAt: '2026-08-09' } }) });
    await userEvent.click(screen.getAllByRole('button', { name: 'Cabut' }).find((button) => !button.hasAttribute('disabled'))!);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(fetchMock.mock.calls[2]).toEqual([
      '/v1/shares/tok-1/revoke',
      expect.objectContaining({ method: 'DELETE' }),
    ]);
  });
});
