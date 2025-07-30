/*
  Warnings:

  - A unique constraint covering the columns `[shop_id,shopScopedId]` on the table `blogs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shopScopedId]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shopScopedId]` on the table `email_logs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shopScopedId]` on the table `faqs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shopScopedId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shopScopedId]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shopScopedId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopScopedId` to the `blogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopScopedId` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopScopedId` to the `email_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopScopedId` to the `faqs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopScopedId` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopScopedId` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopScopedId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."blogs" ADD COLUMN     "shopScopedId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."categories" ADD COLUMN     "shopScopedId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."email_logs" ADD COLUMN     "shopScopedId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."faqs" ADD COLUMN     "shopScopedId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "shopScopedId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "shopScopedId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "shopScopedId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."store_counters" (
    "shopId" INTEGER NOT NULL,
    "productCounter" INTEGER NOT NULL DEFAULT 0,
    "orderCounter" INTEGER NOT NULL DEFAULT 0,
    "blogCounter" INTEGER NOT NULL DEFAULT 0,
    "faqCounter" INTEGER NOT NULL DEFAULT 0,
    "categoryCounter" INTEGER NOT NULL DEFAULT 0,
    "userCounter" INTEGER NOT NULL DEFAULT 0,
    "emailLogCounter" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "store_counters_pkey" PRIMARY KEY ("shopId")
);

-- CreateIndex
CREATE UNIQUE INDEX "blogs_shop_id_shopScopedId_key" ON "public"."blogs"("shop_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_shop_id_shopScopedId_key" ON "public"."categories"("shop_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "email_logs_shop_id_shopScopedId_key" ON "public"."email_logs"("shop_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "faqs_shop_id_shopScopedId_key" ON "public"."faqs"("shop_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_shop_id_shopScopedId_key" ON "public"."orders"("shop_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "products_shop_id_shopScopedId_key" ON "public"."products"("shop_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "users_shop_id_shopScopedId_key" ON "public"."users"("shop_id", "shopScopedId");

-- AddForeignKey
ALTER TABLE "public"."store_counters" ADD CONSTRAINT "store_counters_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
