import { describe, expect, it, beforeEach } from 'vitest';
import {
  __resetShareStore,
  createShare,
  getShare,
  listShares,
  revokeShare,
} from '@/src/features/share/mockShareStore';

describe('share mock store', () => {
  beforeEach(() => {
    __resetShareStore();
  });

  it('creates and lists active shares', () => {
    const created = createShare({ assessmentId: 'asm_x', title: 'Demo share' });
    expect(created.status).toBe('active');
    expect(listShares('asm_x').some((item) => item.token === created.token)).toBe(true);
  });

  it('revokes share', () => {
    const created = createShare({ assessmentId: 'asm_x', title: 'Demo share' });
    const revoked = revokeShare(created.token);
    expect(revoked?.status).toBe('revoked');
    expect(getShare(created.token)?.status).toBe('revoked');
  });
});
