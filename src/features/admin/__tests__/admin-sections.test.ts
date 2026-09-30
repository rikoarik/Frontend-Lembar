import { describe, expect, it } from 'vitest';
import { isKnownAdminSection, OPS_SECTIONS, SCHOOL_SECTIONS } from '@/src/features/admin/types';

describe('isKnownAdminSection (FE-VER-02 F-5)', () => {
  it('accepts every section the ops console renders', () => {
    for (const section of OPS_SECTIONS) {
      expect(isKnownAdminSection('/ops', section)).toBe(true);
    }
  });

  it('accepts every section the school console renders', () => {
    for (const section of SCHOOL_SECTIONS) {
      expect(isKnownAdminSection('/school', section)).toBe(true);
    }
  });

  it('rejects unknown slugs so the page can call notFound()', () => {
    expect(isKnownAdminSection('/ops', 'zzz-unknown')).toBe(false);
    expect(isKnownAdminSection('/school', 'zzz-unknown')).toBe(false);
    expect(isKnownAdminSection('/ops', 'learning-signals/extra')).toBe(false);
  });

  it('keeps the accounts detail sub-route valid', () => {
    expect(isKnownAdminSection('/ops', 'accounts/249c9731-e224')).toBe(true);
  });

  it('does not let an ops section leak into the school console', () => {
    expect(isKnownAdminSection('/school', 'learning-signals')).toBe(false);
    expect(isKnownAdminSection('/ops', 'notifikasi')).toBe(false);
  });
});
