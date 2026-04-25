import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  Payment,
  PaymentStatus,
  PaymentGatewayPlatform,
  PaymentPurpose,
} from "../../prisma/generated";
import { Decimal } from "@prisma/client/runtime/client";

extendZodWithOpenApi(z);

export const InitializePaymentSchema = z.object({
  platform: z.nativeEnum(PaymentGatewayPlatform),
  useBalance: z.boolean().optional().default(false),
  purpose: z.nativeEnum(PaymentPurpose).optional().default("ORDER"),
  cartUid: z.string(),
  currency: z.string().length(3),
  redirectUrl: z.string().url(),
  shippingInfoUid: z.string(),
  notes: z.string().optional(),
  shippingCost: z.number().optional(),
  shippingCurrency: z.string().length(3).optional(),
  selectedShippingRate: z.any().optional(),
});

export type CreatePaymentInput = z.infer<typeof InitializePaymentSchema>;

export const CreateWalletPaymentSchema = z.object({
  platform: z.nativeEnum(PaymentGatewayPlatform),
  amount: z.string(),
  currency: z.string().length(3),
  redirectUrl: z.string().url(),
});

export const UpdatePaymentStatusSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
  shippingInfoUid: z.string().uuid().optional(),
  notes: z.string().optional(),
  shippingCost: z.number().optional(),
  shippingCurrency: z.string().length(3).optional(),
  selectedShippingRate: z.any().optional(),
});

export const PaymentUidSchema = z.object({
  paymentUid: z.string().uuid(),
});

export const PaymentFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.nativeEnum(PaymentStatus).optional(),
  method: z.nativeEnum(PaymentGatewayPlatform).optional(),
  search: z.string().trim().min(1).max(200).optional(),
});

export type CreateWalletPaymentInput = z.infer<typeof CreateWalletPaymentSchema>;

export const PaymentPublicSchema = z.object({
  currency: z.string().toUpperCase(),
  id: z.number(),
  amount: z.custom<Decimal>(),
  chargedAmount: z.custom<Decimal>(),
  createdAt: z.coerce.date(),
  status: z.nativeEnum(PaymentStatus),
  purpose: z.nativeEnum(PaymentPurpose),
  method: z.nativeEnum(PaymentGatewayPlatform),
  paymentGatewayUid: z.string(),
  shopId: z.number(),
  shopScopedId: z.number(),
});

export const PaymentSchema: z.ZodType<Payment> = PaymentPublicSchema.extend({
  userUid: z.string(),
  uid: z.string().uuid(),
}).openapi("Payment");
