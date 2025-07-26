"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const csurf_1 = __importDefault(require("csurf"));
// Routes
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const oauth_routes_1 = __importDefault(require("./routes/oauth.routes"));
const shop_routes_1 = __importDefault(require("./routes/shop.routes"));
const blog_routes_1 = __importDefault(require("./routes/blog.routes"));
const faq_routes_1 = __importDefault(require("./routes/faq.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const version_routes_1 = __importDefault(require("./routes/version.routes"));
const crud_1 = require("./crud");
const swagger_1 = __importDefault(require("./docs/swagger"));
const app = (0, express_1.default)();
// --- Dynamic CORS Setup ---
let allowedOrigins = [];
async function updateAllowedOrigins() {
    const shops = await (0, crud_1.getDocs)("shops", null, {
        filter: { field: "ssl", operator: "===", value: true },
    });
    const domains = shops.map((shop) => shop.uid);
    allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:7070",
        ...domains.flatMap((domain) => [
            `https://${domain}`,
            `https://${domain}:7070`,
        ]),
    ];
}
updateAllowedOrigins();
setInterval(updateAllowedOrigins, 5 * 60 * 1000);
// Define CORS Middleware for all non-/admin routes
const dynamicCors = function (req, callback) {
    const origin = req.headers.origin;
    if (env_1.env.NODE_ENV === "development") {
        return callback(null, { origin: true, credentials: true });
    }
    if (!origin) {
        return callback(new Error("Origin header is required by CORS"), {
            origin: false,
        });
    }
    if (allowedOrigins.includes(origin)) {
        return callback(null, { origin: true, credentials: true });
    }
    return callback(new Error("Not allowed by CORS"), { origin: false });
};
// CSRF protection using cookies
const csrfProtection = (0, csurf_1.default)({
    cookie: {
        httpOnly: true,
        sameSite: "none",
        secure: env_1.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
});
// --- Middleware ---
app.use(body_parser_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/assets", express_1.default.static(path_1.default.join(__dirname, "..", "public", "assets")));
// --- Session ---
const pgSess = (0, connect_pg_simple_1.default)(express_session_1.default);
app.use((0, express_session_1.default)({
    store: new pgSess({
        pool: db_1.pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
    }),
    secret: env_1.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: env_1.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
}));
// --- Public Routes ---
app.use("/api/v1/user", (0, cors_1.default)(dynamicCors), csrfProtection, user_routes_1.default);
app.use("/api/v1/shop", (0, cors_1.default)(dynamicCors), csrfProtection, shop_routes_1.default);
app.use("/api/v1/blog", (0, cors_1.default)(dynamicCors), csrfProtection, blog_routes_1.default);
app.use("/api/v1/faq", (0, cors_1.default)(dynamicCors), csrfProtection, faq_routes_1.default);
app.use("/api/v1/product", (0, cors_1.default)(dynamicCors), csrfProtection, product_routes_1.default);
app.use("/api/v1/category", (0, cors_1.default)(dynamicCors), csrfProtection, category_routes_1.default);
app.use("/api/v1/order", (0, cors_1.default)(dynamicCors), csrfProtection, order_routes_1.default);
app.use("/api/v1/version", (0, cors_1.default)(dynamicCors), csrfProtection, version_routes_1.default);
// Internal Routes
app.use("/admin", admin_routes_1.default);
app.use("/api/auth/shop", oauth_routes_1.default);
app.use(swagger_1.default);
exports.default = app;
