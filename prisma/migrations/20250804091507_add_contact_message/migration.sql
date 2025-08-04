-- CreateTable
CREATE TABLE "public"."contact_messages" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contact_messages_uid_key" ON "public"."contact_messages"("uid");

-- AddForeignKey
ALTER TABLE "public"."contact_messages" ADD CONSTRAINT "contact_messages_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
