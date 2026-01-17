import { prisma } from "../config/db.config";
import type {
  CreateBillingInfoInput,
  UpdateBillingInfoInput,
} from "../schemas/billingInfo.schema";
import type { User } from "../../prisma/generated";

export const createBillingInfo = async (
  user: Partial<User>,
  data: CreateBillingInfoInput
) => {
  // If this is set as default, unset all other default billing info for this user
  if (data.isDefault) {
    await prisma.billingInfo.updateMany({
      where: {
        userUid: user.uid!,
        shopId: user.shopId!,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const counter = await prisma.shopCounter.update({
    where: { shopId: user.shopId! },
    data: {
      billingInfoCounter: { increment: 1 },
    },
  });

  const billingInfo = await prisma.billingInfo.create({
    data: {
      ...data,
      userUid: user.uid!,
      shopId: user.shopId!,
      shopScopedId: counter.billingInfoCounter,
    },
  });

  return billingInfo;
};

export const getUserBillingInfo = async (
  user: Partial<User>,
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const [billingInfos, total] = await Promise.all([
    prisma.billingInfo.findMany({
      where: {
        userUid: user.uid!,
        shopId: user.shopId!,
      },
      orderBy: [{ isDefault: "desc" }, { timestamp: "desc" }],
      skip,
      take: limit,
    }),
    prisma.billingInfo.count({
      where: {
        userUid: user.uid!,
        shopId: user.shopId!,
      },
    }),
  ]);

  return {
    billingInfos,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getBillingInfoByUid = async (
  user: Partial<User>,
  uid: string
) => {
  const billingInfo = await prisma.billingInfo.findFirst({
    where: {
      uid,
      userUid: user.uid!,
      shopId: user.shopId!,
    },
  });

  if (!billingInfo) {
    throw new Error("Billing information not found");
  }

  return billingInfo;
};

export const updateBillingInfo = async (
  user: Partial<User>,
  uid: string,
  data: UpdateBillingInfoInput
) => {
  // Verify ownership
  const existing = await getBillingInfoByUid(user, uid);

  // If this is set as default, unset all other default billing info for this user
  if (data.isDefault) {
    await prisma.billingInfo.updateMany({
      where: {
        userUid: user.uid!,
        shopId: user.shopId!,
        isDefault: true,
        uid: { not: uid },
      },
      data: {
        isDefault: false,
      },
    });
  }

  const billingInfo = await prisma.billingInfo.update({
    where: {
      uid: existing.uid,
    },
    data,
  });

  return billingInfo;
};

export const deleteBillingInfo = async (user: Partial<User>, uid: string) => {
  // Verify ownership
  const existing = await getBillingInfoByUid(user, uid);

  await prisma.billingInfo.delete({
    where: {
      uid: existing.uid,
    },
  });

  return { message: "Billing information deleted successfully" };
};

export const getDefaultBillingInfo = async (user: Partial<User>) => {
  const billingInfo = await prisma.billingInfo.findFirst({
    where: {
      userUid: user.uid!,
      shopId: user.shopId!,
      isDefault: true,
    },
  });

  return billingInfo;
};
