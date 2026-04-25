import "dotenv/config";
import { prisma } from "../../config/db.config";
import { DeleteShopParams } from "../../schemas/internal.schema";
import { assertValidDomain } from "../../utils/domain.guard";
import { exec } from "child_process";
import { ShopError } from "../../errors/shop.error";
import { env } from "../../config/env.config";

export function runShopDeleteCLI(domain: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cmd = `validpanel-cli stores:delete ${domain} shop`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(new ShopError("CLI_ERROR", stderr || error.message));
      }
      resolve();
    });
  });
}

export async function DeleteShop(params: DeleteShopParams) {
  const { uid: shopDomain } = params;

  try {
    // Step 0: Validate domain rules
    if (!shopDomain.startsWith("localhost")) assertValidDomain(shopDomain);
    const existingShop = await prisma.shop.findFirst({
      where: { uid: shopDomain },
    });

    if (!existingShop) {
      throw new ShopError(
        "STORE_NOT_FOUND",
        "A shop with the given domain wasn't found",
      );
    }

    if (!shopDomain.startsWith("localhost") && env.NODE_ENV === "production")
      await runShopDeleteCLI(shopDomain);
    await prisma.shop.delete({ where: { uid: shopDomain } });

    return;
  } catch (err: any) {
    if (err instanceof ShopError) throw err;
    throw new ShopError("DB_ERROR", err.message || "Database error");
  }
}
