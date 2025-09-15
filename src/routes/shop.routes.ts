import express from "express";
const router = express.Router();
import * as shops from "../controllers/shop.controllers";
import { authenticateUser, authenticateAdmin } from "../middleware/auth";

router.get("/data", shops.getShopData);
router.get("/styles", shops.getStyles);
router.get("/site-data", shops.getSiteData);

// NEW: Public shop discovery routes
router.get("/discover", shops.getActiveShops);
router.get("/info/:identifier", shops.getShopByIdentifier);

router.get("/current-user", authenticateUser, shops.getCurrentUser);
router.get("/current-admin", authenticateAdmin, shops.getCurrentAdmin);
router.post("/contact", shops.createContactMessage);

export default router;
