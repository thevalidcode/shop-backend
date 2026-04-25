import type { Request, Response } from "express";
import {
  DeleteMultipleSuppliersSchema,
  DeleteSupplierSchema,
  SourceSuppliersQuerySchema,
  SupplierIdParamsSchema,
  SupplierCreateRequestSchema,
  SupplierProductsQuerySchema,
  SupplierSyncProductsSchema,
  SupplierImportProductsSchema,
  SupplierUpdateRequestSchema,
} from "../schemas/supplier.schema";
import {
  ResellerSupplierImportSchema,
  ResellerSupplierSyncSchema,
} from "../schemas/reseller.schema";
import {
  createProductSupplier,
  deleteMultipleProductSuppliers,
  deleteProductSupplier,
  getProductSuppliers,
  getSupplierProducts,
  getSupplierSourceProductsBySupplier,
  importSupplierProductsToShop,
  syncSupplierProductsInShop,
  updateProductSupplier,
} from "../providers/supplier.provider";
import {
  getSupplierSourceProducts,
  getAllProductSuppliers,
  importResellerProductsBySupplier,
  syncResellerProductsBySupplier,
} from "../services/reseller.service";

export const getSourceSuppliers = async (req: Request, res: Response) => {
  const parsed = SourceSuppliersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await getAllProductSuppliers(
      {
        ...parsed.data,
        shopId: (req.auth?.shopId as number | undefined) || parsed.data.shopId,
      },
      undefined,
    );
    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch source suppliers" });
  }
};

export const getSourceSupplierProducts = async (
  req: Request,
  res: Response,
) => {
  const parsed = SupplierIdParamsSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await getSupplierSourceProducts(
      parsed.data.supplierId,
      undefined,
    );
    res.status(200).json({
      sourceSupplier: result.source,
      products: result.products,
    });
  } catch (error: any) {
    if (error.message === "SUPPLIER_NOT_FOUND") {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    res.status(500).json({
      error: error.message || "Failed to fetch supplier products",
    });
  }
};

