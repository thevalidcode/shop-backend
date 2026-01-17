import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

/**
 * Rate limiter for FAQ viewing operations
 * Allows 150 requests per minute per IP
 */
export const faqRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many FAQ requests, please try again later." },
  })
);

/**
 * Rate limiter for FAQ modifications (admin)
 * Allows 40 modifications per minute
 */
export const faqModifyRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many FAQ modifications, please slow down." },
  })
);
