import "dotenv/config";
import { prisma } from "../../config/db.config";
import { CreateShopParams } from "../../schemas/internal.schema";
import { assertValidDomain } from "../../utils/domain.guard";
import { exec } from "child_process";
import { ShopError } from "../../errors/shop.error";
import { env } from "../../config/env.config";

export function runShopCreateCLI(domain: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cmd = `validpanel-cli stores:add ${domain} shop`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(
          new ShopError("CLI_ERROR", stderr || stdout || error.message),
        );
      }

      if (stderr) {
        return reject(new ShopError("CLI_STDERR", stderr));
      }

      resolve();
    });
  });
}

export async function CreateShop(params: CreateShopParams) {
  const {
    storeId: shopId,
    storeDomain: shopDomain,
    name,
    description,
    adminEmail,
    adminUsername,
    fullName,
    logoUrl,
    faviconUrl,
    adminImage,
    adminId,
    adminUid,
  } = params;

  try {
    console.log("called")
    // Step 0: Validate domain rules
    if (!shopDomain.startsWith("localhost")) assertValidDomain(shopDomain);

    const response = await prisma.$transaction(async (tx) => {
      // Step 1: Ensure shop domain is unique
      const existingShop = await tx.shop.findFirst({
        where: { uid: shopDomain },
        select: { shopId: true },
      });

      if (existingShop) {
        throw new ShopError(
          "DOMAIN_TAKEN",
          "Shop domain has already been used",
        );
      }

      // Step 3: Create shop
      const shop = await tx.shop.create({
        data: {
          uid: shopDomain,
          status: "DISABLED",
          shopId,
          description: description || null,
          name,
          ssl: true,
        },
      });

      // Step 4: Initialize counters
      await tx.shopCounter.create({
        data: { shopId: shop.shopId },
      });

      // Step 5: Create default settings
      const setting = await tx.setting.create({
        data: {
          shopId: shop.shopId,
          shopName: name,
          shopDescription: description || null,
          faviconUrl: faviconUrl || null,
          logoUrl: logoUrl || null,
          defaultClientCurrency: "USD",
          showBanner: true,
        },
      });

      // Step 6: Create admin account
      const admin = await tx.admin.create({
        data: {
          uid: adminUid,
          apiKey: crypto.randomUUID(),
          id: adminId,
          email: adminEmail,
          image: adminImage || null,
          username: adminUsername || fullName,
          password: crypto.randomUUID(),
          fullName: fullName || null,
          shopId: shop.shopId,
        },
      });

      await tx.adminEmail.create({
        data: {
          emails: [adminEmail],
          shopId: shop.shopId,
        },
      });

      return { shop, setting, admin };
    });

    // Step 7: Run CLI to provision shop
    if (!shopDomain.startsWith("localhost") && env.NODE_ENV === "production") {
      try {
        await runShopCreateCLI(shopDomain);
      } catch (cliError) {
        // Rollback: Delete created records if CLI fails
        await prisma.$transaction(async (tx) => {
          await tx.admin.delete({ where: { shopId } });
          await tx.setting.delete({ where: { shopId } });
          await tx.adminEmail.delete({ where: { shopId } });
          await tx.shopCounter.delete({ where: { shopId } });
          await tx.shop.delete({ where: { shopId } });
        });

        throw cliError;
      }
    }

    return response;
  } catch (err: any) {
    if (err instanceof ShopError) throw err;
    throw new ShopError("DB_ERROR", err.message || "Database error");
  }
}
