/*
  Warnings:

  - You are about to drop the `WalletTransaction` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[shop_id,shopScopedId]` on the table `admins_emails` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cart_id,shopScopedId]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shopScopedId]` on the table `carts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shopScopedId]` on the table `contact_messages` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shopScopedId]` on the table `payment_gateways` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,shopScopedId]` on the table `session_codes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopScopedId` to the `admins_emails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopScopedId` to the `cart_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopScopedId` to the `carts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopScopedId` to the `contact_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopScopedId` to the `payment_gateways` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopScopedId` to the `session_codes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WalletTransaction" DROP CONSTRAINT "WalletTransaction_shopShopId_fkey";

-- DropForeignKey
ALTER TABLE "WalletTransaction" DROP CONSTRAINT "WalletTransaction_user_uid_fkey";

-- AlterTable
ALTER TABLE "admins_emails" ADD COLUMN     "shopScopedId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "shopScopedId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "carts" ADD COLUMN     "shopScopedId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "contact_messages" ADD COLUMN     "shopScopedId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "payment_gateways" ADD COLUMN     "shopScopedId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "session_codes" ADD COLUMN     "shopScopedId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "shop_counters" ADD COLUMN     "admin_email_counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cart_counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cart_item_counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "contact_message_counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "payment_gateway_counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "session_code_counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wallet_transaction_counter" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "WalletTransaction";

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "user_uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "shopScopedId" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_uid_key" ON "wallet_transactions"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_shop_id_shopScopedId_key" ON "wallet_transactions"("shop_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "admins_emails_shop_id_shopScopedId_key" ON "admins_emails"("shop_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_shopScopedId_key" ON "cart_items"("cart_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "carts_shop_id_shopScopedId_key" ON "carts"("shop_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "contact_messages_shop_id_shopScopedId_key" ON "contact_messages"("shop_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateways_shop_id_shopScopedId_key" ON "payment_gateways"("shop_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "session_codes_shop_id_shopScopedId_key" ON "session_codes"("shop_id", "shopScopedId");

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
