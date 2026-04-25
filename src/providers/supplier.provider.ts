import axios from "axios";
import https from "https";
import crypto from "crypto";
import { Decimal } from "@prisma/client/runtime/client";
import { v4 as uuidv4 } from "uuid";
import ogs from "open-graph-scraper";
import { prisma } from "../config/db.config";
import { coreApiRequest } from "../lib/apiClient";
import { decryptKey, encryptKey } from "../utils/encrypt";
import type {
  MarginType,
  SupplierCreateInput,
  SupplierImportProductsInput,
  SupplierSyncProductsInput,
  SupplierUpdateInput,
} from "../schemas/supplier.schema";

export const agent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

type CoreResellerStore = {
  uid: string;
  name: string;
  url: string;
  image: string | null;
  type: "SHOP";
  storeId?: number;
  isActive: boolean;
  isInternal: boolean;
};

const hashApiKey = (key: string) =>
  crypto.createHash("sha256").update(key).digest("hex");

export const toDecimal = (value: string | number | Decimal, fallback = "0") =>
  new Decimal(Number.isFinite(Number(value)) ? value : fallback);

function normalizeApiUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/^https?:\/\//, "");
  return trimmed.replace(/\/$/, "");
}

function toSourceShopUid(apiUrl: string): string {
  const normalized = normalizeApiUrl(apiUrl);

  // Remove "api." if present
  const noApi = normalized.replace(/^api\./, "");

  // Extract only the domain (before first "/")
  const domain = noApi.split("/")[0];

  return domain;
}

async function verifyExternalSupplierUrl(normalizedUrl: string) {
  try {
    await axios.get(`https://${normalizedUrl}`, {
      httpsAgent: agent,
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400,
      headers: {
        "User-Agent": "ValidPanel-Supplier-Check/1.0",
      },
    });
  } catch (error) {
    throw new Error("SUPPLIER_URL_UNREACHABLE");
  }
}

export function getMargins(
  sourcePrice: Decimal,
  marginType: MarginType,
  marginValue: number,
) {
  if (marginType === "fixed") {
    return sourcePrice.plus(new Decimal(marginValue)).toDecimalPlaces(2);
  }

  return sourcePrice
    .plus(sourcePrice.mul(new Decimal(marginValue)).div(100))
    .toDecimalPlaces(2);
}

async function resolveSupplierKey(supplier: {
  apiKey: unknown;
  isInternal: boolean;
}) {
  if (supplier.isInternal) {
    return null;
  }

  if (!supplier.apiKey || typeof supplier.apiKey !== "object") {
    throw new Error("SUPPLIER_API_KEY_REQUIRED");
  }

  const apiKeyData = supplier.apiKey as { encrypted_key: string; iv: string };
  return decryptKey(apiKeyData.encrypted_key, apiKeyData.iv);
}

async function getInternalSourceShop(sourceShopUid: string) {
  const shop = await prisma.shop.findFirst({
    where: { uid: sourceShopUid },
    select: { shopId: true, uid: true, name: true },
  });

  if (!shop) {
    throw new Error("SHOP_NOT_FOUND");
  }

  return shop;
}

export async function fetchCoreResellerStores() {
  const response = await coreApiRequest<{
    stores: CoreResellerStore[];
    meta: { total: number; page: number; pages: number; limit: number };
  }>({
    endpoint: "/internal/reseller-stores",
    params: {
      type: "SHOP",
      page: 1,
      limit: 100,
    },
  });

  return response.stores;
}

export const getCoreResellerStoreByUid = async (uid: string) => {
  const stores = await fetchCoreResellerStores();
  return stores.find((store) => store.uid === uid);
};

