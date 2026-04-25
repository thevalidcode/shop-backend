import { Decimal } from "@prisma/client/runtime/client";
import { PaymentGatewayPlatform } from "../../../prisma/generated";
import { prisma } from "../../config/db.config";
import { sendUserEmail } from "../../emails";
import { placeOrderFromCartTx } from "../../utils/cart";
import convertCurrency from "../../utils/ConvertCurrency";

interface ShopPaymentSuccessInput {
  paymentUid: string;
  shopId: number;
  customerEmail: string;
  shippingInfoUid?: string;
  notes?: string;
  shippingCost?: number;
  shippingCurrency?: string;
  selectedShippingRate?: unknown;
  paymentMethod: PaymentGatewayPlatform;
}

interface ShopPaymentFailureInput {
  paymentUid: string;
  shopId: number;
  customerEmail: string;
}

export async function handleShopPaymentSuccess({
  paymentUid,
  shopId,
  customerEmail,
  shippingInfoUid,
  notes,
  shippingCost,
  shippingCurrency,
  selectedShippingRate,
  paymentMethod,
}: ShopPaymentSuccessInput): Promise<void> {
  const payment = await prisma.payment.findFirst({
    where: { uid: paymentUid, status: "PENDING", shopId },
    select: {
      purpose: true,
      amount: true,
      chargedAmount: true,
      currency: true,
      uid: true,
      shopId: true,
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  const user = await prisma.user.findFirst({
    where: { email: customerEmail, shopId },
    include: { shop: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (payment.purpose === "WALLET_TOPUP") {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { uid: payment.uid },
        data: { status: "SUCCESS" },
      });

      const userRecord = await tx.user.findFirst({
        where: { uid: user.uid, shopId },
        select: { balance: true, currency: true, uid: true },
      });

      if (!userRecord) {
        throw new Error("User not found");
      }

      let creditAmount = new Decimal(payment.amount);
      let creditCurrency = payment.currency;

      if (payment.currency !== userRecord.currency) {
        const converted = await convertCurrency(
          Number(payment.amount),
          payment.currency,
          userRecord.currency,
        );
        creditAmount = new Decimal(converted);
        creditCurrency = userRecord.currency;
      }

      const nextBalance = new Decimal(userRecord.balance).plus(creditAmount);

      await tx.user.update({
        where: { uid: user.uid },
        data: { balance: nextBalance },
      });

      const transactionCounter = await tx.shopCounter.update({
        where: { shopId },
        data: { transactionCounter: { increment: 1 } },
        select: { transactionCounter: true },
      });

      await tx.transaction.create({
        data: {
          amount: creditAmount,
          currency: creditCurrency,
          userUid: user.uid,
          shopId,
          status: "SUCCESS",
          description: `Wallet top-up via ${paymentMethod}`,
          type: "WALLET_CREDIT",
          shopScopedId: transactionCounter.transactionCounter,
        },
      });
    });
  } else {
    await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findFirst({
        where: { paymentUid: payment.uid, shopId },
        select: { id: true, status: true },
      });

      // Hybrid flow: amount = total order amount, chargedAmount = external gateway amount.
      // The difference is debited from the user's wallet only after gateway success.
      const walletPortionInPaymentCurrency = new Decimal(payment.amount).minus(
        new Decimal(payment.chargedAmount),
      );

      let initialBalance = new Decimal(user.balance);
      let finalBalance = initialBalance;
      let walletDebited = new Decimal(0);

      if (walletPortionInPaymentCurrency.gt(0)) {
        const userRecord = await tx.user.findFirst({
          where: { uid: user.uid, shopId },
          select: { balance: true, currency: true },
        });

        if (!userRecord) {
          throw new Error("User not found");
        }

        initialBalance = new Decimal(userRecord.balance);

        if (userRecord.currency === payment.currency) {
          walletDebited = walletPortionInPaymentCurrency;
        } else {
          const converted = await convertCurrency(
            Number(walletPortionInPaymentCurrency),
            payment.currency,
            userRecord.currency,
          );
          walletDebited = new Decimal(converted);
        }

        if (initialBalance.lessThan(walletDebited)) {
          throw new Error("INSUFFICIENT_WALLET_BALANCE");
        }

        finalBalance = initialBalance.minus(walletDebited);

        await tx.user.update({
          where: { uid: user.uid },
          data: {
            balance: finalBalance,
            spent: { increment: walletDebited },
          },
        });

        const transactionCounter = await tx.shopCounter.update({
          where: { shopId },
          data: { transactionCounter: { increment: 1 } },
          select: { transactionCounter: true },
        });

        await tx.transaction.create({
          data: {
            amount: walletDebited,
            currency: userRecord.currency,
            userUid: user.uid,
            shopId,
            status: "SUCCESS",
            description: `Wallet debit for hybrid checkout (${walletPortionInPaymentCurrency.toFixed(2)} ${payment.currency})`,
            type: "WALLET_DEBIT",
            shopScopedId: transactionCounter.transactionCounter,
          },
        });
      }

      await tx.payment.update({
        where: { uid: payment.uid },
        data: { status: "SUCCESS" },
      });

      if (existingOrder) {
        if (existingOrder.status === "VERIFYING_PAYMENT") {
          await tx.order.update({
            where: { id: existingOrder.id },
            data: { status: "PROCESSING" },
          });
        }
      } else {
        if (!shippingInfoUid) {
          throw new Error("Missing shipping information for order payment processing");
        }

        await placeOrderFromCartTx(
          shippingInfoUid,
          payment.uid,
          false,
          notes,
          user,
          tx,
          shippingCost,
          shippingCurrency,
          selectedShippingRate,
        );
      }

      if (walletPortionInPaymentCurrency.gt(0)) {
        await tx.order.updateMany({
          where: { paymentUid: payment.uid, shopId },
          data: {
            paidWithBalance: true,
            paymentSource: "DIRECT",
            userInitialBalance: initialBalance,
            userFinalBalance: finalBalance,
          },
        });
      }
    });
  }

  try {
    await sendUserEmail(payment.shopId, user.email, "PAYMENT_SUCCESSFUL", {
      userName: user.fullName || user.username,
      transactionId: payment.uid,
      amount: Number(payment.amount).toFixed(2),
      currency: payment.currency,
      paymentDate: new Date().toLocaleDateString(),
      paymentMethod,
      receiptUrl:
        payment.purpose === "WALLET_TOPUP"
          ? `https://${user.shop.uid || ""}/client/add-funds`
          : `https://${user.shop.uid || ""}/client/orders`,
    });
  } catch (emailError) {
    console.error("Failed to send payment success email:", emailError);
  }
}

