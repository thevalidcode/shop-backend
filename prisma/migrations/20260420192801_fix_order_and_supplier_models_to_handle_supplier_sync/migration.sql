/*
  Warnings:

  - You are about to drop the column `provider_price` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `provider_product_uid` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `sync_with_provider` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "supplier_currency" TEXT,
ADD COLUMN     "supplier_price" DECIMAL(10,2),
ADD COLUMN     "supplier_uid" TEXT;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "provider_price",
DROP COLUMN "provider_product_uid",
DROP COLUMN "sync_with_provider",
ADD COLUMN     "supplier_currency" TEXT;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_supplier_uid_fkey" FOREIGN KEY ("supplier_uid") REFERENCES "suppliers"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
