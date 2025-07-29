import { prisma } from "../config/db";
import { v4 as uuid4 } from "uuid";
import type { Request, Response } from "express";
import { ShopIdSchema } from "../schemas/common.schema";
import {
  createBlogSchema,
  updateBlogSchema,
  deleteBlogSchema,
  deleteMultipleBlogsSchema,
  blogIdSchema,
} from "../schemas/blog.schema";

export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  const parsed = ShopIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { shopId } = parsed.data;

  try {
    const blogs = await prisma.blog.findMany({
      where: { shopId },
      orderBy: { position: "asc" },
    });
    res.status(200).json(blogs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBlogByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = blogIdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { blogId } = parsed.data;
  const queryParsed = ShopIdSchema.safeParse(req.query);

  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.flatten() });
    return;
  }

  const { shopId } = queryParsed.data;

  try {
    const blog = await prisma.blog.findFirst({
      where: { shopId, id: blogId },
    });

    res.status(200).json({ blog });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addBlog = async (req: Request, res: Response): Promise<void> => {
  const parsed = createBlogSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { shopId } = req.auth!;

  try {
    const lastBlog = await prisma.blog.findFirst({
      where: { shopId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    const newPosition = lastBlog ? lastBlog.position + 1 : 1;

    const newBlog = await prisma.blog.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.title.toLowerCase().replace(/\s+/g, "-"),
        content: parsed.data.content,
        description: parsed.data.description || "",
        status: "Active",
        position: newPosition,
        shopId,
        uid: uuid4(),
      },
    });

    res.status(201).json({
      success: "Blog added successfully.",
      blog: newBlog,
    });
  } catch (error: any) {
    console.error("Failed to add blog:", error);
    res.status(500).json({ error: "Failed to add blog." });
  }
};

export const updateBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = updateBlogSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  
  const { uid } = parsed.data;
  const { shopId } = req.auth!;

  try {
    const updatedBlog = await prisma.blog.update({
      where: { uid, shopId },
      data: parsed.data,
    });

    res.status(200).json({ success: "Blog updated successfully.", blog: updatedBlog });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = deleteBlogSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;
  const { shopId } = req.auth!;

  try {
    await prisma.blog.delete({
      where: { shopId, uid },
    });

    res.status(200).json({ success: "Blog deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMultipleBlogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = deleteMultipleBlogsSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uids } = parsed.data;
  const { shopId } = req.auth!;

  try {
    await prisma.blog.deleteMany({
      where: {
        shopId,
        uid: { in: uids },
      },
    });

    res.status(200).json({ success: "Blogs deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};