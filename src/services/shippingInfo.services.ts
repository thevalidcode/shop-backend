import { prisma } from "../config/db.config";
import type {
  CreateShippingInfoInput,
  UpdateShippingInfoInput,
} from "../schemas/shippingInfo.schema";
import type { User } from "../../prisma/generated";

export const createShippingInfo = async (
  user: Partial<User>,
  data: CreateShippingInfoInput,
) => {
  if (!user.uid || !user.shopId) {
    throw new Error("User UID and Shop ID are required");
  }

  // If this is set as default, unset all other default shipping information for this user
  if (data.isDefault) {
    await prisma.shippingInfo.updateMany({
      where: {
        userUid: user.uid,
        shopId: user.shopId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const counter = await prisma.shopCounter.update({
    where: { shopId: user.shopId },
    data: {
      shippingInfoCounter: { increment: 1 },
    },
  });

  const shippingInfo = await prisma.shippingInfo.create({
    data: {
      ...data,
      userUid: user.uid!,
      shopId: user.shopId!,
      shopScopedId: counter.shippingInfoCounter,
    },
  });

  return shippingInfo;
};

export const getUserShippingInfo = async (
  user: Partial<User>,
  page: number = 1,
  limit: number = 20,
) => {
  const skip = (page - 1) * limit;

  const [shippingInfos, total] = await Promise.all([
    prisma.shippingInfo.findMany({
      where: {
        userUid: user.uid!,
        shopId: user.shopId!,
      },
      orderBy: [{ isDefault: "desc" }, { timestamp: "desc" }],
      skip,
      take: limit,
    }),
    prisma.shippingInfo.count({
      where: {
        userUid: user.uid!,
        shopId: user.shopId!,
      },
    }),
  ]);

  return {
    shippingInfos,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getShippingInfoByUid = async (
  user: Partial<User>,
  uid: string,
) => {
  const shippingInfo = await prisma.shippingInfo.findFirst({
    where: {
      uid,
      userUid: user.uid!,
      shopId: user.shopId!,
    },
  });

  if (!shippingInfo) {
    throw new Error("Shipping information not found");
  }

  return shippingInfo;
};

export const updateShippingInfo = async (
  user: Partial<User>,
  uid: string,
  data: UpdateShippingInfoInput,
) => {
  // Verify ownership
  const existing = await getShippingInfoByUid(user, uid);

  // If this is set as default, unset all other default shipping information for this user
  if (data.isDefault) {
    await prisma.shippingInfo.updateMany({
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

  const shippingInfo = await prisma.shippingInfo.update({
    where: {
      uid: existing.uid,
    },
    data,
  });

  return shippingInfo;
};

export const deleteShippingInfo = async (user: Partial<User>, uid: string) => {
  // Verify ownership
  const existing = await getShippingInfoByUid(user, uid);

  await prisma.shippingInfo.delete({
    where: {
      uid: existing.uid,
    },
  });

  return { message: "Shipping information deleted successfully" };
};

export const getDefaultShippingInfo = async (user: Partial<User>) => {
  const shippingInfo = await prisma.shippingInfo.findFirst({
    where: {
      userUid: user.uid!,
      shopId: user.shopId!,
      isDefault: true,
    },
  });

  return shippingInfo;
};
