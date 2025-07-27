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
