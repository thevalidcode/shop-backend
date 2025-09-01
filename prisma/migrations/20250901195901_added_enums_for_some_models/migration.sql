/*
  Warnings:

  - The `role` column on the `admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `mode` column on the `affiliate_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `blogs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `contact_messages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `faqs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `type` on the `products` table. All the data in the column will be lost.
  - The `status` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `discount_type` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `plan` column on the `shops` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `shops` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `wallet_transactions` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `payment_method` on the `orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ShopStatus" AS ENUM ('active', 'inactive', 'disabled');

-- CreateEnum
CREATE TYPE "ShopPlan" AS ENUM ('free', 'starter', 'essentials', 'pro', 'business', 'empire');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'banned');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('basic', 'vip', 'reseller', 'partner');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('active', 'inactive', 'banned');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('super', 'basic', 'manager', 'support_staff', 'finance_officer', 'service_operator');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled');

-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "FaqStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('percentage', 'fixed');

-- CreateEnum
CREATE TYPE "AffiliateMode" AS ENUM ('percentage', 'fixed');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('card', 'bank', 'wallet', 'paypal', 'crypto', 'flutterwave', 'paystack');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('new', 'read', 'archived');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('credit', 'debit');

-- DropForeignKey
ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_shop_id_fkey";

-- DropForeignKey
ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_user_uid_fkey";

-- AlterTable
ALTER TABLE "admins" DROP COLUMN "role",
ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'basic',
DROP COLUMN "status",
ADD COLUMN     "status" "AdminStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "affiliate_settings" DROP COLUMN "mode",
ADD COLUMN     "mode" "AffiliateMode" NOT NULL DEFAULT 'percentage';

-- AlterTable
ALTER TABLE "blogs" DROP COLUMN "status",
ADD COLUMN     "status" "BlogStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "contact_messages" DROP COLUMN "status",
ADD COLUMN     "status" "ContactStatus" NOT NULL DEFAULT 'new';

-- AlterTable
ALTER TABLE "faqs" DROP COLUMN "status",
ADD COLUMN     "status" "FaqStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'Pending',
DROP COLUMN "payment_method",
ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "type",
DROP COLUMN "status",
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'active',
DROP COLUMN "discount_type",
ADD COLUMN     "discount_type" "DiscountType";

-- AlterTable
ALTER TABLE "shops" DROP COLUMN "plan",
ADD COLUMN     "plan" "ShopPlan" NOT NULL DEFAULT 'free',
DROP COLUMN "status",
ADD COLUMN     "status" "ShopStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'basic',
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'active';

-- DropTable
DROP TABLE "wallet_transactions";

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "user_uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shopShopId" INTEGER NOT NULL,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_uid_key" ON "WalletTransaction"("uid");

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_shopShopId_fkey" FOREIGN KEY ("shopShopId") REFERENCES "shops"("shop_id") ON DELETE RESTRICT ON UPDATE CASCADE;
