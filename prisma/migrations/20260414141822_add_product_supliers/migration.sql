/*
  Warnings:

  - A unique constraint covering the columns `[shop_id,shop_scoped_id]` on the table `product_suppliers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,api_url]` on the table `product_suppliers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shop_scoped_id` to the `product_suppliers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SupplierSourceType" AS ENUM ('EXTERNAL', 'SYSTEM_INTERNAL');

-- DropIndex
DROP INDEX "product_suppliers_api_url_key";

-- DropIndex
DROP INDEX "product_suppliers_shop_id_key";

-- AlterTable
ALTER TABLE "product_suppliers" ADD COLUMN     "api_key" JSONB,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "shop_scoped_id" INTEGER NOT NULL,
ADD COLUMN     "source_type" "SupplierSourceType" NOT NULL DEFAULT 'EXTERNAL',
ADD COLUMN     "sync" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "product_supplier_uid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "product_suppliers_shop_id_shop_scoped_id_key" ON "product_suppliers"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_suppliers_shop_id_api_url_key" ON "product_suppliers"("shop_id", "api_url");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_product_supplier_uid_fkey" FOREIGN KEY ("product_supplier_uid") REFERENCES "product_suppliers"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
