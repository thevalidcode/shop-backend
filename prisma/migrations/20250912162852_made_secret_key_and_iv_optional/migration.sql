-- AlterTable
ALTER TABLE "public"."payment_gateways" ALTER COLUMN "encrypted_secret_key" DROP NOT NULL,
ALTER COLUMN "iv" DROP NOT NULL;
