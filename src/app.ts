import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import { env } from "./config/env.config";
import cookieParser from "cookie-parser";
import path from "path";
import { dynamicCors, updateAllowedOrigins } from "./config/cors.config";
import PrismaSessionStore from "./utils/PrismaSessionStore";

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
import cartRoutes from "./routes/cart.routes";
import checkoutRoutes from "./routes/checkout.routes";
import paymentRoutes from "./routes/payment.routes";
import swaggerRouter from "./docs/swagger";

const app = express();

// Set an interval to refresh the origins list periodically
setInterval(updateAllowedOrigins, 5 * 60 * 1000);

// --- Middleware ---
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/assets",
  express.static(path.join(__dirname, "..", "public", "assets"))
);
app.set("trust proxy", 1);

app.use(
  session({
    store: new PrismaSessionStore(),
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
app.use("/api/v1/cart", cors(dynamicCors), cartRoutes);
app.use("/api/v1/payment", cors(dynamicCors), paymentRoutes);
app.use("/api/v1/checkout", cors(dynamicCors), checkoutRoutes);
app.use("/api/v1/admin", cors(dynamicCors), adminRoutes);

// Internal Routes
app.use("/swagger", swaggerRouter);
app.use("/api/auth/shop", oauthRoutes);

export default app;
