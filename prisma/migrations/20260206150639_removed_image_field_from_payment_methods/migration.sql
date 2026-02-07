/*
  Warnings:

  - You are about to drop the column `image` on the `payment_gateways` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payment_gateways" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "shipments" ADD COLUMN     "base_fee" DECIMAL(10,2),
ADD COLUMN     "insurance_fee" DECIMAL(10,2),
ADD COLUMN     "raw_response" JSONB,
ADD COLUMN     "tax_amount" DECIMAL(10,2);
