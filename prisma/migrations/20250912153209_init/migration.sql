-- CreateEnum
CREATE TYPE "public"."ShopStatus" AS ENUM ('active', 'canceled', 'disabled', 'expired');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('active', 'inactive', 'banned');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('basic', 'vip', 'reseller', 'partner');

-- CreateEnum
CREATE TYPE "public"."AdminStatus" AS ENUM ('active', 'inactive', 'banned');

-- CreateEnum
CREATE TYPE "public"."AdminRole" AS ENUM ('super', 'basic', 'manager', 'support_staff', 'finance_officer', 'service_operator');

-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled');

-- CreateEnum
CREATE TYPE "public"."BlogStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."FaqStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('percentage', 'fixed');

-- CreateEnum
CREATE TYPE "public"."AffiliateMode" AS ENUM ('percentage', 'fixed');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('manual', 'flutterwave', 'paystack');

-- CreateEnum
CREATE TYPE "public"."ContactStatus" AS ENUM ('new', 'read', 'archived');

-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('credit', 'debit');

-- CreateEnum
CREATE TYPE "public"."PaymentGatewayStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('pending', 'success', 'failed');

-- CreateTable
CREATE TABLE "public"."shops" (
    "shop_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "ssl" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "plan" TEXT NOT NULL,
    "status" "public"."ShopStatus" NOT NULL,
    "expires_at" TIMESTAMP(3),
    "features" JSONB NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("shop_id")
);

