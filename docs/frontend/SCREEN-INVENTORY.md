# Screen and Route Inventory

Routes are proposed information architecture, not authorization to implement all at once.
`P0` supports teacher pilot, `P1` school pilot, `Later` expansion.

## Public and identity

| Route              | Screen                          | Priority              | Primary action                            |
| ------------------ | ------------------------------- | --------------------- | ----------------------------------------- |
| `/`                | Landing teacher                 | P0                    | Mulai membuat lembar                      |
| `/untuk-sekolah`   | School landing                  | P0 lead/P1 product    | Ajukan pilot/hubungi                      |
| `/harga`           | Packaging                       | P0 shell              | Mulai gratis/hubungi; no unapproved price |
| `/masuk`           | Login                           | P0                    | Masuk                                     |
| `/daftar`          | Register                        | P0                    | Buat akun                                 |
| `/lupa-sandi`      | Recovery request                | P0                    | Kirim tautan                              |
| `/reset-sandi`     | Reset                           | P0                    | Simpan sandi                              |
| `/undangan/:token` | School activation               | P1                    | Aktifkan akun/membership                  |
| `/bagikan/:token`  | Controlled read-only assessment | P0                    | Lihat/cetak jika allowed                  |
| `/legal/privasi`   | Privacy notice                  | Before external pilot | —                                         |
| `/legal/syarat`    | Terms                           | Before external pilot | —                                         |

## Teacher app

| Route                       | Screen                       | Priority | Notes                                 |
| --------------------------- | ---------------------------- | -------- | ------------------------------------- |
| `/app`                      | Dashboard                    | P0       | summary, primary flows, recent sheets |
| `/app/generate`             | Generate configuration       | P0       | full form + sticky summary            |
| `/app/jobs/:jobId`          | Generation progress/recovery | P0       | refresh-safe, no fake progress        |
| `/app/lembar`               | History                      | P0       | search/filter/status/actions          |
| `/app/lembar/:id`           | Sheet overview               | P0       | metadata, version, source, actions    |
| `/app/lembar/:id/review`    | Quick/detail review          | P0       | edit/regenerate/delete/accept         |
| `/app/lembar/:id/output`    | Output center                | P0       | preview, print, download, share       |
| `/app/bank-soal`            | Private bank                 | P0       | saved items only, not public          |
| `/app/template`             | Generation templates         | P0       | save/run/duplicate/archive            |
| `/app/kelas`                | Teacher organization/tags    | P1       | no student accounts in MVP            |
| `/app/analitik`             | Creator usage                | P1       | product usage, not student grades     |
| `/app/pengaturan/profil`    | Profile                      | P0       | name/account security                 |
| `/app/pengaturan/workspace` | Workspace switch/settings    | P0/P1    | personal and school memberships       |
| `/app/pengaturan/langganan` | Plan/usage                   | P0 shell | provider-independent state            |
| `/app/bantuan`              | Help/report quality          | P0       | support and issue context             |

## School admin

| Route                 | Screen                | Priority | Notes                               |
| --------------------- | --------------------- | -------- | ----------------------------------- |
| `/school`             | School overview       | P1       | seats, usage, onboarding            |
| `/school/guru`        | Membership list       | P1       | invite, activation, suspend, role   |
| `/school/guru/undang` | Invite/activation     | P1       | no plaintext permanent password     |
| `/school/penggunaan`  | Pooled quota          | P1       | aggregate by default                |
| `/school/pengaturan`  | School profile/policy | P1       | plan/contact/domain settings        |
| `/school/audit`       | Admin events          | P1       | membership/billing/security actions |

School admin does not automatically read teacher assessment/source content.

## Superadmin operations

| Route           | Screen                         | Priority    | Notes                                |
| --------------- | ------------------------------ | ----------- | ------------------------------------ |
| `/ops`          | Operations overview            | P0 minimal  | system health, no content by default |
| `/ops/accounts` | Account support                | P0 minimal  | explicit audited support action      |
| `/ops/schools`  | School workspaces              | P1          | plan/membership operational state    |
| `/ops/catalog`  | Curriculum/content publication | P0          | review/version/publish               |
| `/ops/prompts`  | Prompt/model route registry    | P0 internal | no secret display                    |
| `/ops/jobs`     | Job operations                 | P0 internal | failure metadata, redacted inputs    |
| `/ops/quality`  | Eval/quality reports           | P0 internal | controlled content access            |
| `/ops/audit`    | Audit search                   | P0          | immutable security actions           |
| `/ops/billing`  | Entitlement/subscription ops   | Paid pilot  | manual adjustment audited            |
| `/ops/flags`    | Feature flags                  | P1          | scoped and audited                   |

## Route guards

- Public routes never require workspace.
- Identity routes redirect authenticated users only when safe; do not break invitation flow.
- `/app/*` requires account plus active accessible workspace.
- `/school/*` requires `school_admin` membership in active school workspace.
- `/ops/*` requires platform `superadmin`; workspace role is not enough.
- Backend performs real authorization; frontend guard improves navigation only.
- Unauthorized resource lookup uses safe 404/denied behavior without leaking existence.

## Shared screen contract

Every data screen defines:

- document title and H1;
- breadcrumb/back behavior;
- primary action and destructive action;
- loading, empty, error, permission, expired, conflict, and offline behavior;
- responsive composition at 390, 768, 1280;
- keyboard initial focus and post-action focus;
- analytics events that do not contain content;
- API dependencies and feature flag;
- priority and release gate.

## Not routes in MVP

- student login, class roster, assignment taking, grading, proctoring;
- public community question bank;
- native mobile-specific screens;
- live multiplayer quiz;
- chat-first AI interface;
- unrestricted URL scraper.
