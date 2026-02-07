/*
  Warnings:

  - You are about to drop the column `payment_method` on the `orders` table. All the data in the column will be lost.
  - Made the column `payment_uid` on table `orders` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "payment_method",
ALTER COLUMN "payment_uid" SET NOT NULL;
