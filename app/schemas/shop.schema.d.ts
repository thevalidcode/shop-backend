import { z } from "zod";
export declare const ShopDataSchema: z.ZodObject<{
    shop_id: z.ZodNumber;
    plan: z.ZodString;
    status: z.ZodEnum<["active", "disabled"]>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    shop_id: number;
    status: "active" | "disabled";
    timestamp: string;
    plan: string;
}, {
    shop_id: number;
    status: "active" | "disabled";
    timestamp: string;
    plan: string;
}>;
export declare const SiteDataSchema: z.ZodObject<{
    logo_url: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    title: string;
    logo_url: string;
}, {
    description: string;
    title: string;
    logo_url: string;
}>;
export declare const ExchangeRatesSchema: z.ZodRecord<z.ZodString, z.ZodNumber>;
export declare const DesignStylesSchema: z.ZodObject<{
    id: z.ZodNumber;
    title: z.ZodString;
    hex: z.ZodString;
    schema: z.ZodObject<{
        ":root": z.ZodRecord<z.ZodString, z.ZodString>;
        ".dark": z.ZodRecord<z.ZodString, z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ":root": Record<string, string>;
        ".dark": Record<string, string>;
    }, {
        ":root": Record<string, string>;
        ".dark": Record<string, string>;
    }>;
}, "strip", z.ZodTypeAny, {
    id: number;
    title: string;
    schema: {
        ":root": Record<string, string>;
        ".dark": Record<string, string>;
    };
    hex: string;
}, {
    id: number;
    title: string;
    schema: {
        ":root": Record<string, string>;
        ".dark": Record<string, string>;
    };
    hex: string;
}>;
