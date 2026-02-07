import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  Payment,
  PaymentStatus,
  PaymentGatewayPlatform,
} from "../../prisma/generated";
import { Decimal } from "@prisma/client/runtime/client";

extendZodWithOpenApi(z);

export const InitializePaymentSchema = z.object({
  platform: z.nativeEnum(PaymentGatewayPlatform),
  cartUid: z.string(),
  currency: z.string().length(3),
  redirectUrl: z.string().url(),
  billingInfoUid: z.string(),
  notes: z.string().optional(),
  shippingCost: z.number().optional(),
  shippingCurrency: z.string().length(3).optional(),
  selectedShippingRate: z.any().optional(),
});

export type CreatePaymentInput = z.infer<typeof InitializePaymentSchema>;

export const PaymentPublicSchema = z.object({
  currency: z.string().toUpperCase(),
  id: z.number(),
  amount: z.custom<Decimal>(),
  chargedAmount: z.custom<Decimal>(),
  createdAt: z.coerce.date(),
  status: z.nativeEnum(PaymentStatus),
  method: z.nativeEnum(PaymentGatewayPlatform),
  paymentGatewayUid: z.string(),
  shopId: z.number(),
  shopScopedId: z.number(),
});

export const PaymentSchema: z.ZodType<Payment> = PaymentPublicSchema.extend({
  userUid: z.string(),
  uid: z.string().uuid(),
}).openapi("Payment");
