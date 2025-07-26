import { z } from "zod";
export declare const ShopDataResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
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
        };
    };
};
export declare const CSrfTokenResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                csrfToken: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                csrfToken: string;
            }, {
                csrfToken: string;
            }>;
        };
    };
};
export declare const DesignStylesResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
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
        };
    };
};
export declare const SiteDataResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
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
        };
    };
};
export declare const ExchangeRatesResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodRecord<z.ZodString, z.ZodNumber>;
        };
    };
};
export declare const CurrentUserResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                username: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                username: string;
                id: string;
                email: string;
            }, {
                username: string;
                id: string;
                email: string;
            }>;
        };
    };
};
export declare const CurrentAdminResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                username: z.ZodString;
                role: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                username: string;
                id: string;
                email: string;
                role: string;
            }, {
                username: string;
                id: string;
                email: string;
                role: string;
            }>;
        };
    };
};
export declare const NotFound: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                error: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                error: string;
            }, {
                error: string;
            }>;
        };
    };
};