async function fetchSourceProductsForSupplier(supplierUid: string) {
  const supplier = await prisma.supplier.findFirst({
    where: { uid: supplierUid },
  });

  if (!supplier) {
    throw new Error("SUPPLIER_NOT_FOUND");
  }

  if (supplier.isInternal) {
    const sourceShopUid = toSourceShopUid(supplier.apiUrl);
    const sourceShop = await getInternalSourceShop(sourceShopUid);

    const products = await prisma.product.findMany({
      where: {
        shopId: sourceShop.shopId,
        status: "ACTIVE",
      },
      orderBy: { position: "asc" },
      select: {
        uid: true,
        name: true,
        description: true,
        slug: true,
        imageUrl: true,
        galleryUrls: true,
        price: true,
        currency: true,
        min: true,
        max: true,
        status: true,
        stock: true,
        tags: true,
        brand: true,
        categoryUid: true,
      },
    });

    return {
      source: sourceShop,
      products: products.map((product) => ({
        productId: product.uid,
        name: product.name,
        description: product.description,
        slug: product.slug,
        imageUrl: product.imageUrl,
        galleryUrls: product.galleryUrls,
        price: Number(product.price),
        currency: product.currency,
        min: product.min,
        max: product.max,
        status: product.status === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "ACTIVE",
        stock: product.stock,
        tags: product.tags,
        brand: product.brand,
        categoryUid: product.categoryUid,
      })),
    };
  }

  const apiKey = await resolveSupplierKey(supplier);
  const { data } = await axios.post(
    `https://${normalizeApiUrl(supplier.apiUrl)}`,
    { action: "products", key: apiKey },
    { httpsAgent: agent },
  );

  const source = await prisma.shop.findFirst({
    where: { uid: normalizeApiUrl(supplier.apiUrl) },
    select: { shopId: true, uid: true, name: true },
  });

  return {
    source: source ?? {
      shopId: 0,
      uid: normalizeApiUrl(supplier.apiUrl),
      name: supplier.name,
    },
    products: Array.isArray(data?.data ?? data)
      ? (data.data ?? data).map((product: Record<string, unknown>) => ({
          productId: String(product.uid ?? product.productId ?? product.id),
          name: String(product.name ?? "Untitled Product"),
          description:
            product.description === undefined
              ? null
              : (product.description as string | null),
          slug: String(product.slug ?? ""),
          imageUrl: (product.imageUrl as string | null | undefined) ?? null,
          galleryUrls: Array.isArray(product.galleryUrls)
            ? (product.galleryUrls as string[])
            : [],
          price: Number(product.price ?? 0),
          currency: String(product.currency ?? "USD"),
          min: Number(product.min ?? 1),
          max: Number(product.max ?? 1),
          status:
            String(product.status ?? "ACTIVE").toUpperCase() === "OUT_OF_STOCK"
              ? "OUT_OF_STOCK"
              : "ACTIVE",
          stock: Number(product.stock ?? 0),
          tags: Array.isArray(product.tags) ? (product.tags as string[]) : [],
          brand: (product.brand as string | null | undefined) ?? null,
          categoryUid:
            (product.categoryUid as string | null | undefined) ?? null,
        }))
      : [],
  };
}

export async function getProductSuppliers(shopId: number) {
  const suppliers = await prisma.supplier.findMany({
    where: { shopId },
    orderBy: [{ createdAt: "desc" }],
  });

  return suppliers.map((supplier) => ({
    id: supplier.id,
    shopScopedId: supplier.shopScopedId,
    uid: supplier.uid,
    name: supplier.name,
    image: supplier.image,
    apiUrl: supplier.apiUrl,
    percentage: supplier.percentage,
    sync: supplier.sync,
    isInternal: supplier.isInternal,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
  }));
}

