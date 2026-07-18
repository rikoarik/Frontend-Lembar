export type WorkspaceKind = 'personal' | 'school';

export type ActiveRole = 'teacher' | 'school_admin' | 'superadmin';

export type LoginInput = {
  identifier: string;
  password: string;
};

export type RegisterInput = {
  username: string;
  email: string;
  phone: string;
  password: string;
};

export type RecoveryRequestInput = {
  identifier: string;
};

export type ResetPasswordInput = {
  token: string;
  password: string;
};

export type InvitationAcceptInput = RegisterInput & {
  token: string;
};

export type AuthSuccessPayload = {
  accountId: string;
  workspaceId: string;
  workspaceKind: WorkspaceKind;
  activeRole: ActiveRole;
};

export type InvitationStatus = 'pending' | 'expired' | 'revoked' | 'invalid';

export type InvitationPreview = {
  status: InvitationStatus;
  schoolName?: string;
  email?: string;
};
