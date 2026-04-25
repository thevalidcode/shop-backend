/*
  Warnings:

  - You are about to drop the column `api_key` on the `product_suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `api_url` on the `product_suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `product_suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `percentage` on the `product_suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `shop_id` on the `product_suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `shop_scoped_id` on the `product_suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `source_type` on the `product_suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `sync` on the `product_suppliers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[url]` on the table `product_suppliers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `url` to the `product_suppliers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "product_suppliers" DROP CONSTRAINT "product_suppliers_shop_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_product_supplier_uid_fkey";

-- DropIndex
DROP INDEX "product_suppliers_shop_id_api_url_key";

-- DropIndex
DROP INDEX "product_suppliers_shop_id_shop_scoped_id_key";

-- AlterTable
ALTER TABLE "product_suppliers" DROP COLUMN "api_key",
DROP COLUMN "api_url",
DROP COLUMN "is_active",
DROP COLUMN "percentage",
DROP COLUMN "shop_id",
DROP COLUMN "shop_scoped_id",
DROP COLUMN "source_type",
DROP COLUMN "sync",
ADD COLUMN     "shopShopId" INTEGER,
ADD COLUMN     "url" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "suppliers" (
    "id" SERIAL NOT NULL,
    "shop_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "api_url" TEXT NOT NULL,
    "api_key" JSONB,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sync" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "source_type" "SupplierSourceType" NOT NULL DEFAULT 'EXTERNAL',
    "shop_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_uid_key" ON "suppliers"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_shop_id_shop_scoped_id_key" ON "suppliers"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_shop_id_api_url_key" ON "suppliers"("shop_id", "api_url");

-- CreateIndex
CREATE UNIQUE INDEX "product_suppliers_url_key" ON "product_suppliers"("url");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_product_supplier_uid_fkey" FOREIGN KEY ("product_supplier_uid") REFERENCES "suppliers"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_suppliers" ADD CONSTRAINT "product_suppliers_shopShopId_fkey" FOREIGN KEY ("shopShopId") REFERENCES "shops"("shop_id") ON DELETE SET NULL ON UPDATE CASCADE;
