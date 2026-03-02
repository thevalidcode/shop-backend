import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { ShopStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

// Convert features type to Zod schema
export const SubscriptionPlanFeaturesSchema = z.object({
  // Capacity limits
  stores: z.number(),
  products: z.number().nullable(),
  staff_accounts: z.number(),
  payment_gateways: z.number(),
  available_templates: z.number(),

  // Core capabilities
  analytics: z.boolean(),
  api_access: z.boolean(),
  ai_features: z.boolean(),
  priority_support: z.boolean(),

  // Shop customization
  custom_branding: z.boolean(),
  custom_domain: z.boolean(),
  free_ssl: z.boolean(),
  hide_platform_banner: z.boolean(),
  custom_templates: z.boolean(),

  // Product & order management
  unlimited_products: z.boolean(),
  social_store_order_sync: z.boolean(),
  social_store_service_sync: z.boolean(),

  // Communication features (store-level)
  store_email_notifications: z.boolean(),
  store_custom_emails: z.boolean(),
  store_newsletters: z.boolean(),

  // Shipping features
  max_shipping_accounts: z.number(),
});

export type SubscriptionPlanFeatures = z.infer<
  typeof SubscriptionPlanFeaturesSchema
>;

export const ShopDataSchema = z
  .object({
    storeId: z.number().describe("Unique identifier for the store"),
    features: SubscriptionPlanFeaturesSchema.describe(
      "Key‑value map of store features",
    ),
    status: z.nativeEnum(ShopStatus).describe("The status of the store"),
    timestamp: z.string().describe("Timestamp when the store was created"),
    name: z.string().describe("Name of the store"),
    description: z.string().describe("Description of the store"),
  })
  .openapi("Shop");

export const ShopGeneralDataRequestSchema = z.object({
  shopId: z.coerce.number().describe("Unique identifier for the shop"),
});

export const ShopGeneralDataResponseSchema = z
  .object({
    shopId: z.coerce.number(),
    logoUrl: z.string().url(),
    faviconUrl: z.string().url(),
    shopName: z.string(),
    showBanner: z.boolean(),
    onboardingCompleted: z.boolean(),
    shopDescription: z.string().optional(),
    defaultClientCurrency: z.string().length(3).toUpperCase(),

    // Shop Physical Address (for shipping origin)
    shopStreet: z.string().optional(),
    shopCity: z.string().optional(),
    shopState: z.string().optional(),
    shopPostalCode: z.string().optional(),
    shopCountry: z.string().optional(),
    shopPhone: z.string().optional(),

    // Social Accounts
    instagramUrl: z.string().optional(),
    xUrl: z.string().optional(),
    facebookUrl: z.string().optional(),
    youtubeUrl: z.string().optional(),
    tiktokUrl: z.string().optional(),
  })
  .strict()
  .openapi("Setting");

export const UpdateGeneralDataRequestSchema = z.object({
  logoUrl: z.string().url().optional().or(z.literal("")),
  faviconUrl: z.string().url().optional().or(z.literal("")),
  shopName: z.string().optional(),
  showBanner: z.boolean().optional(),
  shopDescription: z.string().optional(),
  defaultClientCurrency: z.string().length(3).toUpperCase().optional(),

  // Shop Physical Address (for shipping origin)
  shopStreet: z.string().optional(),
  shopCity: z.string().optional(),
  shopState: z.string().optional(),
  shopPostalCode: z.string().optional(),
  shopCountry: z.string().optional(),
  shopPhone: z.string().optional(),

  // Social Accounts
  instagramUrl: z.string().optional(),
  xUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
});

export const ExchangeRatesSchema = z
  .record(z.number())
  .describe("Key‑value map of currency codes to exchange rates")
  .openapi("ExchangeRates");

export const DesignStylesSchema = z
  .object({
    name: z.string().describe("Color name"),
    hex: z.string().describe("Color hex"),
    schema: z.object({
      [":root"]: z.record(z.string()).describe("Light mode variables"),
      [".dark"]: z.record(z.string()).describe("Dark mode variables"),
    }),
  })
  .openapi("DesignStyles");

export const UpdateStylesRequestSchema = z
  .object({
    name: z.string().describe("Color name"),
    hex: z.string().describe("Color hex"),
    schema: z.object({
      [":root"]: z.record(z.string()).describe("Light mode variables"),
      [".dark"]: z.record(z.string()).describe("Dark mode variables"),
    }),
  })
  .strict();

export const shopIdSchema = z.object({ shopId: z.coerce.number() });
