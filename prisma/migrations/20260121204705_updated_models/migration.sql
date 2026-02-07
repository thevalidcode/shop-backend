/*
  Warnings:

  - The values [REFERRAL] on the enum `PaymentGatewayPlatform` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `payment_method` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentGatewayPlatform_new" AS ENUM ('MANUAL', 'FLUTTERWAVE', 'PAYSTACK', 'CREDIT');
ALTER TABLE "public"."payment_gateways" ALTER COLUMN "platform" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "payment_method" TYPE "PaymentGatewayPlatform_new" USING ("payment_method"::text::"PaymentGatewayPlatform_new");
ALTER TABLE "payment_gateways" ALTER COLUMN "platform" TYPE "PaymentGatewayPlatform_new" USING ("platform"::text::"PaymentGatewayPlatform_new");
ALTER TABLE "payments" ALTER COLUMN "method" TYPE "PaymentGatewayPlatform_new" USING ("method"::text::"PaymentGatewayPlatform_new");
ALTER TYPE "PaymentGatewayPlatform" RENAME TO "PaymentGatewayPlatform_old";
ALTER TYPE "PaymentGatewayPlatform_new" RENAME TO "PaymentGatewayPlatform";
DROP TYPE "public"."PaymentGatewayPlatform_old";
ALTER TABLE "payment_gateways" ALTER COLUMN "platform" SET DEFAULT 'MANUAL';
COMMIT;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "payment_method",
ADD COLUMN     "payment_method" "PaymentGatewayPlatform" NOT NULL;
