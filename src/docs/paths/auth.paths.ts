import { registry } from "../components/registry";
import { z } from "zod";
import {
  GoogleAuthResponse,
  InvalidGoogleAuthResponse,
  SessionVerifiedResponse,
  UserInvalidSessionResponse,
  InvalidSessionResponse,
} from "../responses/auth.response";
import { 
  AdminRegistrationSchema, 
  AdminRegistrationResponseSchema, 
  DomainCheckResponseSchema 
} from "../../schemas/admin.schema";
import { BadRequest, ServerError } from "../responses/common.response";

registry.registerPath({
  method: "get",
  path: "/google",
  summary: "Initiate Google OAuth Login",
  description:
    "Redirects the user to Google OAuth for authentication.\n\n" +
    "After a successful login, Google will redirect back to your backend with a temporary session code.\n\n" +
    "### 🔐 Flow Overview:\n" +
    "- Redirects user to Google login\n" +
    "- After successful auth, redirects to `redirect` with a short-lived `session_code`\n" +
    "- Frontend must exchange the session code for an access token by calling `/session/verify`\n\n" +
    "### 📥 Required Query Parameters:\n" +
    "- `redirect`: Full frontend URL to redirect to after Google login (must be a valid shop domain)\n" +
    "- `shopId`: Numeric shop ID initiating the login\n\n" +
    "### 🔁 Redirect Response:\n" +
    "- `session_code`: Temporary one-time-use code, valid for 5 minutes\n\n" +
    "Example redirect:\n" +
    "```http\n" +
    "https://your-frontend.com/login/callback?session_code=abc123\n" +
    "```",
  tags: ["Auth"],
  parameters: [
    {
      name: "redirect",
      in: "query",
      required: true,
      description: "Frontend URL to redirect to after successful Google login.",
      schema: { type: "string", format: "uri" },
    },
    {
      name: "shopId",
      in: "query",
      required: true,
      description: "Shop ID initiating the login process.",
      schema: { type: "integer" },
    },
  ],
  responses: {
    302: GoogleAuthResponse,
    400: InvalidGoogleAuthResponse,
  },
});

// Registration for POST /session/verify
registry.registerPath({
  method: "post",
  path: "/session/verify",
  summary: "Exchange Session Code for Auth Token",
  description:
    "This endpoint completes the login process after Google OAuth.\n\n" +
    "### 🔁 What It Does:\n" +
    "- Accepts a one-time `session_code`\n" +
    "- Verifies it, then issues an `auth_token` and `csrf_token` as HTTP cookies\n\n" +
    "### 🔐 Security:\n" +
    "- Cookies are sent with `HttpOnly`, `Secure`, and `SameSite=None`\n" +
    "- `csrf_token` must be included in a custom header (`X-CSRF-Token`) for subsequent authenticated requests\n\n" +
    "### ✅ On Success:\n" +
    "- Returns the role of the authenticated user (`user` or `admin`)\n" +
    "- Sets cookies for authentication",
  tags: ["Auth"],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: z.object({
            sessionCode: z.string().describe("One-time session code"),
          }),
        },
      },
    },
  },
  responses: {
    200: SessionVerifiedResponse,
    400: InvalidSessionResponse,
    404: UserInvalidSessionResponse,
  },
});

// NEW: Admin Registration
registry.registerPath({
  method: "post",
  path: "/admin/register",
  summary: "Register as Shop Owner (Create Shop and Admin Account)",
  description:
    "Complete registration endpoint for new shop owners.\n\n" +
    "### 🏪 What It Does:\n" +
    "- Creates a new shop with chosen domain\n" +
    "- Creates admin account for the shop owner\n" +
    "- Initializes shop settings and counters\n" +
    "- Issues authentication tokens for immediate login\n\n" +
    "### 🌐 Domain Requirements:\n" +
    "- 3-30 characters long\n" +
    "- Lowercase letters, numbers, and hyphens only\n" +
    "- Must be unique across the platform\n\n" +
    "### ✅ On Success:\n" +
    "- Returns shop info with unique URL\n" +
    "- Sets authentication cookies\n" +
    "- Provides next steps for shop setup",
  tags: ["Auth"],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: AdminRegistrationSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Shop and admin account created successfully",
      content: {
        "application/json": {
          schema: AdminRegistrationResponseSchema,
        },
      },
    },
    400: BadRequest,
    500: ServerError,
  },
});

// NEW: Domain Availability Check
registry.registerPath({
  method: "get",
  path: "/admin/check-domain/{domain}",
  summary: "Check Shop Domain Availability",
  description:
    "Check if a shop domain is available for registration.\n\n" +
    "### 🔍 What It Does:\n" +
    "- Validates domain format\n" +
    "- Checks if domain is already taken\n" +
    "- Returns availability status and suggested URL\n\n" +
    "### ✅ Use This Before Registration:\n" +
    "- Help users choose available domains\n" +
    "- Prevent registration failures\n" +
    "- Show preview of shop URL",
  tags: ["Auth"],
  parameters: [
    {
      name: "domain",
      in: "path",
      required: true,
      description: "Domain to check availability for",
      schema: { 
        type: "string",
        pattern: "^[a-z0-9-]+$",
        minLength: 3,
        maxLength: 30
      },
    },
  ],
  responses: {
    200: {
      description: "Domain availability check result",
      content: {
        "application/json": {
          schema: DomainCheckResponseSchema,
        },
      },
    },
    400: BadRequest,
    500: ServerError,
  },
});
