import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const apiRequestLimiter = devBypass(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      error: "Too many API requests, please try again later.",
    },
  }),
);