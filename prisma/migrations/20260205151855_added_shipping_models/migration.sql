-- CreateEnum
CREATE TYPE "ShippingPlatform" AS ENUM ('SENDBOX', 'SHIPPO');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'LABEL_CREATED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED', 'CANCELED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'IN_TRANSIT';
ALTER TYPE "OrderStatus" ADD VALUE 'FAILED_DELIVERY';

-- AlterTable
ALTER TABLE "shop_counters" ADD COLUMN     "shipment_counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shipping_account_counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tracking_event_counter" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "shipping_accounts" (
    "id" SERIAL NOT NULL,
    "shop_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "platform" "ShippingPlatform" NOT NULL,
    "encrypted_api_key" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_preferred" BOOLEAN NOT NULL DEFAULT false,
    "test_mode" BOOLEAN NOT NULL DEFAULT true,
    "last_tested_at" TIMESTAMP(3),
    "last_test_status" TEXT,
    "webhook_secret" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" SERIAL NOT NULL,
    "shop_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "order_uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "shipping_account_uid" TEXT NOT NULL,
    "platform" "ShippingPlatform" NOT NULL,
    "external_shipment_id" TEXT,
    "courier_name" TEXT,
    "courier_code" TEXT,
    "tracking_number" TEXT,
    "tracking_url" TEXT,
    "label_url" TEXT,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "estimated_delivery_date" TIMESTAMP(3),
    "actual_delivery_date" TIMESTAMP(3),
    "weight" DECIMAL(10,2),
    "weight_unit" TEXT,
    "shipping_cost" DECIMAL(10,2),
    "currency" TEXT,
    "last_synced_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_events" (
    "id" SERIAL NOT NULL,
    "shop_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "shipment_uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "status_code" TEXT,
    "location" TEXT,
    "description" TEXT,
    "courier_status" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "raw_payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shipping_accounts_uid_key" ON "shipping_accounts"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_accounts_shop_id_platform_key" ON "shipping_accounts"("shop_id", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_accounts_shop_id_shop_scoped_id_key" ON "shipping_accounts"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_uid_key" ON "shipments"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_order_uid_key" ON "shipments"("order_uid");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_tracking_number_key" ON "shipments"("tracking_number");

-- CreateIndex
CREATE INDEX "shipments_tracking_number_idx" ON "shipments"("tracking_number");

-- CreateIndex
CREATE INDEX "shipments_order_uid_idx" ON "shipments"("order_uid");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_shop_id_shop_scoped_id_key" ON "shipments"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "tracking_events_uid_key" ON "tracking_events"("uid");

-- CreateIndex
CREATE INDEX "tracking_events_shipment_uid_idx" ON "tracking_events"("shipment_uid");

-- AddForeignKey
ALTER TABLE "shipping_accounts" ADD CONSTRAINT "shipping_accounts_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_uid_fkey" FOREIGN KEY ("order_uid") REFERENCES "orders"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_shipping_account_uid_fkey" FOREIGN KEY ("shipping_account_uid") REFERENCES "shipping_accounts"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_events" ADD CONSTRAINT "tracking_events_shipment_uid_fkey" FOREIGN KEY ("shipment_uid") REFERENCES "shipments"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
