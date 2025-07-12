import express from "express";
import bodyParser from "body-parser";
import cors, { CorsOptions, CorsRequest } from "cors";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./config/db";
import { env } from "./config/env";
import cookieParser from "cookie-parser";
import path from "path";
import csurf from "csurf";

// Routes
import userRouter from "./routes/user";
import oauthRoutes from "./routes/oauth";
import storeRoutes from "./routes/shop";
import blogRoutes from "./routes/blog";
import faqRoutes from "./routes/faq";
import productRoutes from "./routes/product";
import adminRoutes from "./routes/admin";
import categoryRoutes from "./routes/category";
import orderRoutes from "./routes/order";
import versionRouter from "./routes/version";
import { getDocs } from "./crud";
import swaggerRouter from "./docs/swagger";

const app = express();

// --- Dynamic CORS Setup ---
let allowedOrigins: string[] = [];

async function updateAllowedOrigins(): Promise<void> {
  const shops = await getDocs("shops", null, {
    filter: { field: "ssl", operator: "===", value: true },
  });

  const domains = shops.map((shop: any) => shop.uid);
  allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:7070",
    ...domains.flatMap((domain: string) => [
      `https://${domain}`,
      `https://${domain}:7070`,
    ]),
  ];
}

updateAllowedOrigins();
setInterval(updateAllowedOrigins, 5 * 60 * 1000);

// Define CORS Middleware for all non-/admin routes
const dynamicCors = function (
  req: CorsRequest,
  callback: (err: Error | null, options?: CorsOptions) => void
) {
  const origin = req.headers.origin;

  if (env.NODE_ENV === "development") {
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
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    sameSite: "none",
    secure: env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});

// --- Middleware ---
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/assets", express.static(path.join(__dirname, "public", "assets")));

// --- Session ---
const pgSess = pgSession(session);

app.use(
  session({
    store: new pgSess({
      pool: pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// --- Public Routes ---
app.use("/user", cors(dynamicCors), csrfProtection, userRouter);
app.use("/shop", cors(dynamicCors), csrfProtection, storeRoutes);
app.use("/blog", cors(dynamicCors), csrfProtection, blogRoutes);
app.use("/faq", cors(dynamicCors), csrfProtection, faqRoutes);
app.use("/product", cors(dynamicCors), csrfProtection, productRoutes);
app.use("/category", cors(dynamicCors), csrfProtection, categoryRoutes);
app.use("/order", cors(dynamicCors), csrfProtection, orderRoutes);
app.use("/version", cors(dynamicCors), csrfProtection, versionRouter);

// Internal Routes
app.use("/admin", adminRoutes);
app.use("/api/auth/shop", oauthRoutes);

app.use(swaggerRouter);

export default app;
