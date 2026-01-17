import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { AdminSchema } from "../../schemas/admin.schema";

extendZodWithOpenApi(z);

export const AdminLoginResponseSchema = z
  .object({
    success: z.literal("Logged in successfully"),
    role: z.string(),
    admin: AdminSchema,
  })
  .openapi("AdminLoginResponse");

export const AdminUpdateResponseSchema = z
  .object({
    success: z.literal("Successfully updated admin"),
    admin: AdminSchema,
  })
  .openapi("AdminUpdateResponse");

export const OnboardingCompleteResponseSchema = z
  .object({
    success: z.literal("Onboarding completed"),
    admin: AdminSchema,
  })
  .openapi("OnboardingCompleteResponse");

export const ForgotPasswordResponseSchema = z
  .object({
    success: z.literal("A password reset link has been sent to your email."),
  })
  .openapi("ForgotPasswordResponse");

export const ResetPasswordResponseSchema = z
  .object({
    success: z.literal("Password updated successfully."),
  })
  .openapi("ResetPasswordResponse");

export const VerifySessionResponseSchema = z
  .object({
    success: z.literal("Admin authenticated successfully"),
    admin: AdminSchema,
  })
  .openapi("VerifySessionResponse");
