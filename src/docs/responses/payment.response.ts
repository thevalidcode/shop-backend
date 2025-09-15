import { z } from "zod";
import {
  PaymentPublicSchema,
  PaymentSchema,
} from "../../schemas/payment.schema";

export const InitializedPaymentResponse = {
  description: "Payment initialization successful.",
  content: {
    "application/json": {
      schema: z.object({
        url: z.string().url(),
      }),
    },
  },
};

export const PaymentPublicListResponse = {
  description: "List of all user's payments.",
  content: {
    "application/json": {
      schema: z.array(PaymentPublicSchema),
    },
  },
};

export const PaymentListResponse = {
  description: "List of all payments.",
  content: {
    "application/json": {
      schema: z.array(PaymentSchema),
    },
  },
};
