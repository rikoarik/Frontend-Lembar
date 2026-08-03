# API Mismatch Audit Report

**Date:** 2026-07-26
**Backend:** ~/Projects/Backend-Lembar
**Frontend:** ~/Projects/Frontend-Lembar

---

## Service: `src/services/school/schoolService.ts`

---

### MISMATCH 1 — SchoolMember missing `name` and `lastActiveAt` in list endpoints

**Endpoints affected:**
- `GET /v1/school/members` (member list)
- `GET /v1/school/dashboard` (members array)
- `PATCH /v1/school/members/:id/role` (updateRole response)

**Frontend expected type** (`SchoolMember`, line 98-106):
```ts
{ id, email, name, role, state, joinedAt, lastActiveAt }
```

**Backend actual response** (PostgresSchoolStores.listMembers, PostgresSchoolStores.ts line 103-109):
```ts
{ id, email, role, state, joinedAt }
```

**Missing fields:**
- `name` — Backend does not query or return member name in list endpoints
- `lastActiveAt` — Backend does not query or return lastActiveAt in list endpoints

**File to fix:**
- Backend: `~/Projects/Backend-Lembar/src/modules/school/persistence/PostgresSchoolStores.ts` lines 86-109 (listMembers method needs to JOIN jwt_users for name + last_active_at)
- Backend: `~/Projects/Backend-Lembar/src/modules/school/domain/types.ts` line 14-20 (SchoolMember interface needs `name` and `lastActiveAt`)

---

### MISMATCH 2 — memberDetail uses `status` instead of `state`

**Endpoint:** `GET /v1/school/members/:id`

**Frontend expected type** (`SchoolMemberDetail`, line 108-113):
```ts
{ id, email, name, role, state, joinedAt, lastActiveAt, stats: { assessmentCount, quotaUsed } }
```

**Backend actual response** (memberRoutes.ts line 242-256):
```ts
{ id, email, name, role, status, joinedAt, lastActiveAt, stats: { assessmentCount, quotaUsed } }
```

**Mismatch:** Backend field is named `status`, frontend expects `state`

**File to fix:**
- Backend: `~/Projects/Backend-Lembar/src/modules/school/adapters/http/memberRoutes.ts` line 248: change `status: member.state` to `state: member.state`

---

### MISMATCH 3 — Stats endpoint returns completely different fields

**Endpoint:** `GET /v1/school/stats`

**Frontend expected type** (`SchoolStatsData`, line 193-201):
```ts
{ totalMembers, activeMembers, suspendedMembers, pendingInvitations, totalAssessments, quotaUsed, quotaLimit }
```

**Backend actual response** (statsRoutes.ts line 111-120):
```ts
{ workspaceName, totalMembers, activeMembers, teacherCount, adminCount, plan, generationsUsedThisMonth, monthlyLimit }
```

