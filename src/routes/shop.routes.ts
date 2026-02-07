import express from "express";
const router = express.Router();
import * as shops from "../controllers/shop.controllers";
import { authenticateAdmin } from "../middleware/auth";
import { shopRateLimit, shopModifyRateLimit } from "../middleware/ratelimit";
import {
  checkHidePlatformBanner,
  checkCustomBranding,
} from "../middleware/features";

router.get("/data", shopRateLimit, shops.getShopData);
router.put("/:shopId/onboarding-completed", shopModifyRateLimit, shops.completeOnboarding);
router.get("/:shopId/general-data", shopRateLimit, shops.getShopGeneralData);
router.patch(
  "/general-data",
  authenticateAdmin,
  checkHidePlatformBanner,
  checkCustomBranding,
  shopModifyRateLimit,
  shops.updateShopGeneralData,
);
router.get("/:shopId/styles", shopRateLimit, shops.getStyles);
router.patch(
  "/styles",
  authenticateAdmin,
  checkCustomBranding,
  shopModifyRateLimit,
  shops.updateShopStyles,
);

export default router;
