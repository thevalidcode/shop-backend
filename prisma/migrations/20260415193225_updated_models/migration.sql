-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "supplier_order_uid" TEXT,
ADD COLUMN     "sync_with_supplier" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "supplier_price" DECIMAL(10,2),
ADD COLUMN     "supplier_product_uid" TEXT,
ADD COLUMN     "supplier_uid" TEXT,
ADD COLUMN     "sync_with_supplier" BOOLEAN NOT NULL DEFAULT true;
