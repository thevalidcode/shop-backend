import express from "express";
const router = express.Router();
import * as blogs from "../controllers/blog.controllers";
import { authenticateAdmin } from "../middleware/auth";

// Public routes
router.get("/", blogs.getBlogs);
router.get("/:blogId", blogs.getBlogByID);

// Protected Admin routes
router.post("/admin", authenticateAdmin, blogs.addBlog);
router.patch("/admin", authenticateAdmin, blogs.updateBlog);
router.delete("/admin", authenticateAdmin, blogs.deleteBlog);
router.delete("/admin/multiple", authenticateAdmin, blogs.deleteMultipleBlogs);

export default router;
