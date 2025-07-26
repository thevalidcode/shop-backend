"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
const index_paths_1 = require("./paths/index.paths");
const version_1 = require("../version");
const swaggerRouter = (0, express_1.Router)();
function isAdmin(req, res, next) {
    if (req.session && req.session.isAdmin)
        return next();
    res.status(401).send("Unauthorized. Admin login required.");
}
const generator = new zod_to_openapi_1.OpenApiGeneratorV3(index_paths_1.registry.definitions);
const openApiDocument = generator.generateDocument({
    openapi: "3.0.0",
    info: {
        title: "Valid Panel - Shop API Documentation",
        version: version_1.API_VERSION,
        description: "Comprehensive API documentation for the Shop feature of Valid Panel. This includes detailed endpoints for user authentication, product ordering, referrals, and shop management for both users and admins.\n\nAll API requests must include a valid `Origin` header. Requests without an `Origin`, or with an unregistered one, will result in a CORS error. The `Origin` must match a registered shop domain.\nAlready registered and allowed Origins include:\n- http://localhost:3000\n- http://localhost:7030\n- https://validpanel.com\n\nWe recommend using Postman for testing especially if it's a `GET` request. Ensure your requests simulate a browser-like environment by setting a valid `Origin` header to one of the domains listed above.",
        contact: {
            name: "Valid Code",
            url: "https://linkedin.com/in/thevalidcode",
            email: "thevalidcode@gmail.com",
        },
    },
    servers: [
        {
            url: "https://validpanel.com:7030/api/v1",
            description: "Public testing server (use this to test endpoints)",
        },
        {
            url: "https://auth.validpanel.com/api/auth/shop",
            description: "Public server (use this for auth endpoints)",
        },
        {
            url: "https://{domain}:7030",
            description: "Custom shop domain (replace `{domain}` with your own)",
            variables: {
                domain: {
                    default: "yourdomain.com",
                    description: "Your custom shop domain (e.g. `myreseller.com`)",
                },
            },
        },
        {
            url: "http://localhost:7030",
            description: "Local development server",
        },
    ],
});
swaggerRouter.use("/admin/docs", isAdmin, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openApiDocument, {
    customCssUrl: "/assets/swagger-custom.css",
    customfavIcon: "/assets/validpanel-removedbg.png",
    customSiteTitle: "Shop API Docs",
}));
exports.default = swaggerRouter;