export async function createProductSupplier(
  shopId: number,
  data: SupplierCreateInput,
) {
  const isInternal = data.isInternal ?? false;
  const normalizedUrl = isInternal
    ? data.url.trim().replace(/^https?:\/\//, "")
    : normalizeApiUrl(data.url);

  if (!isInternal) {
    await verifyExternalSupplierUrl(normalizedUrl);
  }

  const existing = await prisma.supplier.findFirst({
    where: { shopId, apiUrl: normalizedUrl },
    select: { uid: true },
  });

  if (existing) {
    throw new Error("SUPPLIER_ALREADY_EXISTS");
  }

  // Extract favicon/logo for external suppliers, otherwise keep provided/default image.
  let supplierImage = data.image;
  if (!isInternal) {
    try {
      const { result } = await ogs({ url: `https://${normalizedUrl}` });

      if (!result.success) {
        throw new Error("SUPPLIER_URL_UNREACHABLE");
      }

      if (result.favicon) {
        supplierImage = result.favicon.startsWith("http")
          ? result.favicon
          : `https://${normalizedUrl}${result.favicon.startsWith("/") ? "" : "/"}${
              result.favicon
            }`;
      } else if (result.ogImage && result.ogImage.length > 0) {
        supplierImage = result.ogImage[0].url;
      }
    } catch (scrapeErr) {
      if (
        scrapeErr instanceof Error &&
        scrapeErr.message === "SUPPLIER_URL_UNREACHABLE"
      ) {
        throw scrapeErr;
      }
    }
  }

  await coreApiRequest({
    endpoint: "/internal/reseller-stores",
    method: "POST",
    data: {
      name: data.name,
      url: normalizedUrl,
      type: "SHOP",
      image: supplierImage || null,
      isActive: true,
      isInternal: false,
    },
  });

  const encryptedApiKey = encryptKey(data.apiKey);
  const supplier = await prisma.$transaction(async (tx) => {
    const counter = await tx.shopCounter.update({
      where: { shopId },
      data: { supplierCounter: { increment: 1 } },
      select: { supplierCounter: true },
    });

    return tx.supplier.create({
      data: {
        shopId,
        name: data.name,
        shopScopedId: counter.supplierCounter,
        image: supplierImage || null,
        apiUrl: normalizedUrl,
        percentage: data.percentage ?? 0,
        apiKey: {
          encrypted_key: encryptedApiKey.encryptedKey,
          iv: encryptedApiKey.iv,
          hash: hashApiKey(data.apiKey),
        },
        sync: data.sync ?? true,
        isInternal: false,
      },
    });
  });

  return supplier;
}

export async function updateProductSupplier(
  shopId: number,
  data: SupplierUpdateInput,
) {
  const supplier = await prisma.supplier.findFirst({
    where: { uid: data.uid, shopId },
  });

  if (!supplier) {
    throw new Error("SUPPLIER_NOT_FOUND");
  }

  const encryptedApiKey = encryptKey(data.apiKey);
  // isInternal is intentionally NOT updated - preserve the original type
  const isInternal = supplier.isInternal;
  const resolvedUrl =
    data.url !== undefined
      ? isInternal
        ? data.url.trim().replace(/^https?:\/\//, "")
        : normalizeApiUrl(data.url)
      : undefined;

  if (isInternal && resolvedUrl !== undefined) {
    await verifyExternalSupplierUrl(resolvedUrl);
  }

  const updated = await prisma.supplier.updateMany({
    where: { uid: data.uid, shopId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(resolvedUrl !== undefined ? { apiUrl: resolvedUrl } : {}),
      ...(data.percentage !== undefined ? { percentage: data.percentage } : {}),
      ...(data.image !== undefined ? { image: data.image } : {}),
      ...(data.sync !== undefined ? { sync: data.sync } : {}),
      apiKey: {
        encrypted_key: encryptedApiKey.encryptedKey,
        iv: encryptedApiKey.iv,
        hash: hashApiKey(data.apiKey),
      },
    },
  });

  return updated;
}

export async function getSupplierSourceProductsBySupplier(
  shopId: number,
  supplierUid: string,
) {
  const supplier = await prisma.supplier.findFirst({
    where: { uid: supplierUid, shopId },
  });

  if (!supplier) {
    throw new Error("SUPPLIER_NOT_FOUND");
  }

  return fetchSourceProductsForSupplier(supplier.uid);
}

export async function deleteProductSupplier(shopId: number, uid: string) {
  const deleted = await prisma.supplier.deleteMany({
    where: { uid, shopId },
  });

  if (deleted.count === 0) {
    throw new Error("SUPPLIER_NOT_FOUND");
  }
}

export async function deleteMultipleProductSuppliers(
  shopId: number,
  uids: string[],
) {
  await prisma.supplier.deleteMany({
    where: { uid: { in: uids }, shopId },
  });
}

export async function getSupplierProducts(shopId: number, supplierUid: string) {
  const supplier = await prisma.supplier.findFirst({
    where: { uid: supplierUid, shopId },
  });

  if (!supplier) {
    throw new Error("SUPPLIER_NOT_FOUND");
  }

  // Only return products that are linked to this supplier (already imported)
  const linkedProducts = await prisma.product.findMany({
    where: {
      shopId,
      supplierUid: supplier.uid,
      status: "ACTIVE",
    },
    orderBy: { timestamp: "desc" },
    select: {
      uid: true,
      name: true,
      description: true,
      slug: true,
      imageUrl: true,
      galleryUrls: true,
      price: true,
      currency: true,
      min: true,
      max: true,
      stock: true,
      tags: true,
      brand: true,
      categoryUid: true,
    },
  });

  return {
    products: linkedProducts.map((product) => ({
      productId: product.uid,
      name: product.name,
      description: product.description,
      slug: product.slug,
      imageUrl: product.imageUrl,
      galleryUrls: product.galleryUrls,
      price: Number(product.price),
      currency: product.currency,
      min: product.min,
      max: product.max,
      stock: product.stock,
      tags: product.tags,
      brand: product.brand,
      categoryUid: product.categoryUid,
    })),
  };
}

export async function importSupplierProductsToShop(
  shopId: number,
  input: SupplierImportProductsInput,
) {
  const supplier = await prisma.supplier.findFirst({
    where: { uid: input.supplierUid, shopId },
  });

  if (!supplier) {
    throw new Error("SUPPLIER_NOT_FOUND");
  }

  const source = await fetchSourceProductsForSupplier(supplier.uid);
  const selectedIds = new Set(input.productIds);
  const selectedProducts = source.products.filter(
    (product: (typeof source.products)[number]) =>
      selectedIds.has(product.productId),
  );

  if (!selectedProducts.length) {
    return {
      supplierUid: supplier.uid,
      targetShopId: shopId,
      marginType: input.marginType,
      marginValue: input.marginValue,
      totalSourceProducts: source.products.length,
      created: 0,
      updated: 0,
    };
  }

  let created = 0;
  let updated = 0;

  await prisma.$transaction(async (tx) => {
    for (const product of selectedProducts) {
      const existing = await tx.product.findFirst({
        where: {
          shopId,
          supplierUid: supplier.uid,
          supplierProductUid: product.productId,
        },
        select: { uid: true, id: true },
      });

      const sourcePrice = toDecimal(product.price);
      const price = getMargins(
        sourcePrice,
        input.marginType,
        input.marginValue,
      );

      if (existing) {
        await tx.product.update({
          where: { uid: existing.uid },
          data: {
            name: product.name,
            description: product.description,
            slug: product.slug || existing.uid,
            imageUrl: product.imageUrl,
            galleryUrls: product.galleryUrls,
            price,
            currency: product.currency,
            min: product.min,
            max: product.max,
            stock: product.stock,
            status:
              product.status === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "ACTIVE",
            tags: product.tags,
            brand: product.brand,
            supplierPrice: sourcePrice,
            supplierUid: supplier.uid,
            supplierProductUid: product.productId,
            supplierCurrency: product.currency,
            syncWithSupplier: true,
            syncQuantity: true,
            syncCatAndName: true,
            marginType: input.marginType,
            marginValue: new Decimal(input.marginValue),
          },
        });
        updated++;
        continue;
      }

      const counter = await tx.shopCounter.update({
        where: { shopId },
        data: { productCounter: { increment: 1 } },
        select: { productCounter: true },
      });

      await tx.product.create({
        data: {
          uid: uuidv4(),
          shopId,
          shopScopedId: counter.productCounter,
          name: product.name,
          description: product.description,
          slug:
            product.slug ||
            `${product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${product.productId.slice(0, 8)}`,
          imageUrl: product.imageUrl,
          galleryUrls: product.galleryUrls,
          price,
          currency: product.currency,
          min: product.min,
          max: product.max,
          stock: product.stock,
          status: product.status === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "ACTIVE",
          tags: product.tags,
          brand: product.brand,
          supplierPrice: sourcePrice,
          supplierUid: supplier.uid,
          supplierProductUid: product.productId,
          supplierCurrency: product.currency,
          syncWithSupplier: true,
          syncQuantity: true,
          syncCatAndName: true,
          marginType: input.marginType,
          marginValue: new Decimal(input.marginValue),
        },
      });
      created++;
    }
  });

  return {
    supplierUid: supplier.uid,
    targetShopId: shopId,
    marginType: input.marginType,
    marginValue: input.marginValue,
    totalSourceProducts: source.products.length,
    created,
    updated,
  };
}

export async function syncSupplierProductsInShop(
  shopId: number,
  input: SupplierSyncProductsInput,
) {
  const supplier = await getCoreResellerStoreByUid(input.supplierUid);

  if (!supplier) {
    throw new Error("SUPPLIER_NOT_FOUND");
  }

  const source = await fetchSourceProductsForSupplier(supplier.uid);
  const localProducts = await prisma.product.findMany({
    where: { shopId, supplierUid: supplier.uid },
  });
  type SourceProduct = (typeof source.products)[number];

  const sourceProductsById = new Map<string, SourceProduct>(
    source.products.map((product: SourceProduct) => [
      product.productId,
      product,
    ]),
  );

  let updated = 0;
  let created = 0;

  await prisma.$transaction(async (tx) => {
    for (const localProduct of localProducts) {
      const sourceProduct = localProduct.supplierProductUid
        ? sourceProductsById.get(localProduct.supplierProductUid)
        : undefined;

      if (!sourceProduct) {
        await tx.product.update({
          where: { uid: localProduct.uid },
          data: { status: "OUT_OF_STOCK" },
        });
        continue;
      }

      const sourcePrice = toDecimal(sourceProduct.price);
      const price = getMargins(
        sourcePrice,
        input.marginType,
        input.marginValue,
      );

      await tx.product.update({
        where: { uid: localProduct.uid },
        data: {
          ...(localProduct.syncCatAndName
            ? {
                name: sourceProduct.name,
                description: sourceProduct.description,
                slug: sourceProduct.slug || localProduct.slug,
                categoryUid:
                  sourceProduct.categoryUid || localProduct.categoryUid,
              }
            : {}),
          imageUrl: sourceProduct.imageUrl,
          galleryUrls: sourceProduct.galleryUrls,
          price,
          currency: sourceProduct.currency,
          min: sourceProduct.min,
          max: sourceProduct.max,
          ...(localProduct.syncQuantity ? { stock: sourceProduct.stock } : {}),
          status:
            sourceProduct.status === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "ACTIVE",
          tags: sourceProduct.tags,
          brand: sourceProduct.brand,
          supplierPrice: sourcePrice,
          supplierCurrency: sourceProduct.currency,
          marginType: input.marginType,
          marginValue: new Decimal(input.marginValue),
        },
      });
      updated++;
    }

    const linkedProductIds = new Set(
      localProducts.map((product) => product.supplierProductUid),
    );
    for (const sourceProduct of source.products) {
      if (linkedProductIds.has(sourceProduct.productId)) {
        continue;
      }

      const sourcePrice = toDecimal(sourceProduct.price);
      const price = getMargins(
        sourcePrice,
        input.marginType,
        input.marginValue,
      );
      const counter = await tx.shopCounter.update({
        where: { shopId },
        data: { productCounter: { increment: 1 } },
        select: { productCounter: true },
      });

      await tx.product.create({
        data: {
          uid: uuidv4(),
          shopId,
          shopScopedId: counter.productCounter,
          name: sourceProduct.name,
          description: sourceProduct.description,
          slug:
            sourceProduct.slug ||
            `${sourceProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${sourceProduct.productId.slice(0, 8)}`,
          imageUrl: sourceProduct.imageUrl,
          galleryUrls: sourceProduct.galleryUrls,
          price,
          currency: sourceProduct.currency,
          min: sourceProduct.min,
          max: sourceProduct.max,
          stock: sourceProduct.stock,
          status:
            sourceProduct.status === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "ACTIVE",
          tags: sourceProduct.tags,
          brand: sourceProduct.brand,
          supplierPrice: sourcePrice,
          supplierUid: supplier.uid,
          supplierProductUid: sourceProduct.productId,
          supplierCurrency: sourceProduct.currency,
          syncWithSupplier: true,
          syncQuantity: true,
          syncCatAndName: true,
          marginType: input.marginType,
          marginValue: new Decimal(input.marginValue),
        },
      });
      created++;
    }
  });

  return {
    supplierUid: supplier.uid,
    targetShopId: shopId,
    marginType: input.marginType,
    marginValue: input.marginValue,
    totalSourceProducts: source.products.length,
    created,
    updated,
    syncedAt: new Date().toISOString(),
  };
}

export async function updateExistingSupplierProducts(): Promise<void> {
  const suppliers = await prisma.supplier.findMany({
    where: { sync: true },
  });

  for (const supplier of suppliers) {
    try {
      await syncSupplierProductsInShop(supplier.shopId, {
        supplierUid: supplier.uid,
        marginType: "percentage",
        marginValue: supplier.percentage,
      });
    } catch (error) {
      console.error("Error updating supplier products:", error);
    }
  }
}

export async function syncAllSupplierProducts(): Promise<void> {
  await updateExistingSupplierProducts();
}
