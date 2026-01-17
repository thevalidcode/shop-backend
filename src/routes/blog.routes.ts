import express from "express";
const router = express.Router();
import * as blogs from "../controllers/blog.controllers";
import { authenticateAdmin } from "../middleware/auth";
import { blogRateLimit, blogModifyRateLimit } from "../middleware/ratelimit";

// Public routes
router.get("/", blogRateLimit, blogs.getBlogs);
router.get("/:blogId", blogRateLimit, blogs.getBlogByID);

// Protected Admin routes
router.post("/admin", authenticateAdmin, blogModifyRateLimit, blogs.addBlog);
router.patch("/admin", authenticateAdmin, blogModifyRateLimit, blogs.updateBlog);
router.delete("/admin", authenticateAdmin, blogModifyRateLimit, blogs.deleteBlog);
router.delete("/admin/multiple", authenticateAdmin, blogModifyRateLimit, blogs.deleteMultipleBlogs);

export default router;
