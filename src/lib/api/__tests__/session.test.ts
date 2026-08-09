import { describe, expect, it } from 'vitest';
import { mePayloadFromBackendUser } from '../session';

describe('mePayloadFromBackendUser', () => {
  it('membentuk persona UI guru dari role aktif tanpa menghapus klaim akun', () => {
    const me = mePayloadFromBackendUser(
      {
        id: 'user-allroles',
        email: 'allroles@test.com',
        name: 'All Roles',
        roles: ['teacher', 'school_admin', 'superadmin'],
        activeWorkspace: {
          id: 'workspace-live',
          role: 'superadmin',
          permissions: ['platform.ops', 'school.manage'],
        },
      },
      'teacher',
    );

    expect(me.account.email).toBe('allroles@test.com');
    expect(me.activeWorkspace).toMatchObject({
      role: 'teacher',
      type: 'personal',
      permissions: ['assessment.create', 'assessment.read'],
    });
  });
});
