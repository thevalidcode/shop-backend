import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

const paymentPurposeSchema = z.enum(["ORDER", "WALLET_TOPUP"]);

export const FlutterwaveWebhookSchema = z.object({
  "event.type": z.string(),
  event: z.string(),
  data: z.object({
    status: z.string(),
    id: z.number(),
    tx_ref: z.string(),
    flw_ref: z.string(),
    amount: z.number(),
    currency: z.string(),
    charged_amount: z.number(),
    payment_type: z.string(),
    created_at: z.string(),
    customer: z.object({
      id: z.number(),
      name: z.string().nullable(),
      email: z.string().email(),
      phone_number: z.string().nullable(),
    }),
  }),
  meta_data: z
    .object({
      shopId: z.coerce.number(),
      purpose: paymentPurposeSchema,
      userUid: z.coerce.string(),
      txRef: z.coerce.string(),
      notes: z.coerce.string().optional().nullable(),
      shippingInfoUid: z.coerce.string().optional(),
      amount: z.coerce.number().optional(),
      currency: z.coerce.string().optional(),
    })
    .passthrough(),
});

export type FlutterwaveWebhookData = z.infer<typeof FlutterwaveWebhookSchema>;

export const PaystackWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    id: z.number(),
    amount: z.number(),
    currency: z.string(),
    status: z.string(),
    reference: z.string(),
    domain: z.string(),
    paid_at: z.string(),
    created_at: z.string(),
    channel: z.string(),
    metadata: z
      .object({
        shopId: z.coerce.number(),
        purpose: paymentPurposeSchema,
        userUid: z.coerce.string(),
        txRef: z.coerce.string(),
        notes: z.coerce.string().optional().nullable(),
        shippingInfoUid: z.coerce.string().optional(),
        amount: z.coerce.number().optional(),
        currency: z.coerce.string().optional(),
      })
      .passthrough(),
    customer: z.object({
      id: z.number(),
      first_name: z.string().nullable(),
      last_name: z.string().nullable(),
      email: z.string().email(),
    }),
  }),
});

export type PaystackWebhookData = z.infer<typeof PaystackWebhookSchema>["data"];
