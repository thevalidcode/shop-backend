import { registry } from "../components/registry";
import {
  SourceSuppliersQuerySchema,
  SupplierIdParamsSchema,
} from "../../schemas/supplier.schema";
import {
  ResellerSupplierImportSchema,
  ResellerSupplierSyncSchema,
} from "../../schemas/reseller.schema";
import {
  BadRequest,
  NotFound,
  ServerError,
  Unauthorized,
} from "../responses/common.response";
import {
  SupplierImportProductsResponse,
  SupplierSourceProductsResponse,
  SupplierSourceStoresResponse,
  SupplierSyncProductsResponse,
} from "../responses/reseller.response";

registry.registerPath({
  method: "get",
  path: "/reseller/suppliers",
  summary: "Get source suppliers for reseller discovery",
  tags: ["Suppliers"],
  request: {
    query: SourceSuppliersQuerySchema,
  },
  responses: {
    200: SupplierSourceStoresResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/reseller/suppliers/{supplierId}/products",
  summary: "Get source supplier products",
  tags: ["Suppliers"],
  request: {
    params: SupplierIdParamsSchema,
  },
  responses: {
    200: SupplierSourceProductsResponse,
    400: BadRequest,
    404: NotFound,
    500: ServerError,
  },
});

registry.registerPath({
  method: "post",
  path: "/internal/suppliers/import-products",
  summary:
    "Internal: import source SHOP products into authenticated target shop",
  tags: ["Suppliers"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ResellerSupplierImportSchema,
        },
      },
    },
  },
  responses: {
    200: SupplierImportProductsResponse,
    400: BadRequest,
    401: Unauthorized,
    404: NotFound,
    500: ServerError,
  },
});

registry.registerPath({
  method: "post",
  path: "/internal/suppliers/sync-products",
  summary: "Internal: sync source SHOP products into authenticated target shop",
  tags: ["Suppliers"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ResellerSupplierSyncSchema,
        },
      },
    },
  },
  responses: {
    200: SupplierSyncProductsResponse,
    400: BadRequest,
    401: Unauthorized,
    404: NotFound,
    500: ServerError,
  },
});
