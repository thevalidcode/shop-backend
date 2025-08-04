import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const UserSchema = z
  .object({
    id: z.coerce.number(),
    shopScopedId: z.number(),
    uid: z.string(),
    email: z.string().email(),
    username: z.string(),
    password: z.string(),
    status: z.string(),
    apiKey: z.string(),
    role: z.string(),
  })
  .openapi("User");

export const AuthSchema = z.object({
  shopId: z.coerce.number(),
  email: z.string().email(),
  uid: z.string(),
  apiKey: z.string(),
  role: z.string(),
  user: UserSchema,
});

export const UserPublicSchema = z
  .object({
    id: z.string(),
    shopScopedId: z.number(),
    email: z.string().email(),
    username: z.string(),
  })
  .openapi("UserPublic");

export const UserUpdateRequestSchema = z.object({
  uid: z.string().describe("User UID"),
  username: z.string().describe("Username"),
  fullName: z.string().describe("Full name"),
});

export const AuthenticateUserSchema = z.object({
  shopId: z.number().describe("Associated shop ID"),
  email: z.string().email().describe("User email"),
  password: z.string().describe("User password"),
});

export const AuthenticateUserResponseSchema = z.object({
  success: z.literal("Logged in successfully"),
  user: z.object({
    id: z.coerce.number().describe("User id"),
    shopScopedId: z.number().describe("Shop-specific user ID"),
    email: z.string().email().describe("User email"),
    username: z.string().describe("User username"),
  }),
});

export const CreateUserInputSchema = z.object({
  email: z.string().email().describe("User email"),
  username: z.string().describe("User username"),
  password: z.string().describe("User password"),
  shopDomain: z.string().min(1).describe("Shop domain to join"),
  ref: z.union([z.string(), z.number()]).optional().describe("Optional referral ID"),
});

export const CreateUserResponseSchema = z.object({
  success: z.string(),
  user: z.object({
    id: z.number(),
    email: z.string(),
    username: z.string(),
    shopDomain: z.string(),
    shopUrl: z.string(),
  }),
  message: z.string(),
});

export const AdminPublicSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  role: z.string(),
});

export const GoogleAuthRequestSchema = z
  .object({
    idToken: z.string().describe("Google OAuth ID token"),
    shopId: z.number().describe("Shop identifier to fetch/shop user"),
  })
  .openapi("GoogleAuthResponse");

export  const tokenPayloadSchema = z.object({
  email: z.string().email(),
  shopId: z.number(),
  apiKey: z.string(),
  role: z.enum(["admin", "user"]),
});