"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignStylesSchema = exports.ExchangeRatesSchema = exports.SiteDataSchema = exports.ShopDataSchema = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
exports.ShopDataSchema = zod_1.z
    .object({
    shop_id: zod_1.z.number().describe("Unique identifier for the shop"),
    plan: zod_1.z.string().describe("The plan associated with the shop"),
    status: zod_1.z.enum(["active", "disabled"]).describe("The status of the shop"),
    timestamp: zod_1.z.string().describe("Timestamp when the shop was created"),
})
    .openapi("ShopData");
exports.SiteDataSchema = zod_1.z
    .object({
    logo_url: zod_1.z.string().url().describe("Logo URL for the site"),
    title: zod_1.z.string().describe("Site title"),
    description: zod_1.z.string().describe("Site description"),
})
    .openapi("SiteData");
exports.ExchangeRatesSchema = zod_1.z
    .record(zod_1.z.number())
    .describe("Key‑value map of currency codes to exchange rates")
    .openapi("ExchangeRates");
exports.DesignStylesSchema = zod_1.z
    .object({
    id: zod_1.z.number().describe("Style ID"),
    title: zod_1.z.string().describe("Design title"),
    hex: zod_1.z.string().describe("Color hex"),
    schema: zod_1.z.object({
        [":root"]: zod_1.z.record(zod_1.z.string()).describe("Light mode variables"),
        [".dark"]: zod_1.z.record(zod_1.z.string()).describe("Dark mode variables"),
    }),
})
    .openapi("DesignStyles");