export const importResellerProductsInternal = async (
  req: Request,
  res: Response,
) => {
  const parsed = ResellerSupplierImportSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (!req.auth?.shopId) {
    res.status(401).json({ error: "Unauthorized request" });
    return;
  }

  try {
    const result = await importResellerProductsBySupplier(
      req.auth.shopId,
      parsed.data,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === "SUPPLIER_NOT_FOUND") {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    res.status(500).json({
      error: error.message || "Failed to import reseller products",
    });
  }
};

export const syncResellerProductsInternal = async (
  req: Request,
  res: Response,
) => {
  const parsed = ResellerSupplierSyncSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (!req.auth?.shopId) {
    res.status(401).json({ error: "Unauthorized request" });
    return;
  }

  try {
    const result = await syncResellerProductsBySupplier(
      req.auth.shopId,
      parsed.data,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === "SUPPLIER_NOT_FOUND") {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    res.status(500).json({
      error: error.message || "Failed to sync reseller products",
    });
  }
};

export const getSuppliers = async (req: Request, res: Response) => {
  if (!req.auth?.shopId) {
    res.status(401).json({ error: "Unauthorized request" });
    return;
  }

  try {
    const result = await getProductSuppliers(req.auth.shopId);
    res.status(200).json({ suppliers: result });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch suppliers" });
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  const parsed = SupplierCreateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (!req.auth?.shopId) {
    res.status(401).json({ error: "Unauthorized request" });
    return;
  }

  try {
    const result = await createProductSupplier(req.auth.shopId, parsed.data);
    res.status(201).json({ success: true, supplier: result });
  } catch (error: any) {
    if (error.message === "SUPPLIER_ALREADY_EXISTS") {
      res.status(409).json({ error: "Supplier URL already exists" });
      return;
    }

    if (error.message === "SUPPLIER_URL_UNREACHABLE") {
      res.status(400).json({
        error: "Supplier URL could not be reached",
        message:
          "Please enter a valid supplier website that responds successfully.",
      });
      return;
    }

    res
      .status(500)
      .json({ error: error.message || "Failed to create supplier" });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  const parsed = SupplierUpdateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (!req.auth?.shopId) {
    res.status(401).json({ error: "Unauthorized request" });
    return;
  }

  try {
    const result = await updateProductSupplier(req.auth.shopId, parsed.data);
    res.status(200).json({ success: true, supplier: result });
  } catch (error: any) {
    if (error.message === "SUPPLIER_NOT_FOUND") {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    if (error.message === "SUPPLIER_URL_UNREACHABLE") {
      res.status(400).json({
        error: "Supplier URL could not be reached",
        message:
          "Please enter a valid supplier website that responds successfully.",
      });
      return;
    }

    res
      .status(500)
      .json({ error: error.message || "Failed to update supplier" });
  }
};

export const removeSupplier = async (req: Request, res: Response) => {
  const parsed = DeleteSupplierSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (!req.auth?.shopId) {
    res.status(401).json({ error: "Unauthorized request" });
    return;
  }

  try {
    await deleteProductSupplier(req.auth.shopId, parsed.data.uid);
    res.status(200).json({ success: true });
  } catch (error: any) {
    if (error.message === "SUPPLIER_NOT_FOUND") {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    res
      .status(500)
      .json({ error: error.message || "Failed to delete supplier" });
  }
};

export const removeMultipleSuppliers = async (req: Request, res: Response) => {
  const parsed = DeleteMultipleSuppliersSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (!req.auth?.shopId) {
    res.status(401).json({ error: "Unauthorized request" });
    return;
  }

  try {
    await deleteMultipleProductSuppliers(req.auth.shopId, parsed.data.uids);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to delete suppliers" });
  }
};

export const getSupplierProductsAdmin = async (req: Request, res: Response) => {
  const parsed = SupplierProductsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (!req.auth?.shopId) {
    res.status(401).json({ error: "Unauthorized request" });
    return;
  }

  try {
    const result = await getSupplierProducts(
      req.auth.shopId,
      parsed.data.supplierUid,
    );
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "SUPPLIER_NOT_FOUND") {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    res
      .status(500)
      .json({ error: error.message || "Failed to fetch supplier products" });
  }
};

export const getSupplierSourceProductsAdmin = async (
  req: Request,
  res: Response,
) => {
  const parsed = SupplierProductsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (!req.auth?.shopId) {
    res.status(401).json({ error: "Unauthorized request" });
    return;
  }

  try {
    const result = await getSupplierSourceProductsBySupplier(
      req.auth.shopId,
      parsed.data.supplierUid,
    );
    res.status(200).json({
      sourceStore: result.source,
      products: result.products,
    });
  } catch (error: any) {
    if (error.message === "SUPPLIER_NOT_FOUND") {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    res.status(500).json({
      error: error.message || "Failed to fetch supplier source products",
    });
  }
};

export const importSupplierProducts = async (req: Request, res: Response) => {
  const parsed = SupplierImportProductsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (!req.auth?.shopId) {
    res.status(401).json({ error: "Unauthorized request" });
    return;
  }

  try {
    const result = await importSupplierProductsToShop(
      req.auth.shopId,
      parsed.data,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === "SUPPLIER_NOT_FOUND") {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    res
      .status(500)
      .json({ error: error.message || "Failed to import supplier products" });
  }
};

export const syncSupplierProducts = async (req: Request, res: Response) => {
  const parsed = SupplierSyncProductsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (!req.auth?.shopId) {
    res.status(401).json({ error: "Unauthorized request" });
    return;
  }

  try {
    const result = await syncSupplierProductsInShop(
      req.auth.shopId,
      parsed.data,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === "SUPPLIER_NOT_FOUND") {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    res
      .status(500)
      .json({ error: error.message || "Failed to sync supplier products" });
  }
};
