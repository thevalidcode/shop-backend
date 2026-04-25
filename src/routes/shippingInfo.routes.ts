import { Router } from "express";
import * as shippingInfoController from "../controllers/shippingInfo.controllers";
import { authenticateUser } from "../middleware/auth";
import { shippingInfoRateLimit, shippingInfoModifyRateLimit } from "../middleware/ratelimit";

const router = Router();

// All routes require authentication
router.use(authenticateUser);

/**
 * @route   POST /api/shipping-info
 * @desc    Create new shipping information
 * @access  Private (User)
 */
router.post("/", shippingInfoModifyRateLimit, shippingInfoController.createShippingInfo);

/**
 * @route   GET /api/shipping-info
 * @desc    Get all shipping information for the authenticated user
 * @access  Private (User)
 */
router.get("/", shippingInfoRateLimit, shippingInfoController.getUserShippingInfo);

/**
 * @route   GET /api/shipping-info/default
 * @desc    Get default shipping information
 * @access  Private (User)
 */
router.get("/default", shippingInfoRateLimit, shippingInfoController.getDefaultShippingInfo);

/**
 * @route   GET /api/shipping-info/:uid
 * @desc    Get specific shipping information by UID
 * @access  Private (User)
 */
router.get("/:uid", shippingInfoRateLimit, shippingInfoController.getShippingInfoByUid);

/**
 * @route   PUT /api/shipping-info/:uid
 * @desc    Update shipping information
 * @access  Private (User)
 */
router.put("/:uid", shippingInfoModifyRateLimit, shippingInfoController.updateShippingInfo);

/**
 * @route   DELETE /api/shipping-info/:uid
 * @desc    Delete shipping information
 * @access  Private (User)
 */
router.delete("/:uid", shippingInfoModifyRateLimit, shippingInfoController.deleteShippingInfo);

export default router;
