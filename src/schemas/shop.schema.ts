import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const ShopDataSchema = z
  .object({
    shopId: z.number().describe("Unique identifier for the shop"),
    plan: z.string().describe("The plan associated with the shop"),
    status: z.enum(["active", "disabled"]).describe("The status of the shop"),
    timestamp: z.string().describe("Timestamp when the shop was created"),
  })
  .openapi("ShopData");

export const SiteDataSchema = z
  .object({
    logoUrl: z.string().url().describe("Logo URL for the site"),
    title: z.string().describe("Site title"),
    description: z.string().describe("Site description"),
  })
  .openapi("SiteData");

export const ExchangeRatesSchema = z
  .record(z.number())
  .describe("Key‑value map of currency codes to exchange rates")
  .openapi("ExchangeRates");

export const DesignStylesSchema = z
  .object({
    id: z.number().describe("Style ID"),
    title: z.string().describe("Design title"),
    hex: z.string().describe("Color hex"),
    schema: z.object({
      [":root"]: z.record(z.string()).describe("Light mode variables"),
      [".dark"]: z.record(z.string()).describe("Dark mode variables"),
    }),
  })
  .openapi("DesignStyles");

  export const CreateContactMessageSchema = z.object({
    name: z.string().min(2, "Name is required."),
    email: z.string().email("Invalid email address."),
    phone: z.string().optional(),
    message: z.string().min(10, "Message must be at least 10 characters long."),
    shopId: z.number().int(),
  })
  .openapi("CreateContactMessage");

  export const UpdateGeneralSettingsSchema = z.object({
    title: z.string().min(1).optional(),
    logoUrl: z.string().url().optional(),
    faviconUrl: z.string().url().optional(),
    defaultClientCurrency: z.string().length(3).optional(),
  }).partial();
  
  export const UpdateDesignSettingsSchema = z.object({
    title: z.string().min(1),
    hex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color format."),
    schema: z.object({
      ":root": z.record(z.string()),
      ".dark": z.record(z.string()),
    }),
  }).partial();

  // NEW: Shop Discovery Schemas
  export const ShopDiscoverySchema = z.object({
    shopId: z.number(),
    domain: z.string(),
    plan: z.string(),
    timestamp: z.string(),
    settings: z.object({
      title: z.string(),
      logoUrl: z.string().nullable(),
      defaultClientCurrency: z.string().nullable(),
    }).nullable(),
  });

  export const ShopsListResponseSchema = z.array(ShopDiscoverySchema);

  export const ShopInfoResponseSchema = z.object({
    shopId: z.number(),
    uid: z.string(),
    status: z.string(),
    plan: z.string(),
    ssl: z.boolean(),
    settings: z.object({
      title: z.string(),
      logoUrl: z.string().nullable(),
      faviconUrl: z.string().nullable(),
      defaultClientCurrency: z.string().nullable(),
    }).nullable(),
  });
