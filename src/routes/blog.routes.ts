import express from "express";
const router = express.Router();
import * as blogs from "../controllers/blog.controllers";
import { authenticate } from "../middleware/authenticate";

// Public routes
router.get("/", blogs.getBlogs);
router.get("/:blogId", blogs.getBlogByID);

// Protected routes
router.post("/", authenticate, blogs.addBlog);
router.patch("/", authenticate, blogs.updateBlog);
router.delete("/", authenticate, blogs.deleteBlog);
router.delete("/multiple", authenticate, blogs.deleteMultipleBlogs);

export default router;
