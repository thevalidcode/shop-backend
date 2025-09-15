import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Payment, PaymentMethod, PaymentStatus } from "../../prisma/generated";
import { Decimal } from "@prisma/client/runtime/library";

extendZodWithOpenApi(z);

export const InitializePaymentSchema = z.object({
  platform: z.nativeEnum(PaymentMethod),
  orderUid: z.string(),
  currency: z.string().length(3),
  redirect_url: z.string().url(),
});

export type CreatePaymentInput = z.infer<typeof InitializePaymentSchema>;

export const PaymentPublicSchema = z.object({
  currency: z.string().toUpperCase(),
  id: z.number(),
  amount: z.custom<Decimal>(),
  chargedAmount: z.custom<Decimal>(),
  createdAt: z.coerce.date(),
  status: z.nativeEnum(PaymentStatus),
  method: z.nativeEnum(PaymentMethod),
  shopId: z.number(),
  shopScopedId: z.number(),
});

export const PaymentSchema: z.ZodType<Payment> = PaymentPublicSchema.extend({
  userUid: z.string(),
  uid: z.string().uuid(),
}).openapi("Payment");