export async function handleShopPaymentFailure({
  paymentUid,
  shopId,
  customerEmail,
}: ShopPaymentFailureInput): Promise<void> {
  const payment = await prisma.payment.findFirst({
    where: { uid: paymentUid, status: "PENDING", shopId },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  const user = await prisma.user.findFirst({
    where: { email: customerEmail, shopId },
    include: { shop: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.payment.update({
    where: { uid: payment.uid },
    data: { status: "FAILED" },
  });

  if (payment.purpose === "ORDER") {
    await prisma.order.updateMany({
      where: {
        paymentUid: payment.uid,
        shopId,
        status: { in: ["VERIFYING_PAYMENT", "PENDING", "PROCESSING"] },
      },
      data: { status: "CANCELED" },
    });
  }

  try {
    await sendUserEmail(payment.shopId, user.email, "PAYMENT_FAILED", {
      userName: user.fullName || user.username,
      transactionId: payment.uid,
      amount: Number(payment.amount).toFixed(2),
      currency: payment.currency,
      failureReason:
        "Your payment was declined. Please check your payment details and try again.",
      retryUrl: `https://${user.shop.uid || ""}/client/checkout?step=payment`,
    });
  } catch (emailError) {
    console.error("Failed to send payment failure email:", emailError);
  }
}
