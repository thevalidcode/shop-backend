import { AuthSchema } from "../schemas/user.schema";
import { prisma } from "../config/db";
import { v4 as uuid4 } from "uuid";
import type { Request, Response } from "express";
import { ShopIdSchema } from "../schemas/common.schema";
import {
  blogIdSchema,
  createBlogSchema,
  updateBlogSchema,
  deleteBlogSchema,
  deleteMultipleBlogsSchema,
} from "../schemas/blog.schema";
import { getNextShopModelId } from "../utils/nextId";

export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  const parsed = ShopIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { shop_id } = parsed.data;

  try {
    const blogs = await prisma.blog.findMany({
      where: { shopId: shop_id },
    });

    const sorted = blogs.sort((a: any, b: any) => a.position - b.position);
    res.status(200).json(sorted);
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

  const { blog_id } = parsed.data;
  const queryParsed = ShopIdSchema.safeParse(req.query);

  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.flatten() });
    return;
  }

  const { shop_id } = queryParsed.data;

  try {
    const blog = await prisma.blog.findFirst({
      where: { shopId: shop_id, id: blog_id },
    });

    res.status(200).json({ blog });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addBlog = async (req: Request, res: Response): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = createBlogSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, shop_id } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    const newId = await getNextShopModelId("blog", shop_id);

    const blogData = await prisma.blog.create({
      data: {
        id: newId,
        title: parsed.data.title,
        slug: parsed.data.title.toLowerCase().replace(/\s+/g, "-"),
        content: parsed.data.content,
        description: parsed.data.description || "",
        status: "Active",
        position: newId,
        shopId: shop_id,
        uid: uuid4(),
      },
    });

    res.status(200).json({
      success: "Blog added successfully.",
      blog: blogData,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = updateBlogSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;
  const { shop_id, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await prisma.blog.update({
      where: { uid, shopId: shop_id },
      data: parsed.data,
    });

    const blog = await prisma.blog.findFirst({
      where: { uid, shopId: shop_id },
    });

    res.status(200).json({ success: "Blog updated successfully.", blog });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = deleteBlogSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;
  const { role, shop_id } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await prisma.blog.delete({
      where: { shopId: shop_id, uid },
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
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = deleteMultipleBlogsSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uids } = parsed.data;
  const { role, shop_id } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await prisma.blog.deleteMany({
      where: {
        shopId: shop_id,
        uid: { in: uids },
      },
    });

    res.status(200).json({ success: "Blogs deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
