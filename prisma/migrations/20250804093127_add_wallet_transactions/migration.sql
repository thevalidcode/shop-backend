-- CreateTable
CREATE TABLE "public"."wallet_transactions" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "user_uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_uid_key" ON "public"."wallet_transactions"("uid");

-- AddForeignKey
ALTER TABLE "public"."wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wallet_transactions" ADD CONSTRAINT "wallet_transactions_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
