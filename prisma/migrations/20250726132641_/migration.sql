-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "status" TEXT NOT NULL DEFAULT 'active',
    "shop_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins_emails" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "emails" TEXT[],
    "shop_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_uid_key" ON "admins"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "admins_api_key_key" ON "admins"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "admins_emails_uid_key" ON "admins_emails"("uid");
