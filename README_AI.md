# Shop Backend AI Documentation

## 1. Project Overview

**Purpose**: Manages core e-commerce functionality for individual shops (products, orders, categories, customers).
**Stack**: Node.js, Express, Prisma (PostgreSQL), Zod.
**Type**: Backend Service.

## 2. Key Responsibilities

- **Product Management**: CRUD, variants, inventory.
- **Order Processing**: Creation, status updates, basic fulfillment.
- **Shop Public API**: Serving storefront data (products, categories, pages).
- **Admin API**: Tools for shop owners to manage their store.
- **Tenant Isolation**: ALL data queries MUST be scoped by `shopId`.

Identifier note: `shop.uid` is the shop domain identifier string, not a UUID.

## 3. Architecture Patterns

### Controller-Service Pattern

- **Controllers** (`src/controllers/*.ts`): Handle HTTP requests, validation, and response formatting.
- **Services** (`src/services/*.ts`): (Optional) encapsulate complex logic. Simple CRUD often lives directly in controllers using Prisma.
- **Routes** (`src/routes/*.ts`): Define endpoints and apply middleware.

### Database Access

- **ORM**: Prisma.
- **Client**: `import { prisma } from "../config/db.config";`
- **Pattern**:
  ```typescript
  const products = await prisma.product.findMany({
    where: { shopId, ...otherFilters },
  });
  ```
