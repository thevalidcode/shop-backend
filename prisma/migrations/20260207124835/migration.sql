-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "selected_shipping_rate" JSONB,
ADD COLUMN     "shipping_cost" DECIMAL(10,2),
ADD COLUMN     "shipping_currency" TEXT;
