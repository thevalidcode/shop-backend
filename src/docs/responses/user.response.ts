import { z } from "zod";
import { UserSchema } from "../../schemas/user.schema";

export const LoginResponse = {
  description: "Login success response",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Logged in successfully"),
        role: z.string(),
        user: UserSchema,
      }),
    },
  },
};

export const CreateUserResponse = {
  description: "User created successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Created Successfully"),
        user: z.object({
          id: z.number(),
          c: z.number(),
          email: z.string().email(),
          username: z.string(),
        }),
      }),
    },
  },
};

export const GetUserResponse = {
  description: "User data retrieved",
  content: {
    "application/json": {
      schema: z.object({
        user: UserSchema,
      }),
    },
  },
};

export const UsersListResponse = {
  description: "List of all users",
  content: {
    "application/json": {
      schema: z.array(UserSchema),
    },
  },
};

export const UpdateUserResponse = {
  description: "User updated successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Successfully updated user"),
        user: UserSchema,
      }),
    },
  },
};

export const UpdateUserByAdminResponse = {
  description: "User updated by admin successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Successfully updated user"),
      }),
    },
  },
};

export const DeleteUserResponse = {
  description: "User deleted successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Deleted Successfully"),
      }),
    },
  },
};

export const VerifySessionResponse = {
  description: "Session verified successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("User authenticated successfully"),
        user: UserSchema,
      }),
    },
  },
};

export const ForgotPasswordResponse = {
  description: "Password reset email sent",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal(
          "A password reset link has been sent to your email."
        ),
      }),
    },
  },
};

export const ResetPasswordResponse = {
  description: "Password reset successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Password updated successfully."),
      }),
    },
  },
};
