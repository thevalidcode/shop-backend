import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const ShopIdSchema = z.object({
  shopId: z.coerce.number(),
});

export const UidSchema = z.object({
  uid: z.string(),
});

export const IdSchema = z.object({
  id: z.number(),
});
