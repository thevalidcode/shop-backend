import { Decimal } from "@prisma/client/runtime/client";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/db.config";
import type { SupplierProduct } from "../schemas/supplier.schema";
import type {
  ResellerSupplierImportInput,
  ResellerSupplierSyncInput,
} from "../schemas/reseller.schema";
import {
  fetchCoreResellerStores,
  getCoreResellerStoreByUid,
  getMargins,
  toDecimal,
} from "../providers/supplier.provider";
import { decryptKey, encryptKey } from "../utils/encrypt";
import { ProductStatus } from "../../prisma/generated";

const hashApiKey = (key: string) =>
  crypto.createHash("sha256").update(key).digest("hex");

/* ---------------------------------- */
/* GET SUPPLIERS */
/* ---------------------------------- */
export async function getAllProductSuppliers(
  input: { page: number; limit: number; search?: string; shopId?: number },
  isInternal?: boolean,
) {
  const filter = input.search?.toLowerCase().trim();

  let shop = null;
  if (input.shopId) {
    shop = await prisma.shop.findUnique({
      where: { shopId: input.shopId },
      select: { uid: true },
    });
    if (!shop) throw new Error("SHOP_NOT_FOUND");
  }

  const stores = await fetchCoreResellerStores();

  const filtered = stores.filter((s) => {
    if (isInternal !== undefined && s.isInternal !== isInternal) return false;
    if (shop && s.url === `api.${shop.uid}/v2`) return false;
    if (filter) {
      return (
        s.name.toLowerCase().includes(filter) ||
        s.url.toLowerCase().includes(filter)
      );
    }
    return true;
  });

  const start = (input.page - 1) * input.limit;

  return {
    suppliers: filtered.slice(start, start + input.limit),
    meta: {
      total: filtered.length,
      page: input.page,
      pages: Math.ceil(filtered.length / input.limit),
      limit: input.limit,
    },
  };
}

/* ---------------------------------- */
/* GET SOURCE PRODUCTS */
/* ---------------------------------- */
export async function getSupplierSourceProducts(
  supplierId: string,
  isInternal?: boolean,
) {
  const supplier = await getCoreResellerStoreByUid(supplierId);
  if (!supplier) throw new Error("SUPPLIER_NOT_FOUND");

  if (isInternal !== undefined && supplier.isInternal !== isInternal) {
    throw new Error("SUPPLIER_NOT_FOUND");
  }

  const products = await prisma.product.findMany({
    where: { shopId: supplier.storeId, status: "ACTIVE" },
    orderBy: { position: "asc" },
  });

  return {
    source: supplier,
    products: products.map(mapProduct),
  };
}

/* ---------------------------------- */
/* INTERNAL FETCH */
/* ---------------------------------- */
async function fetchInternalSupplierProducts(supplierId: string) {
  const supplier = await getCoreResellerStoreByUid(supplierId);

  if (!supplier) throw new Error("SUPPLIER_NOT_FOUND");
  if (!supplier.isInternal) throw new Error("NOT_INTERNAL_SUPPLIER");

  const products = await prisma.product.findMany({
    where: { shopId: supplier.storeId, status: "ACTIVE" },
  });

  return {
    supplier,
    products: products.map(mapProduct) as SupplierProduct[],
  };
}

