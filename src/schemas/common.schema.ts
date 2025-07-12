import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const ShopIdSchema = z.object({
  shop_id: z.coerce.number(),
});
