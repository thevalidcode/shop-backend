import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  PaymentMethod,
  PaymentGatewayStatus,
  PaymentGateway,
} from "../../prisma/generated";

extendZodWithOpenApi(z);

export const PaymentGatewayAdminsSchema: z.ZodType<PaymentGateway> = z
  .object({
    id: z.number(),
    shopId: z.number(),
    shopScopedId: z.number(),
    uid: z.string(),
    name: z.string(),
    image: z.string().url(),
    description: z.string(),
    position: z.number(),
    encryptedSecretKey: z.string(),
    iv: z.string(),
    signature: z.string(),
    createdAt: z.coerce.date(),
    status: z.nativeEnum(PaymentGatewayStatus),
    platform: z.nativeEnum(PaymentMethod),
  })
  .openapi("PaymentGateway");

export const PaymentGatewayUsersSchema = z.object({
  id: z.number(),
  name: z.string(),
  image: z.string().url(),
  description: z.string().optional(),
  min: z.number(),
  max: z.number(),
  position: z.number(),
  platform: z.nativeEnum(PaymentMethod),
});

export const PaymentCreateRequestSchema = z.object({
  platform: z.nativeEnum(PaymentMethod),
  name: z.string(),
  secretKey: z.string().optional(),
  description: z.string().optional(),
  image: z.string(),
});

export const PaymentUpdateRequestSchema = z.object({
  platform: z.nativeEnum(PaymentMethod),
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
