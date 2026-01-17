/*
  Warnings:

  - The values [super,basic,manager,support_staff,finance_officer,service_operator] on the enum `AdminRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,inactive,banned] on the enum `AdminStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [percentage,fixed] on the enum `AffiliateMode` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,inactive] on the enum `BlogStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [percentage,fixed] on the enum `DiscountType` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,inactive] on the enum `FaqStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Pending,Processing,Shipped,Delivered,Canceled] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,disabled] on the enum `PaymentGatewayStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending,success,failed] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,disabled] on the enum `ProductStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,canceled,disabled,expired] on the enum `ShopStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [wallet_credit,wallet_debit] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - The values [basic,vip,reseller,partner] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,inactive,banned] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `shopScopedId` on the `admins_emails` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the column `icon_url` on the `categories` table. All the data in the column will be lost.
  - The `status` column on the `categories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `title` on the `design_styles` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `email_templates` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `billing_address` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_address` on the `orders` table. All the data in the column will be lost.
  - The `payment_method` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `encrypted_secret_key` on the `payment_gateways` table. All the data in the column will be lost.
  - You are about to drop the column `iv` on the `payment_gateways` table. All the data in the column will be lost.
  - You are about to drop the column `shopScopedId` on the `payment_gateways` table. All the data in the column will be lost.
  - The `platform` column on the `payment_gateways` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `shopScopedId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `products` table. All the data in the column will be lost.
  - You are about to alter the column `weight` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `price` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `compare_price` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `discount_value` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to drop the column `shopScopedId` on the `session_codes` table. All the data in the column will be lost.
  - You are about to drop the column `shopDescription` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `shopName` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `admin_email_counter` on the `shop_counters` table. All the data in the column will be lost.
  - You are about to drop the column `cart_counter` on the `shop_counters` table. All the data in the column will be lost.
  - You are about to drop the column `cart_item_counter` on the `shop_counters` table. All the data in the column will be lost.
  - You are about to drop the column `contact_message_counter` on the `shop_counters` table. All the data in the column will be lost.
  - You are about to drop the column `session_code_counter` on the `shop_counters` table. All the data in the column will be lost.
  - You are about to drop the column `wallet_transaction_counter` on the `shop_counters` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `shopScopedId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `shopScopedId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `cart_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `carts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contact_messages` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[shop_id]` on the table `admins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id]` on the table `admins_emails` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shop_scoped_id]` on the table `design_styles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shop_scoped_id]` on the table `email_templates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `order_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shop_scoped_id]` on the table `payment_gateways` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shop_scoped_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sku]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shop_scoped_id]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shop_scoped_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `excerpt` to the `blogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `blogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop_scoped_id` to the `design_styles` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `email_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `shop_scoped_id` to the `email_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `email_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `email_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_uid` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - The required column `uid` was added to the `order_items` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `billing_info_uid` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max` to the `payment_gateways` table without a default value. This is not possible if the table is not empty.
  - Added the required column `min` to the `payment_gateways` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop_scoped_id` to the `payment_gateways` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop_scoped_id` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `method` on the `payments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updated_at` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plan_id` to the `shops` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop_scoped_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop_scoped_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('PRODUCTS', 'ORDERS', 'ORDER', 'TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'ABOUT_US', 'CONTACT_US');

-- CreateEnum
CREATE TYPE "PaymentGatewayPlatform" AS ENUM ('MANUAL', 'FLUTTERWAVE', 'PAYSTACK', 'REFERRAL');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('SUCCESS', 'ERROR');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'PENDING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "MessageSenderType" AS ENUM ('USER', 'ADMIN');

-- AlterEnum
BEGIN;
CREATE TYPE "AdminRole_new" AS ENUM ('SUPER', 'BASIC', 'MANAGER', 'SUPPORT_STAFF', 'FINANCE_OFFICER', 'SERVICE_OPERATOR');
ALTER TABLE "public"."admins" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "admins" ALTER COLUMN "role" TYPE "AdminRole_new" USING ("role"::text::"AdminRole_new");
ALTER TYPE "AdminRole" RENAME TO "AdminRole_old";
ALTER TYPE "AdminRole_new" RENAME TO "AdminRole";
DROP TYPE "public"."AdminRole_old";
ALTER TABLE "admins" ALTER COLUMN "role" SET DEFAULT 'BASIC';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "AdminStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED');
ALTER TABLE "public"."admins" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "admins" ALTER COLUMN "status" TYPE "AdminStatus_new" USING ("status"::text::"AdminStatus_new");
ALTER TYPE "AdminStatus" RENAME TO "AdminStatus_old";
ALTER TYPE "AdminStatus_new" RENAME TO "AdminStatus";
DROP TYPE "public"."AdminStatus_old";
ALTER TABLE "admins" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "AffiliateMode_new" AS ENUM ('PERCENTAGE', 'FIXED');
ALTER TABLE "public"."affiliate_settings" ALTER COLUMN "mode" DROP DEFAULT;
ALTER TABLE "affiliate_settings" ALTER COLUMN "mode" TYPE "AffiliateMode_new" USING ("mode"::text::"AffiliateMode_new");
ALTER TYPE "AffiliateMode" RENAME TO "AffiliateMode_old";
ALTER TYPE "AffiliateMode_new" RENAME TO "AffiliateMode";
DROP TYPE "public"."AffiliateMode_old";
ALTER TABLE "affiliate_settings" ALTER COLUMN "mode" SET DEFAULT 'PERCENTAGE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "BlogStatus_new" AS ENUM ('ACTIVE', 'DISABLED');
ALTER TABLE "public"."blogs" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "blogs" ALTER COLUMN "status" TYPE "BlogStatus_new" USING ("status"::text::"BlogStatus_new");
ALTER TYPE "BlogStatus" RENAME TO "BlogStatus_old";
ALTER TYPE "BlogStatus_new" RENAME TO "BlogStatus";
DROP TYPE "public"."BlogStatus_old";
ALTER TABLE "blogs" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "DiscountType_new" AS ENUM ('PERCENTAGE', 'FIXED');
ALTER TABLE "products" ALTER COLUMN "discount_type" TYPE "DiscountType_new" USING ("discount_type"::text::"DiscountType_new");
ALTER TYPE "DiscountType" RENAME TO "DiscountType_old";
ALTER TYPE "DiscountType_new" RENAME TO "DiscountType";
DROP TYPE "public"."DiscountType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "FaqStatus_new" AS ENUM ('ACTIVE', 'DISABLED');
ALTER TABLE "public"."faqs" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "faqs" ALTER COLUMN "status" TYPE "FaqStatus_new" USING ("status"::text::"FaqStatus_new");
ALTER TYPE "FaqStatus" RENAME TO "FaqStatus_old";
ALTER TYPE "FaqStatus_new" RENAME TO "FaqStatus";
DROP TYPE "public"."FaqStatus_old";
ALTER TABLE "faqs" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED', 'REFUNDED');
ALTER TABLE "public"."orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentGatewayStatus_new" AS ENUM ('ACTIVE', 'DISABLED');
ALTER TABLE "payment_gateways" ALTER COLUMN "status" TYPE "PaymentGatewayStatus_new" USING ("status"::text::"PaymentGatewayStatus_new");
ALTER TYPE "PaymentGatewayStatus" RENAME TO "PaymentGatewayStatus_old";
ALTER TYPE "PaymentGatewayStatus_new" RENAME TO "PaymentGatewayStatus";
DROP TYPE "public"."PaymentGatewayStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
ALTER TABLE "payments" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ProductStatus_new" AS ENUM ('ACTIVE', 'DISABLED');
ALTER TABLE "public"."products" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "products" ALTER COLUMN "status" TYPE "ProductStatus_new" USING ("status"::text::"ProductStatus_new");
ALTER TYPE "ProductStatus" RENAME TO "ProductStatus_old";
ALTER TYPE "ProductStatus_new" RENAME TO "ProductStatus";
DROP TYPE "public"."ProductStatus_old";
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ShopStatus_new" AS ENUM ('ACTIVE', 'CANCELED', 'DISABLED', 'EXPIRED');
ALTER TABLE "shops" ALTER COLUMN "status" TYPE "ShopStatus_new" USING ("status"::text::"ShopStatus_new");
ALTER TYPE "ShopStatus" RENAME TO "ShopStatus_old";
ALTER TYPE "ShopStatus_new" RENAME TO "ShopStatus";
DROP TYPE "public"."ShopStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('ORDER_PAYMENT', 'REFERRAL_CREDIT', 'REFUND');
ALTER TABLE "transactions" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "public"."TransactionType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('BASIC', 'VIP', 'RESELLER', 'PARTNER');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'BASIC';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED');
ALTER TABLE "public"."users" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_cart_id_fkey";

-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "carts" DROP CONSTRAINT "carts_user_uid_fkey";

-- DropForeignKey
ALTER TABLE "contact_messages" DROP CONSTRAINT "contact_messages_shop_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_user_id_fkey";

-- DropIndex
DROP INDEX "admins_api_key_key";

-- DropIndex
DROP INDEX "admins_email_shop_id_key";

-- DropIndex
DROP INDEX "admins_emails_shop_id_shopScopedId_key";

-- DropIndex
DROP INDEX "blogs_slug_shop_id_key";

-- DropIndex
DROP INDEX "design_styles_shop_id_key";

-- DropIndex
DROP INDEX "email_templates_type_shop_id_key";

-- DropIndex
DROP INDEX "faqs_slug_shop_id_key";

-- DropIndex
DROP INDEX "payment_gateways_shop_id_name_key";

-- DropIndex
DROP INDEX "payment_gateways_shop_id_shopScopedId_key";

-- DropIndex
DROP INDEX "payments_shop_id_shopScopedId_key";

-- DropIndex
DROP INDEX "session_codes_shop_id_shopScopedId_key";

-- DropIndex
DROP INDEX "transactions_shop_id_shopScopedId_key";

-- DropIndex
DROP INDEX "users_shop_id_shopScopedId_key";

-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "full_name" TEXT,
ADD COLUMN     "onboarding_completed" BOOLEAN DEFAULT false,
ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "reset_token_expiry" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'BASIC',
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "admins_emails" DROP COLUMN "shopScopedId";

-- AlterTable
ALTER TABLE "affiliate_settings" ALTER COLUMN "mode" SET DEFAULT 'PERCENTAGE';

-- AlterTable
ALTER TABLE "blogs" DROP COLUMN "description",
DROP COLUMN "timestamp",
ADD COLUMN     "cover_image" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "excerpt" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "icon_url",
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "CategoryStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "position" DROP DEFAULT;

-- AlterTable
ALTER TABLE "design_styles" DROP COLUMN "title",
ADD COLUMN     "name" TEXT,
ADD COLUMN     "shop_scoped_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "email_logs" DROP COLUMN "status",
ADD COLUMN     "status" "EmailStatus" NOT NULL;

-- AlterTable
ALTER TABLE "email_templates" DROP COLUMN "timestamp",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "shop_scoped_id" INTEGER NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "faqs" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "product_id",
ADD COLUMN     "product_uid" TEXT NOT NULL,
ADD COLUMN     "uid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "billing_address",
DROP COLUMN "shipping_address",
ADD COLUMN     "billing_info_uid" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING',
DROP COLUMN "payment_method",
ADD COLUMN     "payment_method" TEXT;

-- AlterTable
ALTER TABLE "payment_gateways" DROP COLUMN "encrypted_secret_key",
DROP COLUMN "iv",
DROP COLUMN "shopScopedId",
ADD COLUMN     "fee_percent" INTEGER DEFAULT 0,
ADD COLUMN     "max" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "min" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "secret_key" JSONB,
ADD COLUMN     "shop_scoped_id" INTEGER NOT NULL,
ADD COLUMN     "webhook_url" TEXT,
DROP COLUMN "platform",
ADD COLUMN     "platform" "PaymentGatewayPlatform" NOT NULL DEFAULT 'MANUAL',
ALTER COLUMN "status" SET DEFAULT 'ACTIVE',
ALTER COLUMN "position" DROP DEFAULT;
DROP SEQUENCE "payment_gateways_position_seq";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "shopScopedId",
ADD COLUMN     "shop_scoped_id" INTEGER NOT NULL,
DROP COLUMN "method",
ADD COLUMN     "method" "PaymentGatewayPlatform" NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "category",
ADD COLUMN     "allow_backorder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "average_rating" DECIMAL(3,2) DEFAULT 0,
ADD COLUMN     "category_uid" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "low_stock_threshold" INTEGER,
ADD COLUMN     "material" TEXT,
ADD COLUMN     "meta_description" TEXT,
ADD COLUMN     "meta_keywords" TEXT[],
ADD COLUMN     "meta_title" TEXT,
ADD COLUMN     "size" TEXT,
ADD COLUMN     "total_reviews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_sales" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "track_inventory" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "view_count" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "max" SET DEFAULT 100,
ALTER COLUMN "position" SET DEFAULT 1,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE',
ALTER COLUMN "weight" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "compare_price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "discount_value" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "session_codes" DROP COLUMN "shopScopedId";

-- AlterTable
ALTER TABLE "settings" DROP COLUMN "shopDescription",
DROP COLUMN "shopName",
ADD COLUMN     "onboarding_completed" BOOLEAN DEFAULT false,
ADD COLUMN     "shop_description" TEXT,
ADD COLUMN     "shop_name" TEXT NOT NULL DEFAULT 'My Shop',
ADD COLUMN     "show_banner" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "shop_counters" DROP COLUMN "admin_email_counter",
DROP COLUMN "cart_counter",
DROP COLUMN "cart_item_counter",
DROP COLUMN "contact_message_counter",
DROP COLUMN "session_code_counter",
DROP COLUMN "wallet_transaction_counter",
ADD COLUMN     "billing_info_counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "email_template_counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "page_counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "support_ticket_counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "transaction_counter" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "shops" DROP COLUMN "plan",
ADD COLUMN     "plan_id" INTEGER NOT NULL,
ADD COLUMN     "started_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "shopScopedId",
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "shop_scoped_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "balance",
DROP COLUMN "fullName",
DROP COLUMN "shopScopedId",
ADD COLUMN     "full_name" TEXT,
ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "reset_token_expiry" TIMESTAMP(3),
ADD COLUMN     "shop_scoped_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'BASIC',
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- DropTable
DROP TABLE "cart_items";

-- DropTable
DROP TABLE "carts";

-- DropTable
DROP TABLE "contact_messages";

-- DropEnum
DROP TYPE "ContactStatus";

-- DropEnum
DROP TYPE "PaymentMethod";

-- CreateTable
CREATE TABLE "product_images" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "product_uid" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "alt_text" TEXT,
    "position" INTEGER NOT NULL DEFAULT 1,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "product_uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "compare_price" DECIMAL(10,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "color" TEXT,
    "size" TEXT,
    "material" TEXT,
    "weight" DECIMAL(10,2),
    "position" INTEGER NOT NULL DEFAULT 1,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_reviews" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "product_uid" TEXT NOT NULL,
    "user_uid" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_info" (
    "id" SERIAL NOT NULL,
    "shop_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "user_uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" SERIAL NOT NULL,
    "shop_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "page_type" "PageType" NOT NULL,
    "status" "PageStatus" NOT NULL DEFAULT 'ACTIVE',
    "shop_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "user_uid" TEXT NOT NULL,
    "shop_scoped_id" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "description" TEXT,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "ticket_uid" TEXT NOT NULL,
    "sender_uid" TEXT NOT NULL,
    "sender_type" "MessageSenderType" NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" SERIAL NOT NULL,
    "rates" JSONB NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_images_uid_key" ON "product_images"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_uid_key" ON "product_variants"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_reviews_uid_key" ON "product_reviews"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "billing_info_uid_key" ON "billing_info"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "billing_info_shop_id_shop_scoped_id_key" ON "billing_info"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "pages_uid_key" ON "pages"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "pages_shop_id_shop_scoped_id_key" ON "pages"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "pages_shop_id_page_type_key" ON "pages"("shop_id", "page_type");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_uid_key" ON "support_tickets"("uid");

-- CreateIndex
CREATE INDEX "support_tickets_shop_id_idx" ON "support_tickets"("shop_id");

-- CreateIndex
CREATE INDEX "support_tickets_user_uid_idx" ON "support_tickets"("user_uid");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_shop_id_shop_scoped_id_key" ON "support_tickets"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_messages_uid_key" ON "ticket_messages"("uid");

-- CreateIndex
CREATE INDEX "ticket_messages_ticket_uid_idx" ON "ticket_messages"("ticket_uid");

-- CreateIndex
CREATE INDEX "ticket_messages_sender_uid_idx" ON "ticket_messages"("sender_uid");

-- CreateIndex
CREATE UNIQUE INDEX "admins_shop_id_key" ON "admins"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_emails_shop_id_key" ON "admins_emails"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "design_styles_shop_id_shop_scoped_id_key" ON "design_styles"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_shop_id_shop_scoped_id_key" ON "email_templates"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_items_uid_key" ON "order_items"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateways_shop_id_shop_scoped_id_key" ON "payment_gateways"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_shop_id_shop_scoped_id_key" ON "payments"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_shop_id_shop_scoped_id_key" ON "transactions"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_shop_id_shop_scoped_id_key" ON "users"("shop_id", "shop_scoped_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_uid_fkey" FOREIGN KEY ("category_uid") REFERENCES "categories"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_uid_fkey" FOREIGN KEY ("product_uid") REFERENCES "products"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_uid_fkey" FOREIGN KEY ("product_uid") REFERENCES "products"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_uid_fkey" FOREIGN KEY ("product_uid") REFERENCES "products"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_billing_info_uid_fkey" FOREIGN KEY ("billing_info_uid") REFERENCES "billing_info"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_uid_fkey" FOREIGN KEY ("product_uid") REFERENCES "products"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_info" ADD CONSTRAINT "billing_info_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_info" ADD CONSTRAINT "billing_info_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_uid_fkey" FOREIGN KEY ("ticket_uid") REFERENCES "support_tickets"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
