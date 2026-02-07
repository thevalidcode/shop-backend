import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { sendUserEmail, sendEmailToAdmins } from "../emails";
import {
  ReviewCreateSchema,
  ReviewApproveSchema,
  ReviewDeleteSchema,
  ProductUidParamSchema,
} from "../schemas/review.schema";
import { ShopIdSchema } from "../schemas/common.schema";

// ======================= USER ENDPOINTS =======================

// Create Review (User)
export const createReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = ReviewCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { productUid, rating, title, comment } = parsed.data;
  const { uid: userUid, shopId } = req.auth!;

  try {
    // Verify product exists and belongs to user's shop
    const product = await prisma.product.findFirst({
      where: { uid: productUid, shopId },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.productReview.findFirst({
      where: { productUid, userUid },
    });

    if (existingReview) {
      res.status(409).json({ error: "You have already reviewed this product" });
      return;
    }

    // Check if user has purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productUid,
        order: {
          userUid,
          shopId,
          status: "DELIVERED",
        },
      },
    });

    // Only allow reviews from users who have purchased the product
    if (!hasPurchased) {
      res.status(403).json({
        error: "Purchase required",
        message:
          "You can only review products you have purchased and received.",
      });
      return;
    }

    const isVerified = true; // Always true since we verified purchase above

    // Create the review
    const review = await prisma.productReview.create({
      data: {
        productUid,
        userUid,
        rating,
        title,
        comment,
        isVerified,
        status: "PENDING",
      },
    });

    // Update product average rating and total reviews
    await updateProductRatingStats(productUid);

    // Send email notification to admins
    try {
      const shop = await prisma.shop.findUnique({ where: { shopId } });
      const shopUrl = shop?.uid ? `https://${shop.uid}` : "";

      await sendEmailToAdmins(shopId, "NEW_REVIEW_NOTIFICATION", {
        productName: product.name,
        userName:
          (await prisma.user.findUnique({ where: { uid: userUid } }))
            ?.username || "User",
        rating,
        reviewText: comment || "",
        isVerified,
        productUrl: `${shopUrl}/client/products?uid=${product.uid}`,
        adminDashboardUrl: `${shopUrl}/admin/products`,
      });
    } catch (emailError) {}

    res.status(201).json({
      success: true,
      data: {
        uid: review.uid,
        productUid: review.productUid,
        userUid: review.userUid,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isVerified: review.isVerified,
        status: review.status,
        timestamp: review.timestamp.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create review" });
  }
};

// Get Product Reviews (Public)
export const getProductReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsParsed = ProductUidParamSchema.safeParse(req.params);
  const queryParsed = ShopIdSchema.safeParse(req.query);

  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }

  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.flatten() });
    return;
  }

  const { productUid } = paramsParsed.data;
  const { shopId } = queryParsed.data;

  try {
    // Verify product exists and belongs to the shop
    const product = await prisma.product.findFirst({
      where: { uid: productUid, shopId },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Get approved reviews only
    const reviews = await prisma.productReview.findMany({
      where: {
        productUid,
        status: "APPROVED",
      },
      include: {
        user: {
          select: {
            uid: true,
            username: true,
            fullName: true,
            image: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    res.status(200).json({
      success: true,
      data: reviews.map((review) => ({
        uid: review.uid,
        productUid: review.productUid,
        userUid: review.userUid,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isVerified: review.isVerified,
        status: review.status,
        timestamp: review.timestamp.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        user: review.user,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get product reviews" });
  }
};

// Get User Reviews (User)
export const getUserReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { uid: userUid, shopId } = req.auth!;

  try {
    const reviews = await prisma.productReview.findMany({
      where: {
        userUid,
        product: {
          shopId,
        },
      },
      include: {
        product: {
          select: {
            uid: true,
            name: true,
            slug: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    res.status(200).json({
      success: true,
      data: reviews.map((review) => ({
        uid: review.uid,
        productUid: review.productUid,
        userUid: review.userUid,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isVerified: review.isVerified,
        status: review.status,
        timestamp: review.timestamp.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        product: review.product,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get user reviews" });
  }
};

// Delete Review (User)
export const deleteReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = ReviewDeleteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;
  const { uid: userUid, shopId } = req.auth!;

  try {
    // Find the review and verify ownership
    const review = await prisma.productReview.findFirst({
      where: {
        uid,
        userUid,
        product: {
          shopId,
        },
      },
      include: {
        product: true,
      },
    });

    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    // Delete the review
    await prisma.productReview.delete({
      where: { uid },
    });

    // Update product rating stats
    await updateProductRatingStats(review.productUid);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete review" });
  }
};

// ======================= ADMIN ENDPOINTS =======================

// Get All Reviews (Admin)
export const getAllReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { shopId } = req.auth!;

  try {
    const reviews = await prisma.productReview.findMany({
      where: {
        product: {
          shopId,
        },
      },
      include: {
        user: {
          select: {
            uid: true,
            username: true,
            fullName: true,
            image: true,
          },
        },
        product: {
          select: {
            uid: true,
            name: true,
            slug: true,
            imageUrl: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { timestamp: "desc" }],
    });

    res.status(200).json({
      success: true,
      data: reviews.map((review) => ({
        uid: review.uid,
        productUid: review.productUid,
        userUid: review.userUid,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isVerified: review.isVerified,
        status: review.status,
        timestamp: review.timestamp.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        user: review.user,
        product: review.product,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get all reviews" });
  }
};

// Approve Review (Admin)
export const approveReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = ReviewApproveSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;
  const { shopId } = req.auth!;

  try {
    // Verify review belongs to admin's shop
    const review = await prisma.productReview.findFirst({
      where: {
        uid,
        product: {
          shopId,
        },
      },
    });

    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    // Update review status to APPROVED
    const updatedReview = await prisma.productReview.update({
      where: { uid },
      data: { status: "APPROVED" },
      include: {
        user: {
          select: {
            uid: true,
            username: true,
            fullName: true,
            image: true,
            email: true,
          },
        },
        product: {
          select: {
            uid: true,
            name: true,
            slug: true,
            imageUrl: true,
          },
        },
      },
    });

    // Update product rating stats
    await updateProductRatingStats(review.productUid);

    // Send approval email to user
    try {
      if (updatedReview.user.email) {
        const shop = await prisma.shop.findUnique({ where: { shopId } });
        const shopUrl = shop?.uid ? `https://${shop.uid}` : "";

        await sendUserEmail(
          shopId,
          updatedReview.user.email,
          "REVIEW_APPROVED",
          {
            userName:
              updatedReview.user.fullName || updatedReview.user.username,
            productName: updatedReview.product.name,
            rating: updatedReview.rating,
            reviewText: updatedReview.comment || "",
            reviewUrl: `${shopUrl}/client/products?uid=${updatedReview.product.uid}`,
          },
        );
      }
    } catch (emailError) {}

    res.status(200).json({
      success: true,
      data: {
        uid: updatedReview.uid,
        productUid: updatedReview.productUid,
        userUid: updatedReview.userUid,
        rating: updatedReview.rating,
        title: updatedReview.title,
        comment: updatedReview.comment,
        isVerified: updatedReview.isVerified,
        status: updatedReview.status,
        timestamp: updatedReview.timestamp.toISOString(),
        updatedAt: updatedReview.updatedAt.toISOString(),
        user: updatedReview.user,
        product: updatedReview.product,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to approve review" });
  }
};

// Reject Review (Admin)
export const rejectReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = ReviewApproveSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;
  const { shopId } = req.auth!;

  try {
    // Verify review belongs to admin's shop
    const review = await prisma.productReview.findFirst({
      where: {
        uid,
        product: {
          shopId,
        },
      },
    });

    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    // Update review status to REJECTED
    const updatedReview = await prisma.productReview.update({
      where: { uid },
      data: { status: "REJECTED" },
      include: {
        user: {
          select: {
            uid: true,
            username: true,
            fullName: true,
            image: true,
            email: true,
          },
        },
        product: {
          select: {
            uid: true,
            name: true,
            slug: true,
            imageUrl: true,
          },
        },
      },
    });

    // Update product rating stats
    await updateProductRatingStats(review.productUid);

    // Send rejection email to user
    try {
      if (updatedReview.user.email) {
        const shop = await prisma.shop.findUnique({ where: { shopId } });
        const shopUrl = shop?.uid ? `https://${shop.uid}` : "";

        await sendUserEmail(
          shopId,
          updatedReview.user.email,
          "REVIEW_REJECTED",
          {
            userName:
              updatedReview.user.fullName || updatedReview.user.username,
            productName: updatedReview.product.name,
            rejectionReason:
              "The review did not meet our community guidelines. Please ensure your review is respectful, relevant, and provides helpful information for other customers.",
            reviewGuidelines: `${shopUrl}/review-guidelines`,
          },
        );
      }
    } catch (emailError) {}

    res.status(200).json({
      success: true,
      data: {
        uid: updatedReview.uid,
        productUid: updatedReview.productUid,
        userUid: updatedReview.userUid,
        rating: updatedReview.rating,
        title: updatedReview.title,
        comment: updatedReview.comment,
        isVerified: updatedReview.isVerified,
        status: updatedReview.status,
        timestamp: updatedReview.timestamp.toISOString(),
        updatedAt: updatedReview.updatedAt.toISOString(),
        user: updatedReview.user,
        product: updatedReview.product,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to reject review" });
  }
};

// Delete Review (Admin)
export const deleteReviewAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = ReviewDeleteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;
  const { shopId } = req.auth!;

  try {
    // Verify review belongs to admin's shop
    const review = await prisma.productReview.findFirst({
      where: {
        uid,
        product: {
          shopId,
        },
      },
    });

    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    // Delete the review
    await prisma.productReview.delete({
      where: { uid },
    });

    // Update product rating stats
    await updateProductRatingStats(review.productUid);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete review" });
  }
};

// ======================= HELPER FUNCTIONS =======================

async function updateProductRatingStats(productUid: string): Promise<void> {
  try {
    // Get all approved reviews for the product
    const approvedReviews = await prisma.productReview.findMany({
      where: {
        productUid,
        status: "APPROVED",
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = approvedReviews.length;
    const averageRating =
      totalReviews > 0
        ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews
        : 0;

    // Update product
    await prisma.product.update({
      where: { uid: productUid },
      data: {
        totalReviews,
        averageRating,
      },
    });
  } catch (error) {}
}