-- CreateTable
CREATE TABLE "public"."shop_counters" (
    "shop_id" INTEGER NOT NULL,
    "product_counter" INTEGER NOT NULL DEFAULT 0,
    "order_counter" INTEGER NOT NULL DEFAULT 0,
    "blog_counter" INTEGER NOT NULL DEFAULT 0,
    "faq_counter" INTEGER NOT NULL DEFAULT 0,
    "category_counter" INTEGER NOT NULL DEFAULT 0,
    "user_counter" INTEGER NOT NULL DEFAULT 0,
    "email_log_counter" INTEGER NOT NULL DEFAULT 0,
    "admin_email_counter" INTEGER NOT NULL DEFAULT 0,
    "session_code_counter" INTEGER NOT NULL DEFAULT 0,
    "cart_counter" INTEGER NOT NULL DEFAULT 0,
    "cart_item_counter" INTEGER NOT NULL DEFAULT 0,
    "contact_message_counter" INTEGER NOT NULL DEFAULT 0,
    "payment_gateway_counter" INTEGER NOT NULL DEFAULT 0,
    "wallet_transaction_counter" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "shop_counters_pkey" PRIMARY KEY ("shop_id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "shopScopedId" INTEGER NOT NULL,
    "ref_code" SERIAL,
    "uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "image" TEXT,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'basic',
    "status" "public"."UserStatus" NOT NULL DEFAULT 'active',
    "shop_id" INTEGER NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "spent" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "ref" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admins" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "role" "public"."AdminRole" NOT NULL DEFAULT 'basic',
    "status" "public"."AdminStatus" NOT NULL DEFAULT 'active',
    "shop_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" SERIAL NOT NULL,
    "shop_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "min" INTEGER NOT NULL DEFAULT 1,
    "max" INTEGER NOT NULL DEFAULT 1,
    "position" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."ProductStatus" NOT NULL DEFAULT 'active',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT,
    "image_url" TEXT,
    "gallery_urls" TEXT[],
    "tags" TEXT[],
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "brand" TEXT,
    "weight" DECIMAL(65,30),
    "dimensions" TEXT,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "compare_price" DECIMAL(65,30),
    "discount_type" "public"."DiscountType",
    "discount_value" DECIMAL(65,30),
    "slug" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" SERIAL NOT NULL,
    "shop_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "order_ref" TEXT NOT NULL,
    "user_uid" TEXT NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'Pending',
    "shipping_address" TEXT NOT NULL,
    "billing_address" TEXT NOT NULL,
    "payment_method" "public"."PaymentMethod" NOT NULL,
    "payment_reference" TEXT,
    "tracking_number" TEXT,
    "estimated_delivery" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shop_id" INTEGER NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_items" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price_at_time_of_purchase" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blogs" (
    "id" SERIAL NOT NULL,
    "shop_scoped_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" "public"."BlogStatus" NOT NULL DEFAULT 'active',
    "position" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" SERIAL NOT NULL,
    "shop_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "image_url" TEXT,
    "banner_url" TEXT,
    "icon_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "position" INTEGER NOT NULL DEFAULT 1,
    "parent_uid" TEXT,
    "shop_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."faqs" (
    "id" SERIAL NOT NULL,
    "shop_scoped_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "status" "public"."FaqStatus" NOT NULL DEFAULT 'active',
    "position" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_logs" (
    "id" SERIAL NOT NULL,
    "shop_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "receiver" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message_id" TEXT,
    "response" TEXT,
    "shop_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admins_emails" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "emails" TEXT[],
    "shop_id" INTEGER NOT NULL,
    "shopScopedId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."affiliate_settings" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "percent" INTEGER NOT NULL,
    "mode" "public"."AffiliateMode" NOT NULL DEFAULT 'percentage',
    "shop_id" INTEGER NOT NULL,

    CONSTRAINT "affiliate_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."currencies" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quotes" JSONB NOT NULL,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."design_styles" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "schema" JSONB NOT NULL,

    CONSTRAINT "design_styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_templates" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."settings" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "shopName" TEXT NOT NULL DEFAULT 'Shop',
    "shopDescription" TEXT,
    "logo_url" TEXT,
    "favicon_url" TEXT,
    "default_client_currency" TEXT,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session_codes" (
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "shopScopedId" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "session_codes_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "public"."carts" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "shopScopedId" INTEGER NOT NULL,
    "user_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cart_items" (
    "id" SERIAL NOT NULL,
    "cart_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "shopScopedId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contact_messages" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "shopScopedId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "status" "public"."ContactStatus" NOT NULL DEFAULT 'new',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_gateways" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "shopScopedId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "encrypted_secret_key" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "platform" "public"."PaymentMethod" NOT NULL,
    "status" "public"."PaymentGatewayStatus" NOT NULL,
    "signature" TEXT,
    "image" TEXT NOT NULL,
    "position" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_gateways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wallet_transactions" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "user_uid" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "shopScopedId" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "public"."TransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."internal_api_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "data" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internal_api_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "charged_amount" DECIMAL(10,2) NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shop_id" INTEGER NOT NULL,
    "shopScopedId" INTEGER NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shops_uid_key" ON "public"."shops"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_ref_code_key" ON "public"."users"("ref_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_uid_key" ON "public"."users"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_api_key_key" ON "public"."users"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "users_shop_id_shopScopedId_key" ON "public"."users"("shop_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_shop_id_key" ON "public"."users"("email", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_shop_id_key" ON "public"."users"("username", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_uid_key" ON "public"."admins"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "admins_api_key_key" ON "public"."admins"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_shop_id_key" ON "public"."admins"("email", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_uid_key" ON "public"."products"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "products_shop_id_shop_scoped_id_key" ON "public"."products"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_shop_id_key" ON "public"."products"("slug", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_uid_key" ON "public"."orders"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_ref_key" ON "public"."orders"("order_ref");

-- CreateIndex
CREATE UNIQUE INDEX "orders_shop_id_shop_scoped_id_key" ON "public"."orders"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_uid_key" ON "public"."blogs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_shop_id_shop_scoped_id_key" ON "public"."blogs"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_shop_id_key" ON "public"."blogs"("slug", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_uid_key" ON "public"."categories"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "categories_shop_id_shop_scoped_id_key" ON "public"."categories"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_shop_id_key" ON "public"."categories"("slug", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "faqs_uid_key" ON "public"."faqs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "faqs_shop_id_shop_scoped_id_key" ON "public"."faqs"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "faqs_slug_shop_id_key" ON "public"."faqs"("slug", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_logs_uid_key" ON "public"."email_logs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "email_logs_shop_id_shop_scoped_id_key" ON "public"."email_logs"("shop_id", "shop_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_emails_uid_key" ON "public"."admins_emails"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "admins_emails_shop_id_shopScopedId_key" ON "public"."admins_emails"("shop_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_settings_uid_key" ON "public"."affiliate_settings"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_settings_shop_id_key" ON "public"."affiliate_settings"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_uid_key" ON "public"."currencies"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "design_styles_uid_key" ON "public"."design_styles"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "design_styles_shop_id_key" ON "public"."design_styles"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_uid_key" ON "public"."email_templates"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_type_shop_id_key" ON "public"."email_templates"("type", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "settings_uid_key" ON "public"."settings"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "settings_shop_id_key" ON "public"."settings"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_codes_shop_id_shopScopedId_key" ON "public"."session_codes"("shop_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "carts_uid_key" ON "public"."carts"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "carts_user_uid_key" ON "public"."carts"("user_uid");

-- CreateIndex
CREATE UNIQUE INDEX "carts_shop_id_shopScopedId_key" ON "public"."carts"("shop_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_key" ON "public"."cart_items"("cart_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_shopScopedId_key" ON "public"."cart_items"("cart_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "contact_messages_uid_key" ON "public"."contact_messages"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "contact_messages_shop_id_shopScopedId_key" ON "public"."contact_messages"("shop_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateways_uid_key" ON "public"."payment_gateways"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateways_shop_id_name_key" ON "public"."payment_gateways"("shop_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateways_shop_id_shopScopedId_key" ON "public"."payment_gateways"("shop_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_uid_key" ON "public"."wallet_transactions"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_shop_id_shopScopedId_key" ON "public"."wallet_transactions"("shop_id", "shopScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_uid_key" ON "public"."payments"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "payments_shop_id_shopScopedId_key" ON "public"."payments"("shop_id", "shopScopedId");

-- AddForeignKey
ALTER TABLE "public"."shop_counters" ADD CONSTRAINT "shop_counters_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_ref_fkey" FOREIGN KEY ("ref") REFERENCES "public"."users"("ref_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admins" ADD CONSTRAINT "admins_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blogs" ADD CONSTRAINT "blogs_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."faqs" ADD CONSTRAINT "faqs_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_logs" ADD CONSTRAINT "email_logs_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admins_emails" ADD CONSTRAINT "admins_emails_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."affiliate_settings" ADD CONSTRAINT "affiliate_settings_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."design_styles" ADD CONSTRAINT "design_styles_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_templates" ADD CONSTRAINT "email_templates_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."settings" ADD CONSTRAINT "settings_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_codes" ADD CONSTRAINT "session_codes_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."carts" ADD CONSTRAINT "carts_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contact_messages" ADD CONSTRAINT "contact_messages_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_gateways" ADD CONSTRAINT "payment_gateways_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wallet_transactions" ADD CONSTRAINT "wallet_transactions_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
