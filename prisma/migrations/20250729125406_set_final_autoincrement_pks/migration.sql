/*
  Warnings:

  - The primary key for the `affiliate_settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `blogs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `design_styles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `email_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `email_templates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `faqs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `general` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[email,shop_id]` on the table `admins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `affiliate_settings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id]` on the table `affiliate_settings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `blogs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,shop_id]` on the table `blogs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,shop_id]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `design_styles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id]` on the table `design_styles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `email_logs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `email_templates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[type,shop_id]` on the table `email_templates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `faqs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,shop_id]` on the table `faqs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `general` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id]` on the table `general` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,shop_id]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,shop_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username,shop_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
CREATE SEQUENCE affiliate_settings_id_seq;
ALTER TABLE "affiliate_settings" DROP CONSTRAINT "affiliate_settings_pkey",
ALTER COLUMN "id" SET DEFAULT nextval('affiliate_settings_id_seq'),
ADD CONSTRAINT "affiliate_settings_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE affiliate_settings_id_seq OWNED BY "affiliate_settings"."id";

-- AlterTable
CREATE SEQUENCE blogs_id_seq;
ALTER TABLE "blogs" DROP CONSTRAINT "blogs_pkey",
ALTER COLUMN "id" SET DEFAULT nextval('blogs_id_seq'),
ADD CONSTRAINT "blogs_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE blogs_id_seq OWNED BY "blogs"."id";

-- AlterTable
CREATE SEQUENCE categories_id_seq;
ALTER TABLE "categories" DROP CONSTRAINT "categories_pkey",
ALTER COLUMN "id" SET DEFAULT nextval('categories_id_seq'),
ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE categories_id_seq OWNED BY "categories"."id";

-- AlterTable
CREATE SEQUENCE design_styles_id_seq;
ALTER TABLE "design_styles" DROP CONSTRAINT "design_styles_pkey",
ALTER COLUMN "id" SET DEFAULT nextval('design_styles_id_seq'),
ADD CONSTRAINT "design_styles_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE design_styles_id_seq OWNED BY "design_styles"."id";

-- AlterTable
CREATE SEQUENCE email_logs_id_seq;
ALTER TABLE "email_logs" DROP CONSTRAINT "email_logs_pkey",
ALTER COLUMN "id" SET DEFAULT nextval('email_logs_id_seq'),
ADD CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE email_logs_id_seq OWNED BY "email_logs"."id";

-- AlterTable
CREATE SEQUENCE email_templates_id_seq;
ALTER TABLE "email_templates" DROP CONSTRAINT "email_templates_pkey",
ALTER COLUMN "id" SET DEFAULT nextval('email_templates_id_seq'),
ADD CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE email_templates_id_seq OWNED BY "email_templates"."id";

-- AlterTable
CREATE SEQUENCE faqs_id_seq;
ALTER TABLE "faqs" DROP CONSTRAINT "faqs_pkey",
ALTER COLUMN "id" SET DEFAULT nextval('faqs_id_seq'),
ADD CONSTRAINT "faqs_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE faqs_id_seq OWNED BY "faqs"."id";

-- AlterTable
CREATE SEQUENCE general_id_seq;
ALTER TABLE "general" DROP CONSTRAINT "general_pkey",
ALTER COLUMN "id" SET DEFAULT nextval('general_id_seq'),
ADD CONSTRAINT "general_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE general_id_seq OWNED BY "general"."id";

-- AlterTable
CREATE SEQUENCE orders_id_seq;
ALTER TABLE "orders" DROP CONSTRAINT "orders_pkey",
ALTER COLUMN "id" SET DEFAULT nextval('orders_id_seq'),
ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE orders_id_seq OWNED BY "orders"."id";

-- AlterTable
CREATE SEQUENCE products_id_seq;
ALTER TABLE "products" DROP CONSTRAINT "products_pkey",
ALTER COLUMN "id" SET DEFAULT nextval('products_id_seq'),
ALTER COLUMN "position" SET DEFAULT 0,
ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE products_id_seq OWNED BY "products"."id";

-- AlterTable
CREATE SEQUENCE users_id_seq;
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" SET DEFAULT nextval('users_id_seq'),
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE users_id_seq OWNED BY "users"."id";

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_shop_id_key" ON "admins"("email", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_settings_uid_key" ON "affiliate_settings"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_settings_shop_id_key" ON "affiliate_settings"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_uid_key" ON "blogs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_shop_id_key" ON "blogs"("slug", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_uid_key" ON "categories"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_shop_id_key" ON "categories"("slug", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "design_styles_uid_key" ON "design_styles"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "design_styles_shop_id_key" ON "design_styles"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_logs_uid_key" ON "email_logs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_uid_key" ON "email_templates"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_type_shop_id_key" ON "email_templates"("type", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "faqs_uid_key" ON "faqs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "faqs_slug_shop_id_key" ON "faqs"("slug", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "general_uid_key" ON "general"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "general_shop_id_key" ON "general"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_uid_key" ON "orders"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "products_uid_key" ON "products"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_shop_id_key" ON "products"("slug", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_uid_key" ON "users"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_shop_id_key" ON "users"("email", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_shop_id_key" ON "users"("username", "shop_id");
