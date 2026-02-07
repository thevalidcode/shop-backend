import express from "express";
const router = express.Router();
import * as reviews from "../controllers/review.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import {
  reviewRateLimit,
  reviewModifyRateLimit,
  reviewAdminRateLimit,
} from "../middleware/ratelimit/review.ratelimit";

// ======================= USER ROUTES =======================

// Create Review (User)
router.post("/", authenticateUser, reviewModifyRateLimit, reviews.createReview);

// Get Product Reviews (Public)
router.get("/product/:productUid", reviewRateLimit, reviews.getProductReviews);

// Get User Reviews (User)
router.get("/user", authenticateUser, reviewRateLimit, reviews.getUserReviews);

// Delete Review (User)
router.delete(
  "/",
  authenticateUser,
  reviewModifyRateLimit,
  reviews.deleteReview,
);

// ======================= ADMIN ROUTES =======================

// Get All Reviews (Admin)
router.get(
  "/admin/all",
  authenticateAdmin,
  reviewAdminRateLimit,
  reviews.getAllReviews,
);

// Approve Review (Admin)
router.patch(
  "/approve",
  authenticateAdmin,
  reviewAdminRateLimit,
  reviews.approveReview,
);

// Reject Review (Admin)
router.patch(
  "/reject",
  authenticateAdmin,
  reviewAdminRateLimit,
  reviews.rejectReview,
);

// Delete Review (Admin)
router.delete(
  "/admin",
  authenticateAdmin,
  reviewAdminRateLimit,
  reviews.deleteReviewAdmin,
);

export default router;
