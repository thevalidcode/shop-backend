import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const CategorySchema = z
  .object({
    id: z.number(),
    shopScopedId: z.number(),
    uid: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    status: z.string(),
    position: z.number(),
    imageUrl: z.string().url().nullable(),
    bannerUrl: z.string().url().nullable(),
    iconUrl: z.string().url().nullable(),
    parentUid: z.string().nullable(),
    shopId: z.number(),
  })
  .openapi("Category");

export const CategoryCreateRequestSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  iconUrl: z.string().url().optional(),
  position: z.number().optional(),
  parentUid: z.string().optional(),
});

export const CategoryUpdateRequestSchema = z.object({
  uid: z.string(),
  name: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  iconUrl: z.string().url().optional(),
  status: z.string().optional(),
  position: z.number().optional(),
  parentUid: z.string().optional(),
});
