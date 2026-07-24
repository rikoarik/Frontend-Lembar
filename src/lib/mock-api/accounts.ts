export type MockRole = 'teacher' | 'school_admin' | 'superadmin';

export type MockAccount = {
  identifier: string;
  password: string;
  session: string;
  accountId: string;
  displayName: string;
  role: MockRole;
  homePath: string;
  workspaceId: string;
  workspaceName: string;
  workspaceType: 'personal' | 'school' | 'platform';
};

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    identifier: 'demo',
    password: 'demo1234',
    session: 'demo',
    accountId: 'acct_demo',
    displayName: 'Demo Guru',
    role: 'teacher',
    homePath: '/app',
    workspaceId: 'ws_demo',
    workspaceName: 'Ruang pribadi',
    workspaceType: 'personal',
  },
  {
    identifier: 'admin',
    password: 'admin1234',
    session: 'admin',
    accountId: 'acct_admin',
    displayName: 'Admin Sekolah',
    role: 'school_admin',
    homePath: '/school',
    workspaceId: 'ws_school_demo',
    workspaceName: 'SDN Contoh 01',
    workspaceType: 'school',
  },
  {
    identifier: 'ops',
    password: 'ops1234',
    session: 'ops',
    accountId: 'acct_ops',
    displayName: 'Ops Superadmin',
    role: 'superadmin',
    homePath: '/ops',
    workspaceId: 'ws_platform',
    workspaceName: 'Platform lembar',
    workspaceType: 'platform',
  },
];

export function findMockAccount(identifier: string, password: string): MockAccount | null {
  const id = identifier.trim().toLowerCase();
  return (
    MOCK_ACCOUNTS.find(
      (account) => account.identifier === id && account.password === password,
    ) ?? null
  );
}

export function findMockAccountBySession(session: string | undefined | null): MockAccount | null {
  if (!session) return null;
  return MOCK_ACCOUNTS.find((account) => account.session === session) ?? null;
}

export function authSuccessFor(account: MockAccount) {
  return {
    accountId: account.accountId,
    workspaceId: account.workspaceId,
    workspaceKind: account.workspaceType === 'platform' ? 'personal' : account.workspaceType,
    activeRole: account.role,
    homePath: account.homePath,
  };
}

export function mePayloadFor(account: MockAccount) {
  if (account.role === 'teacher') {
    return {
      account: { id: account.accountId, displayName: account.displayName },
      activeWorkspaceId: account.workspaceId,
      activeWorkspace: {
        id: account.workspaceId,
        name: account.workspaceName,
        type: 'personal' as const,
        role: 'teacher' as const,
        permissions: ['assessment.create', 'assessment.read'],
      },
      workspaces: [
        {
          id: 'ws_demo',
          name: 'Ruang pribadi',
          type: 'personal' as const,
          role: 'teacher' as const,
          permissions: ['assessment.create', 'assessment.read'],
        },
        {
          id: 'ws_school_demo',
          name: 'SDN Contoh 01',
          type: 'school' as const,
          role: 'school_admin' as const,
          permissions: ['assessment.create', 'assessment.read', 'workspace.member.manage'],
        },
      ],
    };
  }

  if (account.role === 'school_admin') {
    return {
      account: { id: account.accountId, displayName: account.displayName },
      activeWorkspaceId: account.workspaceId,
      activeWorkspace: {
        id: account.workspaceId,
        name: account.workspaceName,
        type: 'school' as const,
        role: 'school_admin' as const,
        permissions: [
          'assessment.create',
          'assessment.read',
          'workspace.member.manage',
          'school.manage',
        ],
      },
      workspaces: [
        {
          id: account.workspaceId,
          name: account.workspaceName,
          type: 'school' as const,
          role: 'school_admin' as const,
          permissions: [
            'assessment.create',
            'assessment.read',
            'workspace.member.manage',
            'school.manage',
          ],
        },
      ],
    };
  }

  return {
    account: { id: account.accountId, displayName: account.displayName },
    activeWorkspaceId: account.workspaceId,
    activeWorkspace: {
      id: account.workspaceId,
      name: account.workspaceName,
      type: 'personal' as const,
      role: 'superadmin' as const,
      permissions: ['platform.ops', 'school.manage', 'assessment.read'],
    },
    workspaces: [
      {
        id: account.workspaceId,
        name: account.workspaceName,
        type: 'personal' as const,
        role: 'superadmin' as const,
        permissions: ['platform.ops', 'school.manage', 'assessment.read'],
      },
    ],
  };
}