- **Strict Rule**: Always include `shopId` in `where` clauses (unless it's a super-admin route).

### Validation

- **Library**: `zod`
- **Location**: `src/schemas/*.schema.ts`
- **Usage**:
  ```typescript
  const parsed = MySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  ```

### Authentication & Authorization

- **Middleware**: `src/middleware/auth.ts`
- **Methods**:
  - `authenticateUser`: For end-customers (storefront).
  - `authenticateAdmin`: For shop owners.
- **Context**: `req.auth` contains `{ shopId, userId, ... }`.

### API Response Format

- **Success**: `res.status(200).json(data)`
- **Error**: `res.status(code).json({ error: message })`

## Email Template System

### Structure

- `src/emails/index.ts`: centralized email dispatch + settings/feature checks.
- `src/emails/templates/index.ts`: typed registry of template names and variable contracts.
- `src/emails/templates/*.templates.ts`: fallback HTML templates.
- `src/emails/components/EmailLayout.ts`: shared layout/theming helpers.
- `email_templates` table (shop-scoped): optional runtime subject/body overrides.

### How to Build a New Template

1. Create template vars interface + renderer in `src/emails/templates/*.templates.ts`.
2. Register template key in `src/emails/templates/index.ts`.
3. Trigger it through `sendUserEmail` or `sendEmailToAdmins` with `shopId` and template vars.
4. Add optional DB override row with matching `type` and `shopId`.

### Production-Only Sending Rule

- Keep outbound delivery production-only.
- `src/emails/index.ts` already short-circuits in non-production for user/admin sends.
- New feature emails should continue using these send helpers rather than direct transporter calls.

## Payment Webhook Modularization

### Pattern

- Keep gateway providers in `src/providers/*.providers.ts` thin: verify signature, normalize webhook payload, delegate.
- Centralize shared success/failure behavior in `src/services/payments/provider-webhook-handler.ts`.
- Reuse the same shared handler for both Paystack and Flutterwave webhook flows.

### Why This Matters

- Avoid duplicated order placement, status update, and email logic across providers.
- Make onboarding a new gateway mostly a provider-adapter task, not a business-logic rewrite.
- Ensure behavior parity for success/failure handling regardless of payment platform.

### Adding A New Gateway

1. Implement gateway-specific API/signature logic in a new provider file.
2. Map provider payload into the shared handler input contract.
3. Delegate success/failure to the shared payment webhook handler.
4. Keep outbound email behavior routed through existing email send helpers.

## 4. Feature Development Lifecycle

## Dynamic CORS And Internal Reseller Calls

- Public shop routes use `dynamicOrigin` in `src/config/cors.config.ts` and validate requests against registered shop domains (`shop.uid`) plus localhost development hosts.
- Reseller discovery and preview calls coming from core services should provide a `Host` header:
  - Global list requests should use `Host: localhost:3000`.
  - Source-store scoped requests should use `Host: <shop.uid>`.
- Internal service routes mounted under `/internal` use `openCors` and JWT auth middleware instead of domain filtering.

### Complete Implementation Checklist

Creating a new feature in shop-backend requires following these steps in order:

#### Step 1: Database Schema

Update `prisma/schema.prisma` with any new models or fields:

```typescript
model ShippingAccount {
  id                Int       @id @default(autoincrement())
  shopId            Int       @map("shop_id")
  shop              Shop      @relation(fields: [shopId], references: [id], onDelete: Cascade)
  provider          String    @map("provider_name") // fedex, ups, usps
  accountNumber     String    @map("account_number")
  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@unique([shopId, provider])
  @@map("shipping_accounts")
}
```

Run after schema changes:

```bash
npm run prisma:generate
npm run prisma:migrate
```

#### Step 2: Zod Validation Schema

Create or update schema in `src/schemas/shipping.schema.ts`:

```typescript
import { z } from "zod";

export const CreateShippingAccountSchema = z.object({
  provider: z.enum(["fedex", "ups", "usps"]),
  accountNumber: z.string().min(5).max(50),
  email: z.string().email(),
  apiKey: z.string().min(10),
});

export const ShippingAccountResponseSchema = z.object({
  id: z.number(),
  provider: z.string(),
  accountNumber: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export type CreateShippingAccountInput = z.infer<
  typeof CreateShippingAccountSchema
>;
export type ShippingAccountResponse = z.infer<
  typeof ShippingAccountResponseSchema
>;
```

#### Step 3: Rate Limiting

Apply rate limiting in `src/middleware/ratelimit/`:

1. **Create or use existing rate limiter** for the domain:

   ```typescript
   // src/middleware/ratelimit/shipping.ratelimit.ts
   import { rateLimit } from "express-rate-limit";
   import { devBypass } from "./utils";

   export const limitShippingCreate = devByPass(
     rateLimit({
       windowMs: 30 * 60 * 1000, // 30 minutes
       max: 5, // 5 accounts per 30 min
       message: "Too many shipping accounts created, try again later.",
       standardHeaders: true,
       legacyHeaders: false,
     }),
   );

   export const limitShippingUpdate = devByPass(
     rateLimit({
       windowMs: 10 * 60 * 1000, // 10 minutes
       max: 20, // 20 updates per 10 min
       message: "Too many updates, please slow down.",
     }),
   );

   export const limitShippingDelete = devByPass(
     rateLimit({
       windowMs: 60 * 60 * 1000, // 1 hour
       max: 3, // 3 deletions per hour
       message: "Too many deletions, try again later.",
     }),
   );
   ```

2. **Export from main rate limit index**:
   ```typescript
   // src/middleware/ratelimit/index.ts
   export * from "./shipping.ratelimit";
   ```

**Rate Limiting Best Practices**:

- Create operations: Strict (5-10 per 30 min)
- Update operations: Moderate (20-50 per 10 min)
- Delete operations: Very strict (3-10 per hour)
- Read operations: Generous (100+ per 5 min)
- Public endpoints: Stricter than authenticated endpoints

#### Step 4: Controller

Implement business logic in `src/controllers/shipping.controller.ts`:

```typescript
import { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { CreateShippingAccountSchema } from "../schemas/shipping.schema";

export async function createShippingAccount(req: Request, res: Response) {
  try {
    // 1. Validate input with Zod
    const parsed = CreateShippingAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    // 2. Extract auth context (always available after authenticateAdmin middleware)
    const { shopId } = req.auth;

    // 3. Check subscription (calls validpanel-backend)
    // This happens in middleware, so req.subscription is available
    const { subscription } = req;
    if (!subscription.plan.features.max_shipping_accounts) {
      return res.status(403).json({
        error: "Feature not available",
        message: "Upgrade to Premium to use automated shipping",
      });
    }

    // 4. Check account limit
    const existingAccounts = await prisma.shippingAccount.count({
      where: { shopId },
    });

    if (existingAccounts >= subscription.plan.features.max_shipping_accounts) {
      return res.status(403).json({
        error: "Account limit reached",
        message: `Maximum ${subscription.plan.features.max_shipping_accounts} shipping accounts allowed`,
      });
    }

    // 5. Check uniqueness within shop
    const existing = await prisma.shippingAccount.findFirst({
      where: {
        shopId,
        provider: parsed.data.provider,
      },
    });

    if (existing) {
      return res.status(409).json({
        error: "Account already exists",
        message: `A ${parsed.data.provider} account already exists`,
      });
    }

    // 6. Verify credentials with third-party API
    const isValid = await verifyShippingCredentials(
      parsed.data.provider,
      parsed.data.apiKey,
    );

    if (!isValid) {
      return res.status(400).json({
        error: "Invalid credentials",
        message: "Could not verify shipping provider credentials",
      });
    }

    // 7. Create database record
    const account = await prisma.shippingAccount.create({
      data: {
        shopId,
        provider: parsed.data.provider,
        accountNumber: parsed.data.accountNumber,
        // Store encrypted API key via environment-based encryption
        apiKey: encryptApiKey(parsed.data.apiKey),
        isActive: true,
      },
      select: {
        id: true,
        provider: true,
        accountNumber: true,
        isActive: true,
        createdAt: true,
      },
    });

    // 8. Return response
    return res.status(201).json({
      success: true,
      message: "Shipping account created successfully",
      data: account,
    });
  } catch (error) {
    console.error("Error creating shipping account:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Helper functions
async function verifyShippingCredentials(
  provider: string,
  apiKey: string,
): Promise<boolean> {
  // Call provider API to verify credentials
  try {
    // Example: call FedEx, UPS, or USPS API
    return true; // Replace with actual verification
  } catch {
    return false;
  }
}

function encryptApiKey(apiKey: string): string {
  // Use environment encryption (AWS KMS, etc.)
  return apiKey; // Replace with actual encryption
}
```

#### Step 5: Swagger/OpenAPI Documentation

Register API endpoint in `src/docs/paths/shipping.paths.ts`:

```typescript
import { registry } from "../components/registry";
import {
  CreateShippingAccountSchema,
  GetShipppingAccount,
} from "../../schemas/shipping.schema";
import {
  CreateShippingAccountResponse,
  ShippingAccountsListResponse,
} from "../responses/shipping.response";
import {
  BadRequest,
  Forbidden,
  Conflict,
  ServerError,
} from "../responses/common.response";

registry.registerPath({
  method: "post",
  path: "/api/admin/shipping/accounts",
  summary: "Create shipping account",
  description:
    "Create a new shipping provider account for automated fulfillment",
  tags: ["Shipping"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateShippingAccountSchema,
        },
      },
      description: "Shipping provider credentials",
      required: true,
    },
  },
  responses: {
    201: CreateShippingAccountResponse,
    400: BadRequest,
    403: Forbidden,
    409: Conflict,
    500: ServerError,
  },
});

// GET all shipping accounts
registry.registerPath({
  method: "get",
  path: "/api/admin/shipping/accounts",
  summary: "Get shipping accounts",
  tags: ["Shipping"],
  security: [{ CookieAuth: [] }],
  request: {
    query: GetShipppingAccount,
  },
  responses: {
    200: ShippingAccountsListResponse,
    400: BadRequest,
    500: ServerError,
  },
});
```

Create the response objects in `src/docs/responses/shipping.response.ts` and keep response schemas there (same pattern as `user.response.ts`, `admin.response.ts`, etc.).

Then import in `src/docs/swagger.ts`:

```typescript
import "./paths/shipping.paths";
```

#### Step 6: Middleware Chain in Route Definition

Register route in `src/routes/shipping.routes.ts`:

```typescript
import { Router } from "express";
import { authenticateAdmin } from "../middleware/auth";
import {
  limitShippingCreate,
  limitShippingUpdate,
  limitShippingDelete,
} from "../middleware/ratelimit";
import { requireActiveSubscription } from "../middleware/subscription-check";
import * as shippingController from "../controllers/shipping.controller";

const router = Router();

// Public read (minimal auth)
router.get("/providers", shippingController.getShippingProviders);

// Authenticated create (auth + subscription + rate limit + action)
router.post(
  "/accounts",
  authenticateAdmin, // 1. Verify user is authenticated admin
  requireActiveSubscription, // 2. Check subscription active (calls validpanel)
  limitShippingCreate, // 3. Rate limit: 5 per 30 min
  shippingController.createShippingAccount, // 4. Controller
);

// Authenticated update (auth + rate limit)
router.patch(
  "/accounts/:accountId",
  authenticateAdmin, // 1. Verify user
  limitShippingUpdate, // 2. Rate limit: 20 per 10 min
  shippingController.updateShippingAccount, // 3. Controller
);

// Authenticated delete (auth + strict rate limit)
router.delete(
  "/accounts/:accountId",
  authenticateAdmin, // 1. Verify user
  limitShippingDelete, // 2. Rate limit: 3 per hour
  shippingController.deleteShippingAccount, // 3. Controller
);

export default router;
```

In `src/app.ts`:

```typescript
import shippingRoutes from "./routes/shipping.routes";

app.use("/api/admin/shipping", cors(dynamicOrigin), shippingRoutes);
```

### Summary Checklist

- [ ] **Step 1**: Update `prisma/schema.prisma` and run `npm run prisma:generate`
- [ ] **Step 2**: Create Zod schema in `src/schemas/`
- [ ] **Step 3**: Create rate limiter in `src/middleware/ratelimit/` and export from `index.ts`
- [ ] **Step 4**: Implement controller with validation, checks, and error handling
- [ ] **Step 5**: Register Swagger paths in `src/docs/paths/`
- [ ] **Step 6**: Define routes with middleware chain (auth → subscription → rate limit → controller)
- [ ] **Step 7**: Update this doc if new patterns emerge

This lifecycle ensures that features are properly validated, rate-limited, documented, and tested.

## 5. Critical Constraints

- **Isolation**: Never leak data between shops.
- **Performance**: Use specific Prisma `select` fields when possible to avoid over-fetching.
- **Rate Limiting**: Always apply rate limits to public endpoints.
