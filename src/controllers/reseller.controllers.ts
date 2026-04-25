import type { Request, Response } from "express";
import {
  SourceSuppliersQuerySchema,
  SupplierIdParamsSchema,
} from "../schemas/supplier.schema";
import {
  getSupplierSourceProducts,
  getAllProductSuppliers,
} from "../services/reseller.service";


export const getSourceSuppliers = async (req: Request, res: Response) => {
  const parsed = SourceSuppliersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await getAllProductSuppliers(parsed.data, true);
    res.status(200).json(result);
  } catch (error: any) {
    console.log(error);
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
      true,
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
