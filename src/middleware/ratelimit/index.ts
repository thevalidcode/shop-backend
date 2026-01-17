import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

// Legacy rate limiters (keep for backward compatibility)
export const apiLimiter = devBypass(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // Max requests per IP
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    message: {
      status: 429,
      error: "Too many requests, please try again later.",
    },
  })
);

export const authLimiter = devBypass(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      error: "Too many authentication attempts, please try again later.",
    },
  })
);

export const strictLimiter = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      error: "Rate limit exceeded. Please slow down.",
    },
  })
);

export const checkoutLimiter = devBypass(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Max 50 checkout attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      error: "Too many checkout attempts, please try again later.",
    },
  })
);

export const paymentLimiter = devBypass(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Max 30 payment initiations per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      error: "Too many payment requests, please try again later.",
    },
  })
);

// Export all specific rate limiters
export * from "./auth.ratelimit";
export * from "./admin.ratelimit";
export * from "./user.ratelimit";
export * from "./product.ratelimit";
export * from "./cart.ratelimit";
export * from "./order.ratelimit";
export * from "./shop.ratelimit";
export * from "./blog.ratelimit";
export * from "./faq.ratelimit";
export * from "./category.ratelimit";
export * from "./payment.ratelimit";
export * from "./paymentGateway.ratelimit";
export * from "./transaction.ratelimit";
export * from "./billingInfo.ratelimit";
export * from "./rate.ratelimit";
export * from "./support.ratelimit";
export * from "./webhook.ratelimit";

