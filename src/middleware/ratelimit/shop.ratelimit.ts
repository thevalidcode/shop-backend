import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

/**
 * Rate limiter for shop information viewing
 * Allows 150 requests per minute per IP
 */
export const shopRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many shop requests, please try again later." },
  })
);

/**
 * Rate limiter for shop modifications (admin)
 * Allows 30 modifications per minute
 */
export const shopModifyRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many shop modifications, please slow down." },
  })
);
