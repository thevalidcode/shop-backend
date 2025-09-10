/*
  Warnings:

  - Added the required column `features` to the `shops` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `shops` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `plan` on the `shops` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."shops" ADD COLUMN     "description" TEXT,
ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "features" JSONB NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "plan",
ADD COLUMN     "plan" TEXT NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- DropEnum
DROP TYPE "public"."ShopPlan";
