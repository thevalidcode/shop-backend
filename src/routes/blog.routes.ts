import express from "express";
const router = express.Router();
import * as blogs from "../controllers/blog.controllers";
import { authenticateAdmin } from "../middleware/auth";
import { blogRateLimit, blogModifyRateLimit } from "../middleware/ratelimit";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

// Public routes
router.get("/", blogRateLimit, blogs.getBlogs);
router.get("/:blogId", blogRateLimit, blogs.getBlogByID);

// Protected Admin routes
router.post(
  "/admin",
  authenticateAdmin,
  requireActiveSubscription,
  blogModifyRateLimit,
  blogs.addBlog,
);
router.patch(
  "/admin",
  authenticateAdmin,
  requireActiveSubscription,
  blogModifyRateLimit,
  blogs.updateBlog,
);
router.delete(
  "/admin",
  authenticateAdmin,
  requireActiveSubscription,
  blogModifyRateLimit,
  blogs.deleteBlog,
);
router.delete(
  "/admin/multiple",
  authenticateAdmin,
  requireActiveSubscription,
  blogModifyRateLimit,
  blogs.deleteMultipleBlogs,
);

export default router;
