import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "../../prisma/generated";
import { Decimal } from "@prisma/client/runtime/client";

extendZodWithOpenApi(z);

export const TransactionPublicSchema = z.object({
  currency: z.string().toUpperCase(),
  description: z.string(),
  amount: z.custom<Decimal>(),
  id: z.number(),
  shopId: z.number(),
  shopScopedId: z.number(),
  type: z.nativeEnum(TransactionType),
  status: z.nativeEnum(TransactionStatus),
  timestamp: z.coerce.date(),
});

export const TransactionSchema: z.ZodType<Transaction> =
  TransactionPublicSchema.extend({
    userUid: z.string().uuid(),
    uid: z.string().uuid(),
  }).openapi("Transaction");
