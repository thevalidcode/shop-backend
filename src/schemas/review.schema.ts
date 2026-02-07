import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { ReviewStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

// Review Create Schema
export const ReviewCreateSchema = z
  .object({
    productUid: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    title: z.string().max(100).optional(),
    comment: z.string().max(1000).optional(),
  })
  .openapi("ReviewCreate");

// Review Update Schema (for admin approval/rejection)
export const ReviewApproveSchema = z
  .object({
    uid: z.string().uuid(),
  })
  .openapi("ReviewApprove");

export const ReviewRejectSchema = z
  .object({
    uid: z.string().uuid(),
  })
  .openapi("ReviewReject");

// Review Delete Schema
export const ReviewDeleteSchema = z
  .object({
    uid: z.string().uuid(),
  })
  .openapi("ReviewDelete");

// Review Get Schema
export const ReviewUidSchema = z.object({
  reviewUid: z.string().uuid(),
});

export const ProductUidParamSchema = z.object({
  productUid: z.string().uuid(),
});

// Response Schemas
export const ReviewSchema = z
  .object({
    uid: z.string(),
    productUid: z.string(),
    userUid: z.string(),
    rating: z.number(),
    title: z.string().nullable(),
    comment: z.string().nullable(),
    isVerified: z.boolean(),
    status: z.nativeEnum(ReviewStatus),
    timestamp: z.string(),
    updatedAt: z.string(),
  })
  .openapi("Review");

export const ReviewWithUserSchema = ReviewSchema.extend({
  user: z.object({
    uid: z.string(),
    username: z.string(),
    fullName: z.string().nullable(),
    image: z.string().nullable(),
  }),
}).openapi("ReviewWithUser");

export const ReviewWithProductSchema = ReviewSchema.extend({
  product: z.object({
    uid: z.string(),
    name: z.string(),
    slug: z.string(),
    imageUrl: z.string().nullable(),
  }),
}).openapi("ReviewWithProduct");
