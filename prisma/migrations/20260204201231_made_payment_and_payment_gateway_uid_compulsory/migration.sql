/*
  Warnings:

  - Made the column `payment_gateway_uid` on table `payments` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_payment_gateway_uid_fkey";

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "payment_gateway_uid" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_gateway_uid_fkey" FOREIGN KEY ("payment_gateway_uid") REFERENCES "payment_gateways"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
