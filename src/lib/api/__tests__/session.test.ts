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

  it('preserves backend workspace memberships and selects the preferred workspace', () => {
    const me = mePayloadFromBackendUser(
      {
        id: 'user-1',
        name: 'Guru Multi Workspace',
        roles: ['teacher', 'school_admin'],
        workspaces: [
          {
            id: 'personal-1',
            name: 'Pribadi',
            type: 'personal',
            role: 'teacher',
            permissions: ['assessment.read'],
          },
          {
            id: 'school-1',
            name: 'Sekolah',
            type: 'school',
            role: 'school_admin',
            permissions: ['workspace.member.manage'],
          },
        ],
      },
      undefined,
      'school-1',
    );

    expect(me.workspaces).toHaveLength(2);
    expect(me.activeWorkspace).toMatchObject({
      id: 'school-1',
      name: 'Sekolah',
      role: 'school_admin',
      type: 'school',
    });
  });
});
