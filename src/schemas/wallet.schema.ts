import { z } from "zod";

export const WalletBalanceResponseSchema = z.object({
  balance: z.number(),
  currency: z.string().length(3),
});

export const WalletTopupSchema = z.object({
  amount: z.number().positive(),
  note: z.string().max(250).optional(),
});

export type WalletTopupInput = z.infer<typeof WalletTopupSchema>;
