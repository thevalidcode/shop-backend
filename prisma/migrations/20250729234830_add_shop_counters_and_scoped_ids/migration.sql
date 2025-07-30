/*
  Warnings:

  - You are about to drop the column `shopScopedId` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the column `shopScopedId` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `shopScopedId` on the `email_logs` table. All the data in the column will be lost.
  - You are about to drop the column `shopScopedId` on the `faqs` table. All the data in the column will be lost.
  - You are about to drop the column `shopScopedId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shopScopedId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `store_counters` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[shop_id,shop_scoped_id]` on the table `blogs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shop_scoped_id]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shop_scoped_id]` on the table `email_logs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shop_scoped_id]` on the table `faqs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shop_scoped_id]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shop_scoped_id]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shop_scoped_id` to the `blogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop_scoped_id` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop_scoped_id` to the `email_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop_scoped_id` to the `faqs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop_scoped_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop_scoped_id` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."store_counters" DROP CONSTRAINT "store_counters_shopId_fkey";

-- DropIndex
DROP INDEX "public"."blogs_shop_id_shopScopedId_key";

-- DropIndex
DROP INDEX "public"."categories_shop_id_shopScopedId_key";

-- DropIndex
DROP INDEX "public"."email_logs_shop_id_shopScopedId_key";

-- DropIndex
DROP INDEX "public"."faqs_shop_id_shopScopedId_key";

-- DropIndex
DROP INDEX "public"."orders_shop_id_shopScopedId_key";

-- DropIndex
DROP INDEX "public"."products_shop_id_shopScopedId_key";

-- AlterTable
ALTER TABLE "public"."blogs" DROP COLUMN "shopScopedId",
ADD COLUMN     "shop_scoped_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."categories" DROP COLUMN "shopScopedId",
ADD COLUMN     "shop_scoped_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."email_logs" DROP COLUMN "shopScopedId",
ADD COLUMN     "shop_scoped_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."faqs" DROP COLUMN "shopScopedId",
ADD COLUMN     "shop_scoped_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."orders" DROP COLUMN "shopScopedId",
ADD COLUMN     "shop_scoped_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."products" DROP COLUMN "shopScopedId",
ADD COLUMN     "shop_scoped_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."store_counters";

-- CreateTable
CREATE TABLE "public"."shop_counters" (
    "shop_id" INTEGER NOT NULL,
    "product_counter" INTEGER NOT NULL DEFAULT 0,
    "order_counter" INTEGER NOT NULL DEFAULT 0,
    "blog_counter" INTEGER NOT NULL DEFAULT 0,
    "faq_counter" INTEGER NOT NULL DEFAULT 0,
    "category_counter" INTEGER NOT NULL DEFAULT 0,
    "user_counter" INTEGER NOT NULL DEFAULT 0,
    "email_log_counter" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "shop_counters_pkey" PRIMARY KEY ("shop_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blogs_shop_id_shop_scoped_id_key" ON "public"."blogs"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_shop_id_shop_scoped_id_key" ON "public"."categories"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_logs_shop_id_shop_scoped_id_key" ON "public"."email_logs"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "faqs_shop_id_shop_scoped_id_key" ON "public"."faqs"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_shop_id_shop_scoped_id_key" ON "public"."orders"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_shop_id_shop_scoped_id_key" ON "public"."products"("shop_id", "shop_scoped_id");

-- AddForeignKey
ALTER TABLE "public"."shop_counters" ADD CONSTRAINT "shop_counters_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
