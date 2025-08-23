import express from "express";
const router = express.Router();
import * as shops from "../controllers/shop.controllers";
import { authenticate } from "../middleware/authenticate";

router.get("/data", shops.getShopData);
router.get("/styles", shops.getStyles);
router.get("/site-data", shops.getSiteData);
router.get("/rates", shops.getRates);

// NEW: Public shop discovery routes
router.get("/discover", shops.getActiveShops);
router.get("/info/:identifier", shops.getShopByIdentifier);

router.get("/current-user", authenticate, shops.getCurrentUser);
router.get("/current-admin", authenticate, shops.getCurrentAdmin);
router.post("/contact", shops.createContactMessage);

export default router;
