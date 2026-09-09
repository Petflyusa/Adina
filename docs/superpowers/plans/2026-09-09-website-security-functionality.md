# Website Security And Functionality Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 ADI/Adina 网站从当前可构建的 MVP 提升为具备服务端授权、完整 Owner 流程、可验证输入和可回归测试的生产版本。

**Architecture:** 保留 React/Vite + Express + MySQL 架构，新增基于 HttpOnly cookie 的服务端会话和集中式授权 middleware。所有 Owner/Admin 数据访问从 URL 中的用户 ID 改为从会话身份推导；前端 API 契约统一为 snake_case，并为关键流程增加 API 集成测试。

**Tech Stack:** React 19, TypeScript, Vite, Express 4, MySQL2, Node test runner, bcrypt/argon2-compatible password hashing, HttpOnly cookie sessions。

**Spec:** 本文件及当前仓库审计结果。

## Global Constraints

- 生产环境不得从源码、schema seed 或 `.env.example` 读取真实密码。
- 所有 `/api/admin/*` 写接口必须要求 admin 会话；所有 `/api/owner/*` 接口必须要求 owner 会话并校验资源归属。
- 所有 JSON API 错误必须返回 JSON，不得让未知 `/api/*` 路径落入 HTML SPA fallback。
- 图片和身份证件必须有明确大小、类型和存储策略；不得依赖 serverless 本地文件系统。
- 每个任务完成后运行 `npm run lint`、`npm run build`，并运行该任务专属测试。

## Audited Findings

- `server.js:415-575` 的 Owner API 和 `server.js:582-1210` 的 Admin API 没有身份认证；未登录请求可读取数据。
- `src/components/PageSections.tsx:6192`、`:6267`、`:6533`、`:6689` 调用的 Owner stats、animal link、Owner travel 路由不存在；实测 stats/travel 返回 HTML，导致 `Unexpected token '<'`。
- 登录把用户对象写入 `localStorage`，但服务端没有 session/token；前端路由保护不是授权机制。
- `server.js:339-410`、`:553-570`、`:1193-1207` 使用明文密码；`server.js:21-23` 和 `.env.example:13-17` 含数据库凭据。
- `server.js:507-525` 接受客户端 `owner_id`/`animal_id`，没有验证动物归属；申请审批 `server.js:1041-1094` 非幂等。
- `npm audit --omit=dev` 当前报告 13 个漏洞，其中 6 个 high。
- `src/components/PageSections.tsx:6175` 的 2FA 是无动作按钮；Admin travel 页面在 `src/App.tsx:263-271` 显示 Coming Soon。

### Task 1: Establish Security Test Harness

**Files:**
- Create: `tests/api.test.mjs`
- Modify: `package.json`
- Modify: `server.js` only if exporting an unstarted app is needed for tests

**Interfaces:**
- Produces test commands `npm run test` and `npm run test:security`.
- Tests use an isolated test database or a transaction-backed fixture; production `DB_NAME` is rejected by the test bootstrap.

- [ ] **Step 1: Add a test script**

Add `"test": "node --test tests/**/*.test.mjs"` and `"test:security": "node --test tests/api.test.mjs"` to `package.json`.

- [ ] **Step 2: Write failing authorization tests**

Cover anonymous `GET /api/admin/owners`, anonymous `GET /api/owner/animals/2`, owner access to another owner ID, and admin-only mutation. Each must expect `401` or `403`, never `200`.

- [ ] **Step 3: Add API contract tests**

Assert that unknown `/api/owner/stats/2`, `/api/owner/travel/2`, and `/api/owner/animals/link` return JSON `404` until their replacement endpoints are implemented; assert no API response has `text/html` content type.

- [ ] **Step 4: Run the failing suite**

Run `npm run test:security`. Expected current result: failures proving the authorization and route gaps.

- [ ] **Step 5: Commit the test harness**

```bash
git add tests package.json
git commit -m "test: add API security and contract checks"
```

### Task 2: Replace Plaintext Authentication With Sessions

**Files:**
- Modify: `server.js:13-41,339-410`
- Modify: `schema.sql:4-23`
- Modify: `schema_postgres.sql:12-31`
- Modify: `src/App.tsx:75-132`
- Modify: `src/components/PageSections.tsx:8378-8500`
- Add dependency: `bcrypt` or `argon2`, plus a signed cookie/session implementation

