/*
  Warnings:

  - You are about to drop the column `shopShopId` on the `product_suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `product_supplier_uid` on the `products` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "product_suppliers" DROP CONSTRAINT "product_suppliers_shopShopId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_product_supplier_uid_fkey";

-- AlterTable
ALTER TABLE "product_suppliers" DROP COLUMN "shopShopId";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "product_supplier_uid";

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_uid_fkey" FOREIGN KEY ("supplier_uid") REFERENCES "suppliers"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
