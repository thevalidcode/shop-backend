import { z } from "zod";
import {
  ReviewSchema,
  ReviewWithUserSchema,
  ReviewWithProductSchema,
} from "../../schemas/review.schema";

export const ReviewCreatedResponse = {
  description: "Review created successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal(true),
        data: ReviewSchema,
      }),
    },
  },
};

export const ProductReviewsListResponse = {
  description: "List of approved product reviews",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal(true),
        data: z.array(ReviewWithUserSchema),
      }),
    },
  },
};

export const UserReviewsListResponse = {
  description: "List of user's reviews",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal(true),
        data: z.array(ReviewWithProductSchema),
      }),
    },
  },
};

export const ReviewDeletedResponse = {
  description: "Review deleted successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal(true),
        message: z.literal("Review deleted successfully"),
      }),
    },
  },
};

export const AllReviewsListResponse = {
  description: "List of all reviews (admin)",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal(true),
        data: z.array(
          ReviewWithUserSchema.extend({
            product: z.object({
              uid: z.string(),
              name: z.string(),
              slug: z.string(),
              imageUrl: z.string().nullable(),
            }),
          }),
        ),
      }),
    },
  },
};

export const ReviewApprovedResponse = {
  description: "Review approved successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal(true),
        data: ReviewWithUserSchema.extend({
          product: z.object({
            uid: z.string(),
            name: z.string(),
            slug: z.string(),
            imageUrl: z.string().nullable(),
          }),
        }),
      }),
    },
  },
};

export const ReviewRejectedResponse = {
  description: "Review rejected successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal(true),
        data: ReviewWithUserSchema.extend({
          product: z.object({
            uid: z.string(),
            name: z.string(),
            slug: z.string(),
            imageUrl: z.string().nullable(),
          }),
        }),
      }),
    },
  },
};

export const ReviewNotFound = {
  description: "Review not found",
  content: {
    "application/json": {
      schema: z.object({
        error: z.string(),
      }),
    },
  },
};

export const ReviewAlreadyExists = {
  description: "User already reviewed this product",
  content: {
    "application/json": {
      schema: z.object({
        error: z.literal("You have already reviewed this product"),
      }),
    },
  },
};