**Interfaces:**
- `POST /api/auth/login` sets an HttpOnly, Secure-in-production session cookie and returns a redacted user object.
- `POST /api/auth/logout` invalidates the session.
- `GET /api/auth/me` returns the current user or `401`.
- `requireAuth`, `requireRole('admin'|'owner')`, and `requireOwnerParam` become the only authorization path for protected routes.

- [ ] **Step 1: Add failing password/session tests**

Test that a seeded password hash authenticates, plaintext password columns are not returned, login sets a cookie, logout invalidates it, and an invalid password is rejected without timing-sensitive detail.

- [ ] **Step 2: Add password hash migration**

Create a one-time migration that hashes existing plaintext passwords before changing login to `compare`. Remove the default fallback DB credentials and fail startup when required DB environment variables are absent in production.

- [ ] **Step 3: Implement session middleware**

Use a server-side session store or signed, short-lived token with rotation. Set `HttpOnly`, `SameSite=Lax/Strict`, `Secure` in production, and a bounded expiry. Never store authorization state in `localStorage`.

- [ ] **Step 4: Protect every private route**

Apply admin middleware to all `/api/admin/*`; apply owner middleware to owner reads/writes; derive owner ID from `req.user.id` rather than trusting path/body IDs. Keep only public verification, member directory, application submission, login, and registration public.

- [ ] **Step 5: Update React auth state**

Load `/api/auth/me` on startup, use `credentials: 'include'`, clear state through `/api/auth/logout`, and route based on the server response.

- [ ] **Step 6: Verify**

Run `npm run test:security`, then manually verify anonymous, owner, and admin browser sessions in separate private windows. Expected: no private data is returned without a valid session.

### Task 3: Complete and Unify Owner API

**Files:**
- Modify: `server.js:415-575`
- Modify: `src/components/PageSections.tsx:6184-6816`
- Test: `tests/owner-api.test.mjs`

**Interfaces:**
- `GET /api/owner/dashboard` returns stats, animals, activities, and recent travel requests.
- `GET /api/owner/animals` lists only the authenticated owner’s animals.
- `POST /api/owner/animals/link` links a verified microchip only after ownership and status checks.
- `GET /api/owner/travel` and `POST /api/owner/travel` use one documented snake_case contract.
- `GET /api/owner/stats` is either implemented or removed from the frontend; no dead endpoint remains.

- [ ] **Step 1: Write failing contract tests**

Test dashboard, stats, link, travel list, and travel create response shapes; test that an animal belonging to another owner cannot be linked or used in a travel request.

- [ ] **Step 2: Implement routes and validation**

Validate dates, flight number, confirmation number, route, microchip format, and required fields. Use authenticated owner ID only. Return `400` for malformed input, `404` for missing resources, and `409` for duplicate links.

- [ ] **Step 3: Update frontend calls**

Replace `/api/owner/stats/:id`, `/api/owner/travel/:id`, and camelCase `/api/owner/travel` payloads with the unified contract. Add `response.ok` checks before `response.json()` so HTML cannot surface as a JSON parser error.

- [ ] **Step 4: Verify**

Run `npm run test:security` and `npm run build`; browser-test dashboard, animals, link, travel submit, and profile update as an owner.

### Task 4: Harden Admin/Application Workflows

**Files:**
- Modify: `server.js:274-304,620-831,870-1094`
- Modify: `src/components/PageSections.tsx:4634-5317`
- Test: `tests/admin-workflows.test.mjs`

**Interfaces:**
- Application status accepts only `Pending`, `Approved`, `Rejected`.
- Approval is idempotent: a second approval returns the existing owner/animal or `409`, and never creates duplicates.
- Member import validates row count, required columns, field lengths, and runs in a transaction.
- Admin mutations return affected-row status and consistent JSON errors.

- [ ] **Step 1: Add failing workflow tests**

Test duplicate approval, invalid status, duplicate microchip, invalid member import, and rollback when one imported row fails.

- [ ] **Step 2: Add transactions and uniqueness checks**

Wrap approval in a transaction; check application status before creating owner/animal; enforce unique email, registry ID, and microchip with controlled `409` responses.

- [ ] **Step 3: Add bounded validation**

Reject oversized strings, invalid dates, malformed email, unsupported status, and empty required fields before database writes. Add rate limiting or CAPTCHA to public application submission.

- [ ] **Step 4: Verify**

