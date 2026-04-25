-- CreateEnum
CREATE TYPE "PaymentSource" AS ENUM ('DIRECT', 'BALANCE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionType" ADD VALUE 'WALLET_CREDIT';
ALTER TYPE "TransactionType" ADD VALUE 'WALLET_DEBIT';
ALTER TYPE "TransactionType" ADD VALUE 'WALLET_REFUND';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paid_with_balance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payment_source" "PaymentSource" NOT NULL DEFAULT 'DIRECT',
ADD COLUMN     "user_final_balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "user_initial_balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "margin_type" TEXT DEFAULT 'percentage',
ADD COLUMN     "margin_value" DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN     "provider_price" DECIMAL(10,2),
ADD COLUMN     "provider_product_uid" TEXT,
ADD COLUMN     "sync_cat_and_name" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sync_quantity" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sync_with_provider" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "api_access_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reselling_enabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- CreateTable
CREATE TABLE "product_suppliers" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "api_url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "shop_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_suppliers_uid_key" ON "product_suppliers"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "product_suppliers_api_url_key" ON "product_suppliers"("api_url");

-- CreateIndex
CREATE UNIQUE INDEX "product_suppliers_shop_id_key" ON "product_suppliers"("shop_id");

-- AddForeignKey
ALTER TABLE "product_suppliers" ADD CONSTRAINT "product_suppliers_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
