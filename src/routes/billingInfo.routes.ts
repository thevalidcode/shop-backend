import { Router } from "express";
import * as billingInfoController from "../controllers/billingInfo.controllers";
import { authenticateUser } from "../middleware/auth";
import { billingInfoRateLimit, billingInfoModifyRateLimit } from "../middleware/ratelimit";

const router = Router();

// All routes require authentication
router.use(authenticateUser);

/**
 * @route   POST /api/billing-info
 * @desc    Create new billing information
 * @access  Private (User)
 */
router.post("/", billingInfoModifyRateLimit, billingInfoController.createBillingInfo);

/**
 * @route   GET /api/billing-info
 * @desc    Get all billing information for the authenticated user
 * @access  Private (User)
 */
router.get("/", billingInfoRateLimit, billingInfoController.getUserBillingInfo);

/**
 * @route   GET /api/billing-info/default
 * @desc    Get default billing information
 * @access  Private (User)
 */
router.get("/default", billingInfoRateLimit, billingInfoController.getDefaultBillingInfo);

/**
 * @route   GET /api/billing-info/:uid
 * @desc    Get specific billing information by UID
 * @access  Private (User)
 */
router.get("/:uid", billingInfoRateLimit, billingInfoController.getBillingInfoByUid);

/**
 * @route   PUT /api/billing-info/:uid
 * @desc    Update billing information
 * @access  Private (User)
 */
router.put("/:uid", billingInfoModifyRateLimit, billingInfoController.updateBillingInfo);

/**
 * @route   DELETE /api/billing-info/:uid
 * @desc    Delete billing information
 * @access  Private (User)
 */
router.delete("/:uid", billingInfoModifyRateLimit, billingInfoController.deleteBillingInfo);

export default router;
