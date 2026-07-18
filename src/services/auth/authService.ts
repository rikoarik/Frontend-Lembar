import { authMutations } from './authMutations';
import { recoveryRequestCopy } from './errorMapping';
import type { AuthError } from './authErrors';
import type {
  AuthSuccessPayload,
  InvitationAcceptInput,
  InvitationPreview,
  LoginInput,
  RecoveryRequestInput,
  RegisterInput,
  ResetPasswordInput,
} from '@/src/types/auth';
import { err, ok, type Result } from '@/src/types/result';

export type RecoveryRequestOutcome = { delivered: true };

export const authService = {
  login(input: LoginInput, idempotencyKey: string) {
    return authMutations.login(input, idempotencyKey);
  },
  register(input: RegisterInput, idempotencyKey: string) {
    return authMutations.register(input, idempotencyKey);
  },
  async requestRecovery(
    input: RecoveryRequestInput,
    idempotencyKey: string,
  ): Promise<Result<RecoveryRequestOutcome, AuthError>> {
    const result = await authMutations.recoveryRequest(input, idempotencyKey);
    if (!result.ok) return result;
    return ok({ delivered: true });
  },
  resetPassword(input: ResetPasswordInput, idempotencyKey: string) {
    return authMutations.resetPassword(input, idempotencyKey);
  },
  getInvitation(token: string) {
    return authMutations.getInvitation(token);
  },
  acceptInvitation(input: InvitationAcceptInput, idempotencyKey: string) {
    return authMutations.acceptInvitation(input, idempotencyKey);
  },
};

export function recoveryErrorForUser(): AuthError {
  return {
    code: 'RECOVERY_TOKEN_INVALID',
    safeMessage: recoveryRequestCopy().safeMessage,
    retryable: false,
  };
}

export type { AuthSuccessPayload, InvitationPreview };
