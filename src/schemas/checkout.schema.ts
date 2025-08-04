import { z } from "zod";

export const CreateOrderSchema = z.object({
  shippingAddress: z.string().min(10, "Shipping address is required."),
  billingAddress: z.string().min(10, "Billing address is required."),
  paymentMethod: z.string().min(1, "Payment method is required."),
});

export const PaystackWebhookSchema = z.object({
    event: z.string(),
    data: z.object({
      id: z.number(),
      domain: z.string(),
      status: z.string(),
      reference: z.string(),
      amount: z.number(),
      currency: z.string(),
      channel: z.string(),
      gateway_response: z.string(),
      paid_at: z.string().datetime(),
      created_at: z.string().datetime(),
      customer: z.object({
        id: z.number(),
        first_name: z.string().nullable(),
        last_name: z.string().nullable(),
        email: z.string().email(),
        customer_code: z.string(),
      }),
      authorization: z.object({
        authorization_code: z.string(),
        bin: z.string(),
        last4: z.string(),
        exp_month: z.string(),
        exp_year: z.string(),
        card_type: z.string(),
        bank: z.string(),
        country_code: z.string(),
      }),
      metadata: z.any().optional(),
    }),
  });