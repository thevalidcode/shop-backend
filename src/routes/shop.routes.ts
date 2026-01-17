import express from "express";
const router = express.Router();
import * as shops from "../controllers/shop.controllers";
import { authenticateAdmin } from "../middleware/auth";
import { shopRateLimit, shopModifyRateLimit } from "../middleware/ratelimit";

router.get("/data", shopRateLimit, shops.getShopData);
router.put("/:shopId/onboarding-completed", shopModifyRateLimit, shops.completeOnboarding);
router.get("/:shopId/general-data", shopRateLimit, shops.getShopGeneralData);
router.patch("/general-data", authenticateAdmin, shopModifyRateLimit, shops.updateShopGeneralData);
router.get("/:shopId/styles", shopRateLimit, shops.getStyles);
router.patch("/styles", authenticateAdmin, shopModifyRateLimit, shops.updateShopStyles);

export default router;
