<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ADI North America Registry

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/12798d83-a573-4a48-87bf-2b28433eb92a

## Run Locally

**Prerequisites:** Node.js 22 and MySQL 8


1. Install dependencies with `npm install`.
2. Create `.env` from `.env.example` and set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `SESSION_SECRET`.
3. Generate a session secret with `openssl rand -hex 32`; never commit it.
4. Run the app with `npm run dev`.

Production deployments must define the same database variables and `SESSION_SECRET` in the hosting provider. The server does not create or alter tables at startup. `schema.sql` is destructive and is intended only for a new, empty database.

## Verification

- `npm run lint`: TypeScript checks
- `npm test`: API security, owner API, and upload validation tests
- `npm run test:ui`: desktop and mobile Chromium smoke tests (run `npx playwright install chromium` once)
- `npm run build`: production build
- `npm audit --omit=dev --audit-level=high`: production dependency audit

Database-backed tests run only when all `DB_*` variables are present. CI uses an isolated MySQL service and initializes it through `npm run db:init:test`; that command refuses to run unless `NODE_ENV=test` and `DB_NAME` contains `test`.
