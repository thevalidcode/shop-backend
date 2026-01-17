import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

/**
 * Rate limiter for webhook endpoints
 * Allows 300 requests per minute per IP
 * Webhooks can be frequent from payment providers
 */
export const webhookRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many webhook requests, please try again later." },
  })
);
