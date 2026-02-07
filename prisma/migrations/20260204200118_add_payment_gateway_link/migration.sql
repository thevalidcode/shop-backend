-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "payment_gateway_uid" TEXT;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_gateway_uid_fkey" FOREIGN KEY ("payment_gateway_uid") REFERENCES "payment_gateways"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
