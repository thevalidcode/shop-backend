# Shop Backend Architecture

## Overview
The `shop-backend` serves as the engine for individual shops hosted on ValidPanel. It manages catalog, orders, and customer interactions for each tenant.

## System Components

### 1. API Layer
- **Framework**: Express.js
- **Entry**: `src/app.ts` -> `src/routes/`
- **Documentation**: Swagger UI at `/swagger` (defined in `src/docs/`).

### 2. Data Layer
- **Database**: PostgreSQL (managed via Prisma).
- **Isolation**: Row-level multi-tenancy enforced by `shopId` column on almost all tables.

### 3. Authentication
- **Admin**: JWT/Session based for shop owners (managing the store).
- **Customer**: Token based for end-users (shopping).

## Key Service Flows

### Product Creation
`POST /v1/products`
1. **Auth**: `authenticateAdmin` checks valid session.
2. **Rate Limit**: `productModifyRateLimit`.
3. **Validation**: `ProductCreateInputSchema` identifies invalid payloads.
4. **Logic**:
   - Check subscription limits (`checkProductLimit`).
   - Create generic product in DB.
   - (Optional) Create enhancements (variants).

### Public Product Fetch
`GET /v1/products`
1. **Params**: `shopId` (required query param for public access).
2. **Logic**: Fetch products where `shopId == query.shopId` AND `status == ACTIVE`.

## Directory Map

| Path | Purpose |
|---|---|
| `src/controllers` | Request handlers. |
| `src/middleware` | Reusable logic (auth, limits). |
| `src/schemas` | Zod definitions. |
| `src/routes` | distinct API sections. |
| `src/cronJobs` | Scheduled tasks (cleaning old carts, etc.). |

## Deployment
- Dockerized via `Dockerfile` (assumed standard Node setup).
- Run with `npm start`.
