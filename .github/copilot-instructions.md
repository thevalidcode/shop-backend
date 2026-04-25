# Copilot Instructions - Shop Backend

You are working in the `shop-backend` service of the ValidPanel monorepo.
This service provides the core e-commerce API for individual shops, handling products, orders, customers, and admin management.

## 🛠 Tech Stack & Core Libraries
- **Runtime**: Node.js (Latest LTS)
- **Framework**: Express.js
- **Database**: PostgreSQL via Prisma ORM
- **Validation**: Zod (strict schemas required)
- **Documentation**: Swagger/OpenAPI (via `@asteasolutions/zod-to-openapi`)
- **Dates**: `date-fns`
- **Logging**: Console (keep minimal in production)

## 🏗 Architecture & File Structure

### Key Directories
- `src/controllers/`: Request handlers. Contains business logic for simple CRUD.
- `src/services/`: Complex business logic (only extract if controller > 200 lines).
- `src/routes/`: Route definitions and middleware application.
- `src/schemas/`: Zod schemas for request validation + OpenAPI definitions.
- `src/middleware/`: Auth, rate limits, feature gates.
- `prisma/schema.prisma`: The single source of truth for data models.

### API Patterns

1.  **Response Format**:
    All endpoints MUST return JSON.
    ```json
    // Success
    { "data": { ... } } or just { ... }
    // Error
    { "error": { ... } }
    ```

2.  **Authentication**:
    - `authenticateUser` -> `req.auth` contains `{ userId, shopId }`
    - `authenticateAdmin` -> `req.auth` contains `{ adminId, shopId, role }`
    - **CRITICAL**: Always use `req.auth.shopId` to scope database queries.

## 🚨 Critical Engineering Rules

### 1. Tenant Isolation (Security)
- **NEVER** query `Product`, `Order`, `Category`, `User` tables without `where: { shopId: ... }`.
- **Exception**: Super-admin internal tools (require explicit comment).
- **Leakage**: Returning data from another shop is a P0 critical incident.

### 2. Feature Implementation Checklist
When adding a new feature (e.g., "Bundles"):
1.  [ ] **Model**: Add model to `prisma/schema.prisma`. Run `npm run prisma:generate`.
2.  [ ] **Schema**: Create `src/schemas/bundles.schema.ts` with Zod.
3.  [ ] **Controller**: Create `src/controllers/bundles.controllers.ts`.
    - Validate input: `const { data, error } = BundleSchema.safeParse(req.body)`
    - Handle DB: `await prisma.bundle.create(...)`
    - Handle errors: `try/catch` with `500` response.
4.  [ ] **Route**: Create `src/routes/bundles.routes.ts`.
    - Apply `authenticateAdmin` or `authenticateUser`.
    - Apply `validateResource`.
5.  [ ] **Register**: Add route to `src/app.ts`.

### 3. Code Style & Standards
- **Imports**: modifying existing imports to add new modules is allowed.
- **Naming**:
    - Files: `camelCase` (e.g., `product.controllers.ts`).
    - Controllers: `getProducts`, `createProduct`.
    - Routes: `/v1/resources`.
- **Async/Await**: Always use async/await. Avoid `.then()`.
- **Type Safety**: Strictly typed `req` and `res`. No `any`.

## 🔍 Specific Logic & Nuances

- **Encryption**: Uses `src/utils/encrypt.ts` (AES) with `MASTER_KEY`.
- **Sockets**: `src/socket/index.ts` handles real-time updates (tickets, chat).
- **Email**: `src/emails/index.ts`. Mocked in dev, real in prod.
- **Rate Limiting**: specific middleware in `src/middleware/ratelimit/`. Apply to ALL public routes.
- **CORS**: Dynamic origin handling in `src/config/cors.config.ts`.

## 🚫 Anti-Patterns
- **Do NOT** put inline specific Zod schemas in controllers. Define them in `src/schemas`.
- **Do NOT** use `req.body` without validation.
- **Do NOT** hardcode HTTP status codes (use standard numbers 200, 400, 401, 403, 404, 500).

## Environment Variables
Refer to `.env.example` or `src/config/env.config.ts`. Key variables: `DATABASE_URL`, `JWT_SECRET`, `SESSION_SECRET`, `MASTER_KEY`.
