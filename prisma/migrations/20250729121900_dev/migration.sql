-- AlterTable
ALTER TABLE "users" ALTER COLUMN "ref_code" DROP NOT NULL;

-- CreateTable
CREATE TABLE "session_codes" (
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "session_codes_pkey" PRIMARY KEY ("code")
);

-- AddForeignKey
ALTER TABLE "session_codes" ADD CONSTRAINT "session_codes_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
