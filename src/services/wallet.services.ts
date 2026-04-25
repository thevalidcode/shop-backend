import { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "../config/db.config";
import type { WalletTopupInput } from "../schemas/wallet.schema";

const walletTransactionTypes = ["WALLET_CREDIT", "WALLET_DEBIT", "WALLET_REFUND"] as const;

export async function getUserWalletBalance(userUid: string, shopId: number) {
  const user = await prisma.user.findFirst({
    where: { uid: userUid, shopId },
    select: { balance: true, currency: true },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return {
    balance: Number(user.balance),
    currency: user.currency || "USD",
  };
}

export async function creditUserWallet(
  userUid: string,
  shopId: number,
  input: WalletTopupInput,
) {
  const user = await prisma.user.findFirst({
    where: { uid: userUid, shopId },
    select: { uid: true, balance: true, currency: true },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  await prisma.$transaction(async (tx) => {
    const nextBalance = new Decimal(user.balance).plus(input.amount);

    await tx.user.update({
      where: { uid: user.uid },
      data: { balance: nextBalance },
    });

    const counter = await tx.shopCounter.update({
      where: { shopId },
      data: { transactionCounter: { increment: 1 } },
      select: { transactionCounter: true },
    });

    await tx.transaction.create({
      data: {
        amount: new Decimal(input.amount),
        currency: user.currency || "USD",
        userUid,
        shopId,
        status: "SUCCESS",
        description: input.note || "Wallet top-up",
        type: "WALLET_CREDIT",
        shopScopedId: counter.transactionCounter,
      },
    });
  });

  return getUserWalletBalance(userUid, shopId);
}

export async function getWalletTransactions(userUid: string, shopId: number) {
  return prisma.transaction.findMany({
    where: {
      userUid,
      shopId,
      type: {
        in: [...walletTransactionTypes],
      },
    },
    orderBy: { id: "desc" },
    take: 50,
  });
}
