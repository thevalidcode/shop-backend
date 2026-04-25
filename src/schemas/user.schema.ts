import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { UserRole, UserStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const UserSchema = z
  .object({
    id: z.coerce.number(),
    shopScopedId: z.number(),
    uid: z.string(),
    email: z.string().email(),
    fullName: z.string(),
    image: z.string().nullable(),
    username: z.string(),
    phone: z.string().nullable(),
    shopId: z.coerce.number(),
    status: z.nativeEnum(UserStatus),
    role: z.nativeEnum(UserRole),
  })
  .openapi("User");

export const UserPublicSchema = z
  .object({
    id: z.string(),
    shopScopedId: z.number(),
    image: z.string().nullable(),
    email: z.string().email(),
    phone: z.string().nullable(),
    username: z.string(),
    fullName: z.string(),
  })
  .openapi("UserPublic");

export const UserUpdateRequestSchema = z.object({
  uid: z.string().describe("User UID"),
  phone: z.string().optional().nullable().describe("User phone number"),
  username: z.string().describe("Username").optional(),
  fullName: z.string().describe("Full name").optional(),
  currency: z.string().length(3).optional(),
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
  fullName: z.string().describe("User full name"),
  phone: z.string().optional().nullable().describe("User phone number"),
  password: z.string().describe("User password"),
  shopId: z.number().min(1).describe("Shop ID to join"),
  ref: z.coerce.number().optional().describe("Optional referral ID"),
});

export const CreateUserResponseSchema = z.object({
  success: z.string(),
  user: z.object({
    id: z.number(),
    email: z.string(),
    username: z.string(),
    shopScopedId: z.number(),
  }),
  message: z.string(),
});

export const GoogleAuthRequestSchema = z
  .object({
    idToken: z.string().describe("Google OAuth ID token"),
    shopId: z.number().describe("Shop identifier to fetch/shop user"),
  })
  .openapi("GoogleAuthResponse");

export const tokenPayloadSchema = z.object({
  shopId: z.number(),
  uid: z.string(),
});

export const UserAuthSchema = z.object({
  shopId: z.coerce.number(),
  uid: z.string(),
  type: z.literal("user"),
  user: UserSchema,
});

export const VerifySessionCodeBodySchema = z.object({
  sessionCode: z.string().describe("Session code for authentication"),
  shopId: z.coerce.number().describe("Shop ID"),
});

export const DeleteUserSchema = z.object({ uid: z.string() });
export const DeleteUsersSchema = z.object({ uids: z.array(z.string()) });

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export const UpdateUserByAdminRequestSchema = UserUpdateRequestSchema.extend({
  uid: z.string(),
  email: z.string().email().optional(),
  status: z.nativeEnum(UserStatus).optional(),
  balanceAction: z.enum(["ADD", "REMOVE"]).optional(),
  balanceAdjustment: z.coerce.number().positive().optional(),
}).strict();
