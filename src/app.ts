import express from "express";
import bodyParser from "body-parser";
import cors, { CorsOptions, CorsRequest } from "cors";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool, prisma } from "./config/db";
import { env } from "./config/env";
import cookieParser from "cookie-parser";
import path from "path";

// Routes
import userRouter from "./routes/user.routes";
import oauthRoutes from "./routes/auth.routes";
import storeRoutes from "./routes/shop.routes";
import blogRoutes from "./routes/blog.routes";
import faqRoutes from "./routes/faq.routes";
import productRoutes from "./routes/product.routes";
import adminRoutes from "./routes/admin.routes";
import categoryRoutes from "./routes/category.routes";
import orderRoutes from "./routes/order.routes";
import versionRouter from "./routes/version.routes";
import swaggerRouter from "./docs/swagger";

const app = express();

// --- Dynamic CORS Setup ---
let allowedOrigins: string[] = [];

// FIX: Export this function to be awaited at startup
export async function updateAllowedOrigins(): Promise<void> {
  try {
    const shops = await prisma.shop.findMany({
      where: { ssl: true },
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
    console.log("Allowed CORS origins updated.");
  } catch (error) {
    console.error("Failed to update allowed origins:", error);
  }
}

// Set an interval to refresh the origins list periodically
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

// --- Middleware ---
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/assets",
  express.static(path.join(__dirname, "..", "public", "assets"))
);

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
app.use("/api/v1/user", cors(dynamicCors), userRouter);
app.use("/api/v1/shop", cors(dynamicCors), storeRoutes);
app.use("/api/v1/blog", cors(dynamicCors), blogRoutes);
app.use("/api/v1/faq", cors(dynamicCors), faqRoutes);
app.use("/api/v1/product", cors(dynamicCors), productRoutes);
app.use("/api/v1/category", cors(dynamicCors), categoryRoutes);
app.use("/api/v1/order", cors(dynamicCors), orderRoutes);
app.use("/api/v1/version", cors(dynamicCors), versionRouter);

// Internal Routes
app.use("/admin", adminRoutes);
app.use("/api/auth/shop", oauthRoutes);

app.use(swaggerRouter);

export default app;