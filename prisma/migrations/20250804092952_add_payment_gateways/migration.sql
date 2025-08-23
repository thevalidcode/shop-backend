-- CreateTable
CREATE TABLE "public"."payment_gateways" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "encrypted_secret_key" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "payment_gateways_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateways_uid_key" ON "public"."payment_gateways"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateways_shop_id_name_key" ON "public"."payment_gateways"("shop_id", "name");

-- AddForeignKey
ALTER TABLE "public"."payment_gateways" ADD CONSTRAINT "payment_gateways_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
