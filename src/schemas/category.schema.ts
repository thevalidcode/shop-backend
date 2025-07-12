import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const CategorySchema = z
  .object({
    id: z.number(),
    uid: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    status: z.string(),
    position: z.number(),
    image_url: z.string().url().nullable(),
    banner_url: z.string().url().nullable(),
    icon_url: z.string().url().nullable(),
    parent_uid: z.string().nullable(),
    shop_id: z.number(),
  })
  .openapi("Category");

export const CategoryCreateRequestSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  banner_url: z.string().url().optional(),
  icon_url: z.string().url().optional(),
  position: z.number().optional(),
  parent_uid: z.string().optional(),
});

export const CategoryUpdateRequestSchema = z.object({
  uid: z.string(),
  name: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  banner_url: z.string().url().optional(),
  icon_url: z.string().url().optional(),
  status: z.string().optional(),
  position: z.number().optional(),
  parent_uid: z.string().optional(),
});
