/*
  Warnings:

  - The values [inactive] on the enum `ShopStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ShopStatus_new" AS ENUM ('active', 'canceled', 'disabled', 'expired');
ALTER TABLE "public"."shops" ALTER COLUMN "status" TYPE "public"."ShopStatus_new" USING ("status"::text::"public"."ShopStatus_new");
ALTER TYPE "public"."ShopStatus" RENAME TO "ShopStatus_old";
ALTER TYPE "public"."ShopStatus_new" RENAME TO "ShopStatus";
DROP TYPE "public"."ShopStatus_old";
COMMIT;
