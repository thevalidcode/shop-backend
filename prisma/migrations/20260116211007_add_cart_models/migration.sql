-- AlterTable
ALTER TABLE "shop_counters" ADD COLUMN     "cart_counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cart_item_counter" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "carts" (
    "id" SERIAL NOT NULL,
    "shop_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "user_uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" SERIAL NOT NULL,
    "shop_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "cart_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "carts_uid_key" ON "carts"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "carts_user_uid_shop_id_key" ON "carts"("user_uid", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_uid_key" ON "cart_items"("uid");

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