**Mismatched fields (frontend expects but backend doesn't return):**
- `suspendedMembers`
- `pendingInvitations`
- `totalAssessments`
- `quotaUsed`
- `quotaLimit`

**Extra fields in backend (not expected by frontend):**
- `workspaceName`
- `teacherCount`
- `adminCount`
- `plan`
- `generationsUsedThisMonth`
- `monthlyLimit`

**File to fix:**
- Backend: `~/Projects/Backend-Lembar/src/modules/school/adapters/http/statsRoutes.ts` lines 111-120 — response shape needs to match the frontend type
- Frontend: `~/Projects/Frontend-Lembar/src/services/school/schoolService.ts` line 193-201 — OR update the frontend type to match what backend actually returns

---

### MISMATCH 4 — SchoolInvitationResult missing `role`, extra `tokenHash`

**Endpoint:** `POST /v1/school/members/invite`

**Frontend expected type** (`SchoolInvitationResult`, line 120-125):
```ts
{ token, email, role, expiresAt }
```

**Backend actual response** (SchoolService.createInvitation, SchoolService.ts line 94-99):
```ts
{ token, tokenHash, email, expiresAt }
```

**Missing fields:**
- `role` — Backend does not return the role in the invitation result

**Extra fields:**
- `tokenHash` — Backend returns `tokenHash` which frontend doesn't expect

**File to fix:**
- Backend: `~/Projects/Backend-Lembar/src/modules/school/application/SchoolService.ts` lines 94-99 — add `role: input.role` to the return object
- Backend: `~/Projects/Backend-Lembar/src/modules/school/domain/types.ts` line 30-36 — SchoolInvitationResult should include `role`

---

### MISMATCH 5 — Library list missing `authorEmail`, `finalizedAt`, `updatedAt`

**Endpoint:** `GET /v1/school/library`

**Frontend expected type** (`SchoolLibraryItem`, line 155-165):
```ts
{ id, title, subject, grade, questionCount, authorName, authorEmail, finalizedAt, updatedAt }
```

**Backend actual response** (libraryRoutes.ts line 118-121):
```ts
{ id, title, subject, grade, questionCount, createdAt, authorId, authorName }
```

**Missing fields (frontend expects but backend doesn't return):**
- `authorEmail`
- `finalizedAt` (backend has `createdAt` instead)
- `updatedAt`

**Extra fields (backend returns but frontend doesn't expect):**
- `authorId`
- `createdAt` (frontend expects `finalizedAt`)

**File to fix:**
- Backend: `~/Projects/Backend-Lembar/src/modules/school/adapters/http/libraryRoutes.ts` lines 82-99 — SQL query needs to select `u.email AS "authorEmail"`, map `created_at` to `finalizedAt`, and add `updated_at`

---

### MISMATCH 6 — Library detail has different question shape and missing fields

**Endpoint:** `GET /v1/school/library/:id`

**Frontend expected type** (`SchoolLibraryDetail`, line 172-175):
```ts
{
  // ...extends SchoolLibraryItem (same missing fields as MISMATCH 5)
  blueprint: Record<string, unknown> | null;
  questions: Array<{ id, type, text }>;
}
```

**Backend actual response** (libraryRoutes.ts line 211-217):
```ts
{
  ...assessment (id, title, subject, grade, questionCount, createdAt, authorId, authorName, blueprint, status),
  latestVersion: { id, version, createdAt, notes },
  questions: [{ id, questionNo, type, status }]
}
```

**Additional mismatches beyond MISMATCH 5:**
- Questions: Frontend expects `text`, backend has `questionNo` and `status` instead
- Backend has extra `status` and `latestVersion` fields

**File to fix:**
- Backend: `~/Projects/Backend-Lembar/src/modules/school/adapters/http/libraryRoutes.ts` lines 197-216 — questions query should select `text` or equivalent, remove extra fields

---

### MISMATCH 7 — Audit log has completely different field names

**Endpoint:** `GET /v1/school/audit`

**Frontend expected type** (`SchoolAuditRow`, line 177-186):
```ts
{ id, actorId, actorEmail, action, targetType, targetId, metadata, createdAt }
```

**Backend actual response** (schoolAuditRoutes.ts line 122-125):
```ts
{ id, at, actor, action, target, metadata }
```

**Missing fields (frontend expects but backend doesn't return):**
- `actorId`
- `actorEmail`
- `targetType`
- `targetId`
- `createdAt`

**Extra fields / renamed (backend returns but named differently):**
- `actor` (frontend expects `actorId`)
- `at` (frontend expects `createdAt`)
- `target` (frontend expects `targetId`)

**File to fix:**
- Backend: `~/Projects/Backend-Lembar/src/modules/school/adapters/http/schoolAuditRoutes.ts` lines 93-116 — SQL query and response mapping need to split `user_id` into `actorId`, resolve `actorEmail` from jwt_users join, split `metadata` into `targetType`/`targetId`, and rename `occurred_at` to `createdAt`

---

## Service: `src/services/admin/adminService.ts`

---

### MISMATCH 8 — AdminJobRow missing `progress`

**Endpoint:** `GET /v1/admin/jobs`

**Frontend expected type** (`AdminJobRow`, line 91-98):
```ts
{ id, type, tenant, status, progress, updatedAt }
```

**Backend actual response** (adminRoutes.ts line 572-581):
```ts
{ id, type, status, tenant, workspaceId, attempt, createdAt, updatedAt }
```

**Missing fields:**
- `progress` — Backend does not return a `progress` field (returns `attempt` instead)

**Extra fields:**
- `workspaceId`, `attempt`, `createdAt`

**File to fix:**
- Backend: `~/Projects/Backend-Lembar/src/modules/admin/adapters/http/adminRoutes.ts` line 572-581 — add `progress` field to response mapping, or update frontend type to use `attempt` instead of `progress`
- Frontend: `~/Projects/Frontend-Lembar/src/services/admin/adminService.ts` line 96

---

### MISMATCH 9 — updateAccount returns incomplete shape

**Endpoint:** `PATCH /v1/admin/accounts/:id`

**Frontend expected type** (`AdminAccountDetail`, line 289-293):
```ts
{ id, email, name, displayName, username, phone, roles, role, status, school, schoolSlug, workspaceId, billing, stats, createdAt, updatedAt, lastLoginAt, auditLog }
```

**Backend actual response** (adminRoutes.ts line 275):
```ts
{ id, email, name, phone, updated_at }
```

**Missing fields (all required by frontend):**
- `displayName`, `username`, `roles`, `role`, `status`, `school`, `schoolSlug`, `workspaceId`, `billing`, `stats`, `createdAt`, `updatedAt`, `lastLoginAt`, `auditLog`

**File to fix:**
- Backend: `~/Projects/Backend-Lembar/src/modules/admin/adapters/http/adminRoutes.ts` line 267-275 — response needs to either return the full AdminAccountDetail shape, or frontend type should be narrowed

---

### MISMATCH 10 — createFlag missing `id` and `description`

**Endpoint:** `POST /v1/admin/flags`

**Frontend expected type** (`AdminFlagRow`, line 414-415):
```ts
{ id, key, description, enabled, scope }
```

**Backend actual response** (adminRoutes.ts line 733):
```ts
{ key, enabled: false, scope }
```

**Missing fields:**
- `id` — Backend does not return the flag ID
- `description` — Backend does not return description in create response

**File to fix:**
- Backend: `~/Projects/Backend-Lembar/src/modules/admin/adapters/http/adminRoutes.ts` line 733 — return `id` (from `created.id`) and `description` (from `body.description`)

---

### MISMATCH 11 — Upgrade/Downgrade workspace response shape mismatch

**Endpoints:** `POST /v1/me/plan/upgrade`, `POST /v1/me/plan/downgrade`

**Frontend expected type** (adminService.ts line 482-487):
```ts
{ workspaceId: string; plan: string }
```

**Backend actual response** (PlanChangeResult, payment/domain/types.ts line 109-114):
```ts
{ workspaceId, previousPlan, newPlan, orderId, transitionedAt }
```

**Mismatched fields:**
- Frontend expects `plan` — Backend returns `newPlan` and `previousPlan` (different field names)

**Additional functional mismatch:**
- Frontend sends `workspaceId` in POST body
- Backend reads `workspaceId` from `x-workspace-id` header (subscriptionRoutes.ts line 50)

**File to fix:**
- Backend: `~/Projects/Backend-Lembar/src/modules/payment/adapters/http/subscriptionRoutes.ts` — response should map `newPlan` to `plan`
- Frontend: `~/Projects/Frontend-Lembar/src/services/admin/adminService.ts` lines 482-487 — also needs to send workspaceId via proper mechanism (the admin service likely goes through a proxy that injects headers)

---

### MISMATCH 12 — SetEntitlement response shape mismatch

**Endpoint:** `POST /v1/admin/entitlements/:workspaceId`

**Frontend expected type** (adminService.ts line 568-569):
```ts
{ workspaceId: string; plan: string }
```

**Backend actual response** (adminRoutes.ts line 1075, returns PlanChangeResult):
```ts
{ workspaceId, previousPlan, newPlan, orderId, transitionedAt }
```

**Mismatched fields:**
- Frontend expects `plan` — Backend returns `newPlan` and `previousPlan`

**File to fix:**
- Backend: `~/Projects/Backend-Lembar/src/modules/admin/adapters/http/adminRoutes.ts` line 1075 — map `result.newPlan` to `plan` in the response

---

### MISMATCH 13 — Payment orders: missing `meta`, different `PaymentOrder` shape

**Endpoint:** `GET /v1/payment/orders`

**Frontend expected type** (adminService.ts line 473-480):
```ts
{ data: PaymentOrder[]; meta: AdminMeta }
```
Where `PaymentOrder` = `{ id, workspaceId, school, amount, currency, status, gateway, createdAt, updatedAt }`

**Backend actual response** (webhookRoutes.ts line 182):
```ts
{ data: orders }  // NO meta
```
Where each order = `{ id, tenantId, workspaceId, idempotencyKey, externalOrderId, fromPlan, toPlan, amountCents, currency, status, gatewayPayload, paidAt, createdAt, updatedAt }`

**Missing from backend:**
- `meta` — No pagination metadata
- `school` — Backend does not return school name
- `gateway` — Backend has `gatewayPayload` instead
- `amount` — Backend has `amountCents` instead

**Extra in backend:**
- `tenantId`, `idempotencyKey`, `externalOrderId`, `fromPlan`, `toPlan`, `gatewayPayload`, `paidAt`

**File to fix:**
- Backend: `~/Projects/Backend-Lembar/src/modules/payment/adapters/http/webhookRoutes.ts` line 164-186 — add meta pagination, add school name join, rename `amountCents` to `amount`, add `gateway`
- Frontend: `~/Projects/Frontend-Lembar/src/services/admin/adminService.ts` lines 171-181 — update PaymentOrder type to match backend, or vice versa

---

### MISMATCH 14 — Catalog endpoints: response NOT wrapped in `{ data: ... }`

**Endpoints affected:**
- `PATCH /v1/admin/catalog/grades/:id/status` → line 386: `send({ id, status })`
- `PATCH /v1/admin/catalog/subjects/:id/status` → line 428: `send({ id, status })`
- `POST /v1/admin/catalog/grades` → line 477: `send(newItem)` = `{ id, label, status, jenjang }`
- `POST /v1/admin/catalog/subjects` → line 509: `send(newItem)` = `{ id, label, status, jenjangList }`
- `DELETE /v1/admin/catalog/grades/:id` → line 531: `send({ id, archived: true })`
- `DELETE /v1/admin/catalog/subjects/:id` → line 553: `send({ id, archived: true })`

**Frontend expected:** Responses wrapped in `{ data: ... }` (because `request<T>` unwraps `json.data`)

**Backend actual:** All catalog endpoints return the response object directly WITHOUT `{ data: ... }` wrapper

**Impact:** Frontend `request<T>` function reads `json.data` which will be `undefined`, causing all catalog operations to return `undefined` instead of the expected data.

**File to fix:**
- Backend: `~/Projects/Backend-Lembar/src/modules/catalog/adapters/http/catalogRoutes.ts` lines 386, 428, 477, 509, 531, 553 — all responses need `{ data: ... }` wrapper

---

### MISMATCH 15 — Learning signals and prompt versions/eval-cases: wrapper mismatch

**Endpoints affected:**
- `GET /v1/admin/learning-signals`
- `GET /v1/admin/prompts/:id/versions`
- `GET /v1/admin/prompts/:id/eval-cases`

**Frontend expected type:**
- `learningSignals()`: `{ data: { ... }[] }` (adminService.ts line 559)
- `promptVersions()`: `{ data: unknown[] }` (adminService.ts line 543)
- `promptEvalCases()`: `{ data: unknown[] }` (adminService.ts line 551)

**Backend actual:** Returns `{ data: [...] }` (with meta wrapping in the `request<T>` function)

Since these have no `meta`, the `request<T>` function returns `json.data` (the raw array), but the frontend type expects `{ data: [... ] }`. The frontend code would try to access `.data` on the raw array.

**Impact:** Frontend gets a raw array but types expect `{ data: array }`, causing runtime access failures.

**File to fix:**
- Frontend: `~/Projects/Frontend-Lembar/src/services/admin/adminService.ts` lines 543, 551, 559 — type should be `unknown[]` / `{ prompt_template_id: string; ... }[]` instead of `{ data: ... }`
- OR Backend: add meta to these list endpoints so the `request<T>` function handles wrapping correctly

---

### MISMATCH 16 — createMarketingPage endpoint does not exist

**Endpoint:** `POST /v1/ops/marketing/pages`

**Frontend call** (adminService.ts line 582-584):
```ts
createMarketingPage(data: { slug: string; title: string }): Promise<Result<{ slug: string; title: string }, AdminError>> {
    return request('/v1/ops/marketing/pages', 'POST', data);
}
```

**Backend actual:** No `POST /v1/ops/marketing/pages` route exists in `opsRoutes.ts`. The marketing ops module only has GET, PUT (draft), and POST (publish/unpublish/restore) routes.

**Impact:** 404 error when frontend calls this endpoint.

**File to fix:**
- Backend: `~/Projects/Backend-Lembar/src/modules/marketing/adapters/http/opsRoutes.ts` — add `POST /v1/ops/marketing/pages` route for creating new content pages

---

## Summary Table

| # | Endpoint | Issue | Severity |
|---|----------|-------|----------|
| 1 | GET /v1/school/members, dashboard, role update | `name` + `lastActiveAt` missing from member lists | 🔴 High |
| 2 | GET /v1/school/members/:id | `status` vs `state` field name mismatch | 🔴 High |
| 3 | GET /v1/school/stats | Completely different response shape | 🔴 Critical |
| 4 | POST /v1/school/members/invite | Missing `role`, extra `tokenHash` | 🟡 Medium |
| 5 | GET /v1/school/library | Missing `authorEmail`, `finalizedAt`, `updatedAt` | 🔴 High |
| 6 | GET /v1/school/library/:id | Wrong question shape + missing fields | 🔴 High |
| 7 | GET /v1/school/audit | All field names different (`actor`/`at`/`target`) | 🔴 Critical |
| 8 | GET /v1/admin/jobs | Missing `progress` field | 🟡 Medium |
| 9 | PATCH /v1/admin/accounts/:id | Returns only 5 fields, frontend expects ~14 | 🔴 High |
| 10 | POST /v1/admin/flags | Missing `id` and `description` | 🟡 Medium |
| 11 | POST /v1/me/plan/upgrade, downgrade | `plan` vs `newPlan`; body vs header workspaceId | 🔴 High |
| 12 | POST /v1/admin/entitlements/:id | `plan` vs `newPlan`/`previousPlan` | 🔴 High |
| 13 | GET /v1/payment/orders | No meta, different PaymentOrder fields | 🔴 High |
| 14 | All catalog PATCH/POST/DELETE | Response NOT wrapped in `{ data: ... }` | 🔴 Critical |
| 15 | learning-signals, prompt versions/eval-cases | Wrapper `{ data: [...] }` vs raw array | 🟡 Medium |
| 16 | POST /v1/ops/marketing/pages | Endpoint does not exist | 🔴 Critical |
