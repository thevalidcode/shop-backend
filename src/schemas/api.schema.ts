import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { PaymentGatewayPlatform } from "../../prisma/generated";

extendZodWithOpenApi(z);

const apiKeySchema = z.string().uuid();

export const ApiProductsActionSchema = z.object({
  action: z.literal("products"),
  key: apiKeySchema,
});

export const ApiCreateOrderActionSchema = z.object({
  action: z.literal("create"),
  key: apiKeySchema,
  platform: z.nativeEnum(PaymentGatewayPlatform).optional(),
  currency: z.string().length(3).optional(),
  cartUid: z.string().uuid(),
  shippingInfoUid: z.string().uuid(),
  notes: z.string().optional(),
  selectedShippingRate: z.any().optional(),
  useBalance: z.boolean().optional(),
});

export const ApiCartActionSchema = z.object({
  action: z.literal("cart"),
  key: apiKeySchema,
  items: z
    .array(
      z.object({
        productUid: z.string().uuid(),
        quantity: z.number().int().min(1).max(1000),
      }),
    )
    .optional(),
});

export const ApiShippingQuoteActionSchema = z.object({
  action: z.literal("shipping_quote"),
  key: apiKeySchema,
  cartUid: z.string().uuid(),
  shippingInfoUid: z.string().uuid(),
  platform: z.enum(["SENDBOX", "SHIPPO"]).optional(),
});

export const ApiShippingMethodsActionSchema = z.object({
  action: z.literal("shipping_methods"),
  key: apiKeySchema,
});

export const ApiShippingInfoActionSchema = z.object({
  action: z.literal("shipping_info"),
  key: apiKeySchema,
  operation: z.enum(["list", "delete", "set_default"]).optional(),
  shippingInfoUid: z.string().uuid().optional(),
});

export const ApiCreateShippingInfoActionSchema = z.object({
  action: z.literal("create_shipping_info"),
  key: apiKeySchema,
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  isDefault: z.boolean().optional(),
});

export const ApiOrdersActionSchema = z.object({
  action: z.literal("orders"),
  key: apiKeySchema,
  orderUid: z.string().uuid().optional(),
});

export const ApiBalanceActionSchema = z.object({
  action: z.literal("balance"),
  key: apiKeySchema,
});

export const ApiRefundActionSchema = z.object({
  action: z.literal("refund"),
  key: apiKeySchema,
  orderUid: z.string().uuid(),
  reason: z.string().min(10).max(1000),
});

export const ApiCancelActionSchema = z.object({
  action: z.literal("cancel"),
  key: apiKeySchema,
  orderUid: z.string().uuid(),
});

export const ApiActionSchema = z.discriminatedUnion("action", [
  ApiProductsActionSchema,
  ApiCreateOrderActionSchema,
  ApiCartActionSchema,
  ApiShippingQuoteActionSchema,
  ApiShippingMethodsActionSchema,
  ApiShippingInfoActionSchema,
  ApiCreateShippingInfoActionSchema,
  ApiOrdersActionSchema,
  ApiBalanceActionSchema,
  ApiRefundActionSchema,
  ApiCancelActionSchema,
]);

export type ApiActionInput = z.infer<typeof ApiActionSchema>;