import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { v4 as uuidv4 } from "uuid";
import {
  GetProductsQuerySchema,
  GetProductBySlugSchema,
  ProductReviewCreateSchema,
  GetProductReviewsQuerySchema,
  GetFeaturedProductsQuerySchema,
  GetBestSellingQuerySchema,
  GetRelatedProductsQuerySchema,
} from "../schemas/product.schema";

/**
 * Get products with advanced filtering, sorting, and search (Public)
 */
export const getProductsPublic = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = GetProductsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const {
    shopId,
    page,
    limit,
    search,
    categoryUid,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
    isFeatured,
    brand,
  } = parsed.data;

  try {
    const where: any = { shopId, status: "ACTIVE" };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    if (categoryUid) where.categoryUid = categoryUid;
    if (isFeatured === "true") where.isFeatured = true;
    if (brand) where.brand = brand;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          variants: {
            select: {
              uid: true,
              name: true,
              price: true,
              stock: true,
              color: true,
              size: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Increment view count for each product (async, don't wait)
    if (products.length > 0) {
      prisma.product
        .updateMany({
          where: {
            uid: {
              in: products.map((p) => p.uid),
            },
          },
          data: {
            viewCount: {
              increment: 1,
            },
          },
        })
        .catch(() => {}); // Silently fail view count updates
    }

    res.status(200).json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get single product by slug or UID (Public)
 */
export const getProductBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = GetProductBySlugSchema.safeParse({
    slug: req.params.slug,
    shopId: req.query.shopId,
  });

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { slug, shopId } = parsed.data;

  try {
    const product = await prisma.product.findFirst({
      where: {
        slug,
        shopId,
        status: "ACTIVE",
      },
      include: {
        category: true,
        images: {
          orderBy: { position: "asc" },
        },
        variants: {
          orderBy: { position: "asc" },
        },
        reviews: {
          where: { status: "APPROVED" },
          take: 10,
          orderBy: { timestamp: "desc" },
          include: {
            user: {
              select: {
                fullName: true,
                username: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Increment view count
    prisma.product
      .update({
        where: { uid: product.uid },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      })
      .catch(() => {});

    res.status(200).json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Create product review
 */
export const createProductReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const parsed = ProductReviewCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const productUid = req.params.productUid as string;
  const { rating, title, comment } = parsed.data;
  const { uid: userUid, shopId } = req.auth;

  try {
    // Check if product exists
    const product = await prisma.product.findFirst({
      where: { uid: productUid, shopId },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Check if user already reviewed
    const existingReview = await prisma.productReview.findFirst({
      where: {
        productUid,
        userUid,
      },
    });

    if (existingReview) {
      res.status(400).json({ error: "You have already reviewed this product" });
      return;
    }

    // Check if user has purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productUid,
        order: {
          userUid,
          status: "DELIVERED",
        },
      },
    });

    const review = await prisma.productReview.create({
      data: {
        uid: uuidv4(),
        productUid,
        userUid,
        rating,
        title,
        comment,
        isVerified: !!hasPurchased,
        status: "PENDING", // Require admin approval
      },
    });

    // Update product rating (async)
    updateProductRating(productUid).catch(() => {});

    res.status(201).json({
      success: "Review submitted successfully and awaiting approval",
      review,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Helper function to update product average rating
 */
async function updateProductRating(productUid: string): Promise<void> {
  const reviews = await prisma.productReview.findMany({
    where: {
      productUid,
      status: "APPROVED",
    },
    select: {
      rating: true,
    },
  });

  if (reviews.length === 0) {
    await prisma.product.update({
      where: { uid: productUid },
      data: {
        averageRating: 0,
        totalReviews: 0,
      },
    });
    return;
  }

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / reviews.length;

  await prisma.product.update({
    where: { uid: productUid },
    data: {
      averageRating,
      totalReviews: reviews.length,
    },
  });
}

/**
 * Get product reviews
 */
export const getProductReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = GetProductReviewsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const productUid = req.params.productUid as string;
  const { page, limit } = parsed.data;

  try {
    const [reviews, total] = await Promise.all([
      prisma.productReview.findMany({
        where: {
          productUid,
          status: "APPROVED",
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { timestamp: "desc" },
        include: {
          user: {
            select: {
              fullName: true,
              username: true,
              image: true,
            },
          },
        },
      }),
      prisma.productReview.count({
        where: {
          productUid,
          status: "APPROVED",
        },
      }),
    ]);

    res.status(200).json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = GetFeaturedProductsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { shopId, limit } = parsed.data;

  try {
    const products = await prisma.product.findMany({
      where: {
        shopId,
        status: "ACTIVE",
        isFeatured: true,
      },
      take: limit,
      orderBy: [{ averageRating: "desc" }, { totalSales: "desc" }],
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    res.status(200).json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get best-selling products
 */
export const getBestSellingProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = GetBestSellingQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { shopId, limit } = parsed.data;

  try {
    const products = await prisma.product.findMany({
      where: {
        shopId,
        status: "ACTIVE",
      },
      take: limit,
      orderBy: { totalSales: "desc" },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    res.status(200).json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get product variants
 */
export const getProductVariants = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const productUid = req.params.productUid as string;

  try {
    const variants = await prisma.productVariant.findMany({
      where: { productUid },
      orderBy: { position: "asc" },
    });

    res.status(200).json(variants);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get related products
 */
export const getRelatedProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = GetRelatedProductsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const productUid = req.params.productUid as string;
  const { limit } = parsed.data;

  try {
    const product = await prisma.product.findUnique({
      where: { uid: productUid },
      select: {
        categoryUid: true,
        shopId: true,
        tags: true,
      },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        shopId: product.shopId,
        status: "ACTIVE",
        uid: { not: productUid },
        OR: [
          { categoryUid: product.categoryUid },
          { tags: { hasSome: product.tags } },
        ],
      },
      take: limit,
      orderBy: [{ averageRating: "desc" }, { totalSales: "desc" }],
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    res.status(200).json(relatedProducts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
