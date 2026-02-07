# GitHub Copilot / AI Agent Instructions for shop-backend 🔧

**Quick context:** This is a TypeScript + Express + Prisma backend that powers a multi-tenant shop platform (shops are identified by `shopId`/`uid`). It favors explicit Zod validation, Prisma for DB access, and server-side email and socket features.

## What to know first ✅
- Project entry points: `src/index.ts` (server + socket setup) and `src/app.ts` (route wiring & middleware).
- API prefix: most routes are under `/v1/*` (see `src/app.ts`). Webhooks use `/v1/webhooks`, internal APIs are mounted under `/internal`.
- Run locally: `npm install` then `npm run dev` (nodemon uses `tsx src/index.ts`). Build: `npm run build` then `npm start`.
- DB & Prisma: set `DATABASE_URL`; run migrations with `npm run dev:migrate` (dev) or `npm run migrate` (deploy). `npm run prisma:generate` creates the client.

## Environment & secrets 🔐
- Env schema enforced in `src/config/env.config.ts`. Required keys include **DATABASE_URL**, **MASTER_KEY** (exactly 32 chars), **JWT_SECRET**, **SESSION_SECRET**, and **CORE_SERVICE_SECRET**.
- NOTE: `MASTER_KEY` is validated (32 chars) and used by `src/utils/encrypt.ts` for AES encrypt/decrypt.

## Auth & Security rules 🔒
- Browser auth expects a cookie `auth_token` + CSRF cookie `csrf_token` matched with header `x-csrf-token`. See `src/middleware/auth/auth.shared.ts` and `src/middleware/auth/index.ts`.
- Internal service auth uses JWTs signed with service secrets (payloads require `serviceKey` and are verified against `env.CORE_SERVICE_SECRET`). Use `verifyInternalUserAuth`/`verifyInternalAdminAuth`.
- Controllers rely on `req.auth` (typed in `auth.shared.ts`) — always validate `req.auth` with `UserAuthSchema` or `AdminAuthSchema` (common pattern).

## Coding patterns & conventions 🧭
- Validation: Zod everywhere in `src/schemas/*`. Controllers call `.safeParse()` and return `400` with `error.flatten()` on failure.
  - Example: `const authParsed = UserAuthSchema.safeParse(req.auth);` in `src/controllers/order.controllers.ts`.
- Prisma: use `prisma` from `src/config/db.config.ts` (PrismaPg adapter). Prefer `findFirst`, `update`/`updateMany` and transactions (`prisma.$transaction`) for multi-step updates.
- Controllers: return JSON responses with clear status codes: 400 (validation), 401 (auth), 404 (not found), 500 (server). Log server errors to console with a contextual message.
- Enums: Zod uses native Prisma enums (`z.nativeEnum(OrderStatus)`), keep schema enums in sync with `prisma/schema.prisma`.
- Counters: many resources are shop-scoped counters (e.g., emailLogCounter, shopScopedId) — update via transactions to avoid races.

## Email behavior & templates ✉️
- Email sending is implemented in `src/emails/index.ts`. In non-production, functions log to console and do NOT send actual emails. In production it uses sendmail transport and logs to `emailLog` table.
- Use `sendUserEmail` and `sendEmailToAdmins` helpers; templates exist in `src/emails/templates` and templates can be overridden per shop in the DB.

## CORS & host management 🌐
- CORS origin list is dynamically updated from DB. See `src/config/cors.config.ts` and `updateAllowedHosts` (called at startup & every 5 minutes in `src/index.ts`).
- Swagger docs are served under `/swagger/docs` and require admin session (`src/docs/swagger.ts`).

## Socket.IO events ⚡
- Socket path: `/shop/backend/socket.io` (configured in `src/index.ts`).
- Events to know: `initConnection` (set user active), `newTicketMessage` (broadcast), `userTyping` (broadcast), and `disconnect` (sets user inactive). Implementations in `src/socket/index.ts`.

## Important files to inspect when changing behavior 🔎
- `src/config/env.config.ts` — env validation
- `src/config/db.config.ts` — prisma client setup
- `src/middleware/auth/*` — token validation & `req.auth` population
- `src/schemas/*` — Zod schemas & OpenAPI definitions
- `src/emails/*` — templates & send behavior
- `src/utils/encrypt.ts` — MASTER_KEY usage
- `src/index.ts` & `src/app.ts` — server bootstrap, CORS, routes

## Developer workflows & commands 🛠️
- Development server: `npm run dev` (nodemon + tsx) ✅
- Typecheck only: `npm run typecheck` (strict `tsc --noEmit`) ✅
- Migrations: `npm run dev:migrate` (runs `prisma migrate dev && prisma generate`), use `npm run migrate` for deploys.
- Build: `npm run build` (runs `prisma:generate` then `tsc`).

## Testing & caution 🚧
- There are no unit tests in the repo (the `test` script is a placeholder). Avoid adding heavy test infra unless requested.
- Many operations modify multiple tables and rely on shop counters — use `prisma.$transaction` to preserve consistency.
- Email senders are environment-gated; running in dev won't send live emails.

---

If anything above is unclear or you'd like additional examples (e.g., a snippet showing how to craft an internal service JWT, or an example Zod schema editing workflow), tell me which section to expand and I will iterate. 👇