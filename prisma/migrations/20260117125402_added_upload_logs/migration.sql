-- CreateTable
CREATE TABLE "upload_logs" (
    "id" SERIAL NOT NULL,
    "shop_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upload_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "upload_logs_uid_key" ON "upload_logs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "upload_logs_shop_id_shop_scoped_id_key" ON "upload_logs"("shop_id", "shop_scoped_id");

-- AddForeignKey
ALTER TABLE "upload_logs" ADD CONSTRAINT "upload_logs_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
