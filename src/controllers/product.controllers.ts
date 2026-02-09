import { prisma } from "../config/db.config";
import type { Request, Response } from "express";
import {
  DeleteProductInputSchema,
  DeleteMultipleProductsInputSchema,
  ProductUpdateInputSchema,
  ProductCreateInputSchema,
  ProductUidSchema,
} from "../schemas/product.schema";
import { v4 as uuidv4 } from "uuid";
import { ShopIdSchema } from "../schemas/common.schema";
import { sendEmailToAdmins } from "../emails";

export const getProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = ShopIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { shopId } = parsed.data;

  try {
    const products = await prisma.product.findMany({
      where: { shopId, OR: [{ status: "ACTIVE" }, { status: "OUT_OF_STOCK" }] },
      orderBy: { position: "asc" },
      include: { category: true },
    });

    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductsForAdmins = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { shopId } = req.auth!;

  try {
    const products = await prisma.product.findMany({
      where: { shopId },
      orderBy: { position: "asc" },
      include: { category: true },
    });
    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductByUID = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsParsed = ProductUidSchema.safeParse(req.params);
  const queryParsed = ShopIdSchema.safeParse(req.query);

  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.flatten() });
    return;
  }

  const { shopId } = queryParsed.data;
  const { productUid } = paramsParsed.data;

  try {
    const product = await prisma.product.findFirst({
      where: { uid: productUid, shopId, status: "ACTIVE" },
      include: { category: true },
    });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.status(200).json({ product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductByUIDFromAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = ProductUidSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { productUid } = parsed.data;
  const { shopId } = req.auth!;

  try {
    const product = await prisma.product.findFirst({
      where: { uid: productUid, shopId },
      include: { category: true },
    });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.status(200).json({ product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = ProductUpdateInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const reqData = parsed.data;
  const { shopId } = req.auth!;

  try {
    const productToUpdate = await prisma.product.findFirst({
      where: { uid: reqData.uid, shopId },
      include: { category: true },
    });
    if (!productToUpdate) {
      res.status(404).json({ error: "Product not found in this shop." });
      return;
    }

    // Prepare update data, excluding unchanged slug and sku to avoid unique constraint errors
    const { uid, ...restData } = reqData;
    const updateData: any = { ...restData };

    // Handle slug: if empty string, generate from name; if same as existing, remove
    if (updateData.slug === "") {
      // Generate slug from name
      updateData.slug = updateData.name
        ? updateData.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        : productToUpdate.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
    } else if (updateData.slug && updateData.slug === productToUpdate.slug) {
      delete updateData.slug;
    }

    // Handle sku: if empty string, remove field entirely
    if (updateData.sku === "") {
      delete updateData.sku;
    } else if (updateData.sku && updateData.sku === productToUpdate.sku) {
      delete updateData.sku;
    }

    const updateResult = await prisma.product.updateMany({
      where: { uid: reqData.uid, shopId },
      data: updateData,
    });

    if (updateResult.count === 0) {
      res.status(404).json({ error: "Product not found or does not belong to this shop." });
      return;
    }

    // Fetch the updated product to continue with remaining logic
    const updatedProduct = await prisma.product.findFirst({
      where: { uid: reqData.uid, shopId },
      include: { category: true },
    });

    if (!updatedProduct) {
      // This should not happen since updateResult.count was > 0, but handle defensively
      console.error(`Product ${reqData.uid} was updated but could not be retrieved for shop ${shopId}`);
      res.status(500).json({ error: "Failed to retrieve updated product." });
      return;
    }

    // Check for low stock or out of stock scenarios
    if (
      updatedProduct.trackInventory &&
      updateData.stock !== undefined &&
      updatedProduct.stock <= 10
    ) {
      try {
        const setting = await prisma.setting.findUnique({
          where: { shopId },
          include: { shop: true },
        });

        const shopUrl = setting?.shop?.uid
          ? `https://${setting.shop.uid}`
          : "";

        if (updatedProduct.stock === 0) {
          // Send out of stock alert
          await sendEmailToAdmins(shopId, "OUT_OF_STOCK_ALERT", {
            productName: updatedProduct.name,
            productSku: updatedProduct.sku || "",
            productUrl: `${shopUrl}/products/${updatedProduct.slug}`,
            adminDashboardUrl: `${shopUrl}/admin/products`,
          });
        } else if (updatedProduct.stock > 0 && updatedProduct.stock <= 10) {
          // Send low stock alert (threshold: 10 units)
          await sendEmailToAdmins(shopId, "LOW_STOCK_ALERT", {
            productName: updatedProduct.name,
            productSku: updatedProduct.sku || "",
            currentStock: updatedProduct.stock,
            productUrl: `${shopUrl}/products/${updatedProduct.slug}`,
            adminDashboardUrl: `${shopUrl}/admin/products`,
          });
        }
      } catch (emailError) {
        console.error("Failed to send stock alert email:", emailError);
      }
    }

    res.status(200).json({
      success: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error: any) {
    // Check for unique constraint violations
    if (error.code === "P2002") {
      res.status(409).json({
        error: "A product with this SKU or slug already exists.",
        reason: "DUPLICATE_SKU",
      });
      return;
    }
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = DeleteProductInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { uid } = parsed.data;
  const { shopId } = req.auth!;

  try {
    // Check if product exists in any orders
    const orderItemsCount = await prisma.orderItem.count({
      where: { productUid: uid },
    });

    if (orderItemsCount > 0) {
      res.status(400).json({
        error: "Cannot delete product",
        message: `This product cannot be deleted because it is used in ${orderItemsCount} order(s). Products that have been ordered must be kept for record-keeping purposes.`,
        reason: "PRODUCT_IN_ORDERS",
      });
      return;
    }

    await prisma.product.deleteMany({ where: { uid, shopId } });
    res.status(200).json({ success: "Product deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMultipleProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = DeleteMultipleProductsInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { uids } = parsed.data;
  const { shopId } = req.auth!;

  try {
    // Check if any products are used in orders
    const productsInOrders = await prisma.orderItem.groupBy({
      by: ["productUid"],
      where: { productUid: { in: uids } },
      _count: { productUid: true },
    });

    if (productsInOrders.length > 0) {
      const productUidsInOrders = productsInOrders.map((p) => p.productUid);
      const totalOrders = productsInOrders.reduce(
        (sum, p) => sum + p._count.productUid,
        0,
      );

      res.status(400).json({
        error: "Cannot delete products",
        message: `${productsInOrders.length} product(s) cannot be deleted because they are used in ${totalOrders} order(s). Products that have been ordered must be kept for record-keeping purposes.`,
        reason: "PRODUCTS_IN_ORDERS",
        productsInOrders: productUidsInOrders,
      });
      return;
    }

    await prisma.product.deleteMany({ where: { uid: { in: uids }, shopId } });
    res.status(200).json({ success: "Products deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = ProductCreateInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { shopId } = req.auth!;

  try {
    const newProduct = await prisma.$transaction(async (tx) => {
      const counter = await tx.shopCounter.update({
        where: { shopId },
        data: { productCounter: { increment: 1 } },
      });

      const lastProduct = await tx.product.findFirst({
        where: { shopId },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      const newPosition = lastProduct ? lastProduct.position + 1 : 1;

      const { ...productData } = parsed.data;

      if (productData.slug === "") {
        // Generate slug from name
        productData.slug = productData.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
      }
      const product = await tx.product.create({
        data: {
          ...productData,
          uid: uuidv4(),
          shopId,
          shopScopedId: counter.productCounter,
          status: "ACTIVE",
          position: newPosition,
        },
        include: { category: true },
      });
      return product;
    });

    res
      .status(201)
      .json({ success: "Product added successfully.", product: newProduct });
  } catch (error: any) {
    // Check for unique constraint violation on the slug or sku
    if (error.code === "P2002") {
      res
        .status(409)
        .json({ error: "A product with this slug or sku already exists." });
      return;
    }
    res.status(500).json({ error: "Failed to add product." });
  }
};
