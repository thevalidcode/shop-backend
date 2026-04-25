-- CreateEnum
CREATE TYPE "PaymentPurpose" AS ENUM ('ORDER', 'WALLET_TOPUP');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "purpose" "PaymentPurpose" NOT NULL DEFAULT 'ORDER';
