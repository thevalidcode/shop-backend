import express from "express";
const router = express.Router();
import * as shops from "../controllers/shop";
import { authenticate } from "../middleware/authenticate";

router.get("/data", shops.getShopData);
router.get("/csrf-token", shops.getShopCSRFToken);
router.get("/styles", shops.getStyles);
router.get("/site-data", shops.getSiteData);
router.get("/rates", shops.getRates);
router.get("/current-user", authenticate, shops.getCurrentUser);
router.get("/current-admin", authenticate, shops.getCurrentAdmin);

export default router;
