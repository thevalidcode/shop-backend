/*
  Warnings:

  - You are about to drop the column `payment_reference` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "payment_reference",
ADD COLUMN     "payment_uid" TEXT,
ALTER COLUMN "payment_method" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_uid_fkey" FOREIGN KEY ("payment_uid") REFERENCES "payments"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
