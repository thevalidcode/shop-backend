import express from "express";
import * as admins from "../controllers/admin.controllers";
import { authenticateAdmin } from "../middleware/auth";
import { adminRateLimit, adminModifyRateLimit } from "../middleware/ratelimit";
const router = express.Router();

router.post("/me", adminRateLimit, admins.authenticateAdmin);
router.patch("/", authenticateAdmin, adminModifyRateLimit, admins.updateAdmin);
router.post("/verify-session", adminRateLimit, admins.verifySession);
router.put(
  "/onboarding-completed",
  authenticateAdmin,
  adminModifyRateLimit,
  admins.completeOnboarding
);
router.post("/forgot-password", adminModifyRateLimit, admins.forgotPasswordAdmin);
router.post("/reset-password", adminModifyRateLimit, admins.resetPasswordAdmin);

export default router;
