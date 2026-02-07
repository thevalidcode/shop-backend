/*
  Warnings:

  - A unique constraint covering the columns `[shop_id,shop_scoped_id]` on the table `carts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "carts_shop_id_shop_scoped_id_key" ON "carts"("shop_id", "shop_scoped_id");
