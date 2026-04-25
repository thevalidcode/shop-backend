import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  PaymentGatewayStatus,
  PaymentGateway,
  PaymentGatewayPlatform,
} from "../../prisma/generated";

extendZodWithOpenApi(z);

export const PaymentGatewayAdminsSchema = z.object({
  id: z.number(),
  shopId: z.number(),
  shopScopedId: z.number(),
  uid: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  content: z.string().nullable(),
  position: z.number(),
  createdAt: z.coerce.date(),
  status: z.nativeEnum(PaymentGatewayStatus),
  platform: z.nativeEnum(PaymentGatewayPlatform),
  min: z.custom<any>(),
  max: z.custom<any>(),
  currency: z.string(),
  webhookUrl: z.string().nullable(),
  feePercent: z.number().nullable(),
});

export const PaymentGatewayUsersSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  content: z.string().optional(),
  min: z.number(),
  max: z.number(),
  currency: z.string(),
  position: z.number(),
  platform: z.nativeEnum(PaymentGatewayPlatform),
});

export const PaymentCreateRequestSchema = z
  .object({
    platform: z.nativeEnum(PaymentGatewayPlatform),
    name: z.string(),
    secretKey: z.string().optional(),
    description: z.string().optional(),
    content: z.string().optional(),
    feePercent: z.coerce.number().int().min(0).max(100).optional(),
    min: z.coerce.number().nonnegative(),
    max: z.coerce.number().positive(),
    currency: z.string().length(3).transform((v) => v.toUpperCase()),
  })
  .refine((data) => data.max >= data.min, {
    message: "Max amount must be greater than or equal to min amount",
    path: ["max"],
  });

export const PaymentUpdateRequestSchema = z
  .object({
  platform: z.nativeEnum(PaymentGatewayPlatform).optional(),
  uid: z.string(),
  name: z.string().optional(),
  secretKey: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  status: z.nativeEnum(PaymentGatewayStatus).optional(),
  feePercent: z.coerce.number().int().min(0).max(100).optional(),
  min: z.coerce.number().nonnegative().optional(),
  max: z.coerce.number().positive().optional(),
  currency: z.string().length(3).transform((v) => v.toUpperCase()).optional(),
  })
  .refine(
    (data) => {
      if (typeof data.min === "number" && typeof data.max === "number") {
        return data.max >= data.min;
      }
      return true;
    },
    {
      message: "Max amount must be greater than or equal to min amount",
      path: ["max"],
    },
  );

export const DeletePaymentGatewaySchema = z.object({
  uid: z.string(),
});

export const GetPaymentGatewayByIdSchema = z.object({
  uid: z.string(),
});