/* ---------------------------------- */
/* IMPORT */
/* ---------------------------------- */
export async function importResellerProductsBySupplier(
  shopId: number,
  input: ResellerSupplierImportInput,
) {
  const { supplierId, marginType, marginValue } = input;

  const { supplier, products } =
    await fetchInternalSupplierProducts(supplierId);

  let supplierRecord = await prisma.supplier.findUnique({
    where: { shopId_apiUrl: { shopId, apiUrl: supplier.url } },
  });

  // Create supplier if missing
  if (!supplierRecord) {
    // Existing user on the supplier's shop with the same email
    const existingUser = await prisma.user.findFirst({
      where: { shopId: supplier.storeId, email: input.user.email },
    });

    let apiKey: string;

    if (!existingUser) {
      apiKey = uuidv4();

      await prisma.$transaction(async (tx) => {
        const counter = await tx.shopCounter.update({
          where: { shopId },
          data: { userCounter: { increment: 1 } },
        });

        const { encryptedKey, iv } = encryptKey(apiKey);

        await tx.user.create({
          data: {
            shopId,
            shopScopedId: counter.userCounter,
            email: input.user.email,
            fullName: input.user.fullName,
            phone: input.user.phoneNumber,
            username: input.user.username!,
            password: crypto.randomUUID(),
            uid: uuidv4(),
            encryptedApiKey: encryptedKey,
            apiKeyIv: iv,
            apiKeyHash: hashApiKey(apiKey),
          },
        });
      });
    } else {
      apiKey = decryptKey(
        existingUser.encryptedApiKey!,
        existingUser.apiKeyIv!,
      );
    }

    const encrypted = encryptKey(apiKey);

    supplierRecord = await prisma.$transaction(async (tx) => {
      const counter = await tx.shopCounter.update({
        where: { shopId },
        data: { supplierCounter: { increment: 1 } },
      });

      return tx.supplier.create({
        data: {
          shopId,
          name: supplier.name,
          shopScopedId: counter.supplierCounter,
          image: supplier.image,
          apiUrl: supplier.url,
          percentage: marginType === "percentage" ? marginValue : 0,
          apiKey: {
            encrypted_key: encrypted.encryptedKey,
            iv: encrypted.iv,
            hash: hashApiKey(apiKey),
          },
          isInternal: true,
        },
      });
    });
  }

  // Fetch existing products correctly
  const existingProducts = await prisma.product.findMany({
    where: { shopId },
    select: { uid: true, supplierProductUid: true, slug: true },
  });

  const existingMap = new Map(
    existingProducts.map((p) => [p.supplierProductUid, p]),
  );

  let created = 0;
  let updated = 0;

  await prisma.$transaction(async (tx) => {
    for (const sp of products) {
      const sourcePrice = toDecimal(sp.price);
      const price = getMargins(sourcePrice, marginType, marginValue);

      const existing = existingMap.get(sp.productId);

      if (existing) {
        await tx.product.update({
          where: { uid: existing.uid },
          data: buildProductData(
            sp,
            price,
            sourcePrice,
            marginType,
            marginValue,
          ),
        });
        updated++;
      } else {
        const counter = await tx.shopCounter.update({
          where: { shopId },
          data: { productCounter: { increment: 1 } },
        });

        await tx.product.create({
          data: {
            uid: uuidv4(),
            shopId,
            shopScopedId: counter.productCounter,
            slug: generateSlug(sp),
            ...buildProductData(
              sp,
              price,
              sourcePrice,
              marginType,
              marginValue,
            ),
          },
        });
        created++;
      }
    }
  });

  return {
    supplierId,
    totalSourceProducts: products.length,
    created,
    updated,
  };
}

/* ---------------------------------- */
/* SYNC */
/* ---------------------------------- */
export async function syncResellerProductsBySupplier(
  shopId: number,
  input: ResellerSupplierSyncInput,
) {
  const result = await importResellerProductsBySupplier(shopId, input);
  return { ...result, syncedAt: new Date().toISOString() };
}

/* ---------------------------------- */
/* HELPERS */
/* ---------------------------------- */

function mapProduct(product: any) {
  return {
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
  };
}

function buildProductData(
  sp: SupplierProduct,
  price: Decimal,
  sourcePrice: Decimal,
  marginType: string,
  marginValue: number,
) {
  return {
    name: sp.name,
    description: sp.description,
    imageUrl: sp.imageUrl,
    galleryUrls: sp.galleryUrls,
    price,
    currency: sp.currency,
    min: sp.min,
    max: sp.max,
    stock: sp.stock,
    status:
      sp.status === "OUT_OF_STOCK"
        ? "OUT_OF_STOCK"
        : ("ACTIVE" as ProductStatus),
    tags: sp.tags,
    brand: sp.brand,
    supplierPrice: sourcePrice,
    supplierProductUid: sp.productId,
    supplierCurrency: sp.currency,
    syncWithSupplier: true,
    marginType,
    marginValue: new Decimal(marginValue),
  };
}

function generateSlug(sp: SupplierProduct) {
  return (
    sp.slug ||
    `${sp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${sp.productId.slice(
      0,
      6,
    )}`
  );
}
