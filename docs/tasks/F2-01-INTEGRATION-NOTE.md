# F2-01 Integration Note

**Status**: Identity screens implemented, pending backend OpenAPI publication

## Current State

Auth screens fully implemented in `app/(auth)`:
- `/masuk` - Login with identifier (username/email/phone) + password
- `/daftar` - Register with username, email, phone, password
- `/lupa-sandi` - Recovery request
- `/reset-sandi` - Password reset with token
- `/undangan/[token]` - School invitation acceptance

## Backend Dependency

- **B1-01** (Account and session integration) - Implemented in backend dev (`35a06ef`)
- Auth endpoints exist: `/v1/auth/login`, `/v1/auth/register`, `/v1/auth/recovery/*`, `/v1/auth/invitations/*`
- **OpenAPI contract not yet published** - auth paths missing from `contracts/openapi.yaml`

## Integration Approach

Per owner directive "CONTRACT AVAILABLE, LIVE IMPLEMENTATION PENDING":

1. **Auth mutation layer** (`src/services/auth/authMutations.ts`) - Uses fetch with contract-aligned paths
2. **MSW handlers** (`src/mocks/handlers/auth.ts`) - Complete contract-aligned mocks for development
3. **UI screens** - All flows implemented with loading/error/success states
4. **Validation** - Client-side validation using `src/features/auth/validation/auth-validation.ts`

## Next Steps

When backend publishes auth OpenAPI contract:
1. Regenerate `src/lib/api/schema.d.ts` from updated openapi.yaml
2. Optional: Migrate authMutations to use `apiClient` (typed) instead of raw fetch
3. Existing implementation continues working - no breaking changes

## Evidence

- Typecheck: PASS
- Lint: PASS (warnings pre-existing)
- Tests: Auth validation tests passing
- MSW: All auth flows functional in dev mode
