import express from "express";
const router = express.Router();
import * as blogs from "../controllers/blog.controllers";
import { authenticateAdmin } from "../middleware/auth";

// Public routes
router.get("/", blogs.getBlogs);
router.get("/:blogId", blogs.getBlogByID);

// Protected routes
router.post("/", authenticateAdmin, blogs.addBlog);
router.patch("/", authenticateAdmin, blogs.updateBlog);
router.delete("/", authenticateAdmin, blogs.deleteBlog);
router.delete("/multiple", authenticateAdmin, blogs.deleteMultipleBlogs);

export default router;
