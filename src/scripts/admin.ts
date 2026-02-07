import { prisma } from "../config/db.config";

if (require.main === module) {
  (async () => {
    const result = await prisma.admin.update({
      where: { id: 1, shopId: 1 },
      data: {
        password:
          "$2a$12$lPZwvy1FFz87pdOWlpdlj.VEDuZ/FiyvDAUsako5iOlbt/rshjxCu",
      },
    });

    await prisma.shop.update({
      where: { shopId: 1 },
      data: {
        status: "ACTIVE",
        features: {
          stores: 1,
          products: 100,
          staff_accounts: 5,
          payment_gateways: 4,
          available_templates: 5,

          // Core capabilities
          analytics: true,
          api_access: true,
          ai_features: true,
          priority_support: true,

          // Shop customization
          custom_branding: true,
          custom_domain: true,
          free_ssl: true,
          hide_platform_banner: false,
          custom_templates: true,

          // Product & order management
          unlimited_products: false,
          social_store_order_sync: true,
          social_store_service_sync: true,

          // Communication features
          store_email_notifications: true,
          store_custom_emails: true,
          store_newsletters: true,

          // Shipping features
          automated_shipping_allowed: true,
          max_shipping_accounts: 5,
        },
      },
    });

    console.log("Admin updated successfully:");
    console.log(result);

    process.exit(0);
  })().catch((err) => {
    console.error("Error updating shop:", err);
    process.exit(1);
  });
}
