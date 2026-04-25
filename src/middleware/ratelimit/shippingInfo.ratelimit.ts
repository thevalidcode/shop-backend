import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

/**
 * Rate limiter for shipping info viewing operations
 * Allows 100 requests per minute per IP
 */
export const shippingInfoRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many shipping info requests, please try again later." },
  })
);

/**
 * Rate limiter for shipping info modifications
 * Allows 40 modifications per minute
 */
export const shippingInfoModifyRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many shipping info modifications, please slow down." },
  })
);