Run workflow tests and execute a browser pass for application submit, approve, reject, animal create/edit/delete, owner create/edit/delete, and member import.

### Task 5: Secure Files, PII, and Public APIs

**Files:**
- Modify: `server.js:13-90,163-272,306-337`
- Modify: `schema.sql`, `schema_postgres.sql`
- Modify: `vercel.json`
- Test: `tests/public-api.test.mjs`

**Interfaces:**
- Public verification returns only the minimum fields needed to verify a certificate; never returns phone, ID suffix, address, or private documents.
- `/api/test-db-connection` is disabled outside local development and never returns raw DB errors.
- Uploads use an allow-list of image MIME types, decoded byte-size limits, and private storage or durable object storage; document URLs are not public.

- [ ] **Step 1: Add failing privacy and upload tests**

Assert redacted public verification response, disabled production diagnostic endpoint, rejection of SVG/script/polyglot uploads, rejection above the byte limit, and no public access to ID documents.

- [ ] **Step 2: Implement upload validation and durable storage**

Inspect decoded bytes, normalize extension from trusted MIME detection, use object storage in production, and store an opaque object key. Keep database data URLs only for explicitly bounded small images.

- [ ] **Step 3: Add security headers and API 404**

Add Helmet-equivalent headers, strict JSON content type for `/api`, request correlation IDs, and an API 404 handler before the SPA fallback.

- [ ] **Step 4: Verify**

Run public API tests, inspect response fields with a test client, and confirm `/uploads` cannot expose identity documents.

### Task 6: Dependency, Build, and Runtime Quality Gates

**Files:**
- Modify: `package.json`, `package-lock.json`, `vite.config.ts`, `README.md`
- Create: `.github/workflows/ci.yml`
- Remove or fix: `package.json:12` unsafe `clean` script

**Interfaces:**
- CI runs install, lint, tests, build, and `npm audit --omit=dev --audit-level=high`.
- Production startup fails fast on missing configuration and does not execute destructive schema drops.
- Build output is code-split enough to remove the current 701 KB main-chunk warning or the warning is explicitly budgeted.

- [ ] **Step 1: Update dependencies**

Run `npm audit fix --package-lock-only`, review any major upgrades, then run `npm install`, `npm run lint`, `npm test`, and `npm run build`. Do not accept a lockfile-only change without the test results.

- [ ] **Step 2: Add CI workflow**

Run the four commands on every push and pull request. Store no production credentials in CI.

- [ ] **Step 3: Make startup safe**

Move schema creation/migrations to an explicit migration command; remove `DROP TABLE` execution from application startup. Replace `clean` with a non-destructive `clean:dist` that only removes build output.

- [ ] **Step 4: Verify**

Run the full local gate:

```bash
npm ci
npm run lint
npm test
npm run build
npm audit --omit=dev --audit-level=high
git diff --check
```

Acceptance is a passing test/build and zero high-severity production dependency findings, or a documented exception with an expiry date.

### Task 7: Complete User-Facing Feature Gaps

**Files:**
- Modify: `src/App.tsx:263-271,493-527`
- Modify: `src/components/PageSections.tsx:6171-6177,5802-5855`
- Modify: `src/components/Navigation.tsx:158-178`
- Test: `tests/ui-smoke.md` or browser automation suite

**Interfaces:**
- Admin travel management is either implemented end-to-end or removed from navigation; it must not show “Coming Soon” while API endpoints exist.
- 2FA button either starts a real enrollment flow or is labeled as unavailable and disabled.
- Notifications are loaded from the API and reflect actual status changes.
- Privacy policy, terms, accessibility, and news links resolve to real pages.

- [ ] **Step 1: Choose and document the product behavior**

For each gap, define the user-visible success state and error state before coding.

- [ ] **Step 2: Implement the smallest complete flow**

Use the existing components and API patterns; do not leave interactive controls without a handler.

- [ ] **Step 3: Verify**

Run a desktop and mobile smoke pass for all public pages, login, Admin, Owner, Apply, Verify, Members, travel, profile, and logout. Capture screenshots for regressions.

## Release Gate

Do not deploy until Tasks 1-6 pass. Task 7 may be staged only when each incomplete feature is hidden or clearly disabled. Before release, rotate all leaked database/user credentials, invalidate old sessions, and confirm the deployed environment has the new schema migrations and durable photo/document storage.
