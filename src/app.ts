import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import { env } from "./config/env.config";
import cookieParser from "cookie-parser";
import path from "path";
import { dynamicOrigin, openCors } from "./config/cors.config";
import PrismaSessionStore from "./utils/PrismaSessionStore";

// Routes
import swaggerRouter from "./docs/swagger";
import userRouter from "./routes/user.routes";
import oauthRoutes from "./routes/auth.routes";
import shopRoutes from "./routes/shop.routes";
import blogRoutes from "./routes/blog.routes";
import faqRoutes from "./routes/faq.routes";
import productRoutes from "./routes/product.routes";
import adminRoutes from "./routes/admin.routes";
import categoryRoutes from "./routes/category.routes";
import orderRoutes from "./routes/order.routes";
import fileRoutes from "./routes/files.routes";
import versionRouter from "./routes/version.routes";
import paymentRoutes from "./routes/payment.routes";
import internalRoutes from "./routes/internal.routes";
import webhookRoutes from "./routes/webhook.routes";
import transactionRoutes from "./routes/transaction.routes";
import paymentGatewayRoutes from "./routes/paymentGateway.routes";
import ratesRoutes from "./routes/rate.routes";
import billingInfoRoutes from "./routes/billingInfo.routes";
import supportRoutes from "./routes/support.routes";
import cartRoutes from "./routes/cart.routes";
import pageRoutes from "./routes/page.routes";
import statisticsRoutes from "./routes/statistics.routes";
import reviewRoutes from "./routes/review.routes";
import shippingRoutes from "./routes/shipping.routes";
import shippingWebhookRoutes from "./routes/shipping.webhook.routes";

const app = express();

// --- Middleware ---
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/assets",
  express.static(path.join(__dirname, "..", "public", "assets")),
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
  }),
);

// --- Public Routes ---
app.use("/v1/users", cors(dynamicOrigin), userRouter);
app.use("/v1/shops", cors(dynamicOrigin), shopRoutes);
app.use("/v1/blogs", cors(dynamicOrigin), blogRoutes);
app.use("/v1/faqs", cors(dynamicOrigin), faqRoutes);
app.use("/v1/products", cors(dynamicOrigin), productRoutes);
app.use("/v1/categories", cors(dynamicOrigin), categoryRoutes);
app.use("/v1/cart", cors(dynamicOrigin), cartRoutes);
app.use("/v1/orders", cors(dynamicOrigin), orderRoutes);
app.use("/v1/files", cors(dynamicOrigin), fileRoutes);
app.use("/v1/version", cors(dynamicOrigin), versionRouter);
app.use("/v1/payments", cors(dynamicOrigin), paymentRoutes);
app.use("/v1/admins", cors(dynamicOrigin), adminRoutes);
app.use("/v1/transactions", cors(dynamicOrigin), transactionRoutes);
app.use("/v1/payment-gateways", cors(dynamicOrigin), paymentGatewayRoutes);
app.use("/v1/rates", cors(dynamicOrigin), ratesRoutes);
app.use("/v1/billing-info", cors(dynamicOrigin), billingInfoRoutes);
app.use("/v1/supports", cors(dynamicOrigin), supportRoutes);
app.use("/v1/pages", cors(dynamicOrigin), pageRoutes);
app.use("/v1/statistics", cors(dynamicOrigin), statisticsRoutes);
app.use("/v1/reviews", cors(dynamicOrigin), reviewRoutes);
app.use("/v1/shipping", cors(dynamicOrigin), shippingRoutes);

// Webhook Routes for payment gateways
app.use("/v1/webhooks", openCors, webhookRoutes);

// Shipping Webhook Routes
app.use("/v1/webhooks/shipping", openCors, shippingWebhookRoutes);

// Internal Route for service-to-service communication (no auth, but CORS enabled for internal services)
app.use("/internal", openCors, internalRoutes);

app.use("/swagger", openCors, swaggerRouter);

// Auth Routes (this is for the auth.validpanel.com domain to handle OAuth)
app.use("/api/auth/shop", openCors, oauthRoutes);

export default app;
