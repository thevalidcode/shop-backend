/*
  Warnings:

  - You are about to drop the column `expires_at` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `features` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `plan_id` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `started_at` on the `shops` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "shops" DROP COLUMN "expires_at",
DROP COLUMN "features",
DROP COLUMN "plan_id",
DROP COLUMN "started_at";
