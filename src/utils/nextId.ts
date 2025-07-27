import { prisma } from "../config/db";

export const getNextShopModelId = async (
  model: keyof typeof prisma,
  shop_id: number
): Promise<number> => {
  try {
    const result = await (prisma[model] as any).findFirst({
      where: { shop_id },
      orderBy: { id: "desc" },
      select: { id: true },
    });

    return result?.id ? result.id + 1 : 0;
  } catch (err: any) {
    throw new Error(
      `Failed to get next ID for ${String(model)}: ${err.message}`
    );
  }
};
