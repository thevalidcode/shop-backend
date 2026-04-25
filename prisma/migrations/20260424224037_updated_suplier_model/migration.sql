/*
  Warnings:

  - You are about to drop the column `is_active` on the `suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `source_type` on the `suppliers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "suppliers" DROP COLUMN "is_active",
DROP COLUMN "source_type",
ADD COLUMN     "is_internal" BOOLEAN NOT NULL DEFAULT false;
