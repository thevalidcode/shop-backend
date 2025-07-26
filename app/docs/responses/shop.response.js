"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFound = exports.CurrentAdminResponse = exports.CurrentUserResponse = exports.ExchangeRatesResponse = exports.SiteDataResponse = exports.DesignStylesResponse = exports.CSrfTokenResponse = exports.ShopDataResponse = void 0;
const shop_schema_1 = require("../../schemas/shop.schema");
const user_schema_1 = require("../../schemas/user.schema");
const zod_1 = require("zod");
exports.ShopDataResponse = {
    description: "Shop Data lookup result",
    content: {
        "application/json": {
            schema: shop_schema_1.ShopDataSchema,
        },
    },
};
exports.CSrfTokenResponse = {
    description: "CSRF Token lookup result",
    content: {
        "application/json": {
            schema: zod_1.z.object({ csrfToken: zod_1.z.string() }),
        },
    },
};
exports.DesignStylesResponse = {
    description: "Design styles configuration",
    content: {
        "application/json": {
            schema: shop_schema_1.DesignStylesSchema,
        },
    },
};
exports.SiteDataResponse = {
    description: "General site data",
    content: {
        "application/json": {
            schema: shop_schema_1.SiteDataSchema,
        },
    },
};
exports.ExchangeRatesResponse = {
    description: "Latest currency exchange rates",
    content: {
        "application/json": {
            schema: shop_schema_1.ExchangeRatesSchema,
        },
    },
};
exports.CurrentUserResponse = {
    description: "Current user record",
    content: {
        "application/json": {
            schema: user_schema_1.UserPublicSchema,
        },
    },
};
exports.CurrentAdminResponse = {
    description: "Current admin record",
    content: {
        "application/json": {
            schema: user_schema_1.AdminPublicSchema,
        },
    },
};
exports.NotFound = {
    description: "Resource not found",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                error: zod_1.z.string().describe("Error message"),
            }),
        },
    },
};
