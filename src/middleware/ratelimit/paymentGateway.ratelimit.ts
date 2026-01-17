import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

/**
 * Rate limiter for payment gateway viewing operations
 * Allows 100 requests per minute per IP
 */
export const paymentGatewayRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many payment gateway requests, please try again later." },
  })
);

/**
 * Rate limiter for payment gateway modifications (admin)
 * Allows 30 modifications per minute
 */
export const paymentGatewayModifyRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many payment gateway modifications, please slow down." },
  })
);
