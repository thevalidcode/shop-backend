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
  position: z.number(),
  createdAt: z.coerce.date(),
  status: z.nativeEnum(PaymentGatewayStatus),
  platform: z.nativeEnum(PaymentGatewayPlatform),
  min: z.custom<any>(),
  max: z.custom<any>(),
  webhookUrl: z.string().nullable(),
  feePercent: z.number().nullable(),
});

export const PaymentGatewayUsersSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  min: z.number(),
  max: z.number(),
  position: z.number(),
  platform: z.nativeEnum(PaymentGatewayPlatform),
});

export const PaymentCreateRequestSchema = z.object({
  platform: z.nativeEnum(PaymentGatewayPlatform),
  name: z.string(),
  secretKey: z.string().optional(),
  description: z.string().optional(),
});

export const PaymentUpdateRequestSchema = z.object({
  platform: z.nativeEnum(PaymentGatewayPlatform),
  uid: z.string(),
  name: z.string(),
  secretKey: z.string().optional(),
  description: z.string().optional(),
  image: z.string(),
});

export const DeletePaymentGatewaySchema = z.object({
  uid: z.string(),
});

export const GetPaymentGatewayByIdSchema = z.object({
  uid: z.string(),
});
