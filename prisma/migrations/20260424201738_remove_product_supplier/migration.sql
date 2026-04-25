/*
  Warnings:

  - You are about to drop the `product_suppliers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "product_suppliers" DROP CONSTRAINT "product_suppliers_shop_id_fkey";

-- DropTable
DROP TABLE "product_suppliers";
