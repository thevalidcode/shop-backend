import flutterwaveProvider from "../providers/flutterwave.providers";
import paystackProvider from "../providers/paystack.providers";
import { prisma } from "../config/db.config";
import { initFlutterwavePayment } from "../providers/flutterwave.providers";
import { initPaystackPayment } from "../providers/paystack.providers";
import type { CreatePaymentInput } from "../schemas/payment.schema";
import type { CreateWalletPaymentInput } from "../schemas/payment.schema";
import { User } from "../../prisma/generated";
import {
  FlutterwaveWebhookData,
  PaystackWebhookData,
} from "../schemas/webhook.schema";
import type { Request } from "express";
import { calculateCartTotal, placeOrderFromCartTx } from "../utils/cart";
import convertCurrency from "../utils/ConvertCurrency";
import { v4 } from "uuid";
import { Decimal } from "@prisma/client/runtime/client";

const BALANCE_GATEWAY_PLATFORM = "CREDIT";

function buildRedirectUrlWithPaymentUid(baseUrl: string, paymentUid: string) {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("uid", paymentUid);
    return url.toString();
  } catch {
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}uid=${paymentUid}`;
  }
}

async function getOrCreateBalanceGateway(shopId: number) {
  const existing = await prisma.paymentGateway.findFirst({
    where: {
      shopId,
      platform: BALANCE_GATEWAY_PLATFORM,
      status: "ACTIVE",
    },
    select: { uid: true },
  });

  if (existing) {
    return existing;
  }

  const counter = await prisma.shopCounter.update({
    where: { shopId },
    data: { paymentGatewayCounter: { increment: 1 } },
    select: { paymentGatewayCounter: true },
  });

  return prisma.paymentGateway.create({
    data: {
      uid: v4(),
      shopId,
      shopScopedId: counter.paymentGatewayCounter,
      name: "Wallet Balance",
      description: "System gateway used for wallet balance checkout",
      min: new Decimal(0),
      max: new Decimal(1000000),
      currency: "USD",
      position: 0,
      platform: BALANCE_GATEWAY_PLATFORM,
      status: "ACTIVE",
      signature: null,
      webhookUrl: null,
      feePercent: 0,
    },
    select: { uid: true },
  });
}

export const createPayment = async (user: User, input: CreatePaymentInput) => {
  const {
    platform,
    useBalance,
    purpose = "ORDER",
    currency,
    cartUid,
    redirectUrl,
    shippingInfoUid,
    notes,
    shippingCost,
    shippingCurrency,
    selectedShippingRate,
  } = input;
  const { uid: userUid, shopId } = user;

  const cart = await prisma.cart.findFirst({
    where: { uid: cartUid, userUid, shopId },
    include: { items: { include: { product: true } } },
  });

  if (!cart) {
    throw new Error("No cart was found");
  }

  const cartTotal = await calculateCartTotal(cart);
  const cartAmount = cartTotal.amount;
  const cartCurrency = cartTotal.currency;

  let shippingInCartCurrency = new Decimal(0);
  if (shippingCost && shippingCurrency) {
    if (shippingCurrency !== cartCurrency) {
      const converted = await convertCurrency(
        shippingCost,
        shippingCurrency,
        cartCurrency,
      );
      shippingInCartCurrency = new Decimal(converted);
    } else {
      shippingInCartCurrency = new Decimal(shippingCost);
    }
  } else if (shippingCost) {
    shippingInCartCurrency = new Decimal(shippingCost);
  }

  const finalAmountCartCurrency = cartAmount.plus(shippingInCartCurrency);

  if (useBalance && platform === BALANCE_GATEWAY_PLATFORM) {

    const balanceGateway = await getOrCreateBalanceGateway(shopId);
    const paymentUid = v4();

    await prisma.$transaction(async (tx) => {
      const paymentCounter = await tx.shopCounter.update({
        where: { shopId: user.shopId! },
        data: { paymentCounter: { increment: 1 } },
        select: { paymentCounter: true },
      });

      await tx.payment.create({
        data: {
          status: "PENDING",
          uid: paymentUid,
          amount: finalAmountCartCurrency,
          currency: cartCurrency,
          userUid: user.uid,
          method: BALANCE_GATEWAY_PLATFORM,
          paymentGatewayUid: balanceGateway.uid,
          chargedAmount: finalAmountCartCurrency,
          shopScopedId: paymentCounter.paymentCounter,
          shopId: user.shopId!,
        },
      });

      const freshUser = await tx.user.findFirst({
        where: { uid: user.uid, shopId: user.shopId! },
        select: { balance: true, currency: true },
      });

      if (!freshUser) {
        throw new Error("User not found");
      }

      let debitAmountInUserCurrency = finalAmountCartCurrency;
      if (cartCurrency !== freshUser.currency) {
        const converted = await convertCurrency(
          finalAmountCartCurrency.toNumber(),
          cartCurrency,
          freshUser.currency,
        );
        debitAmountInUserCurrency = new Decimal(converted);
      }

      const initialBalance = new Decimal(freshUser.balance);
      if (initialBalance.lessThan(debitAmountInUserCurrency)) {
        throw new Error("INSUFFICIENT_WALLET_BALANCE");
      }

      const finalBalance = initialBalance.minus(debitAmountInUserCurrency);

      await tx.user.update({
        where: { uid: user.uid },
        data: {
          balance: finalBalance,
          spent: { increment: debitAmountInUserCurrency },
        },
      });

      const walletTransactionCounter = await tx.shopCounter.update({
        where: { shopId: user.shopId! },
        data: { transactionCounter: { increment: 1 } },
        select: { transactionCounter: true },
      });

      await tx.transaction.create({
        data: {
          amount: debitAmountInUserCurrency,
          currency: freshUser.currency,
          userUid: user.uid,
          shopId: user.shopId!,
          status: "SUCCESS",
          description: `Wallet debit for checkout (${finalAmountCartCurrency.toFixed(2)} ${cartCurrency})`,
          type: "WALLET_DEBIT",
          shopScopedId: walletTransactionCounter.transactionCounter,
        },
      });

      const placed = await placeOrderFromCartTx(
        shippingInfoUid,
        paymentUid,
        false,
        notes,
        user,
        tx,
        shippingCost,
        shippingCurrency,
        selectedShippingRate,
      );

      if (placed.error) {
        throw new Error(placed.error);
      }

      if (!placed.order?.id) {
        throw new Error("Order creation failed");
      }

      await tx.order.update({
        where: { id: placed.order.id },
        data: {
          userInitialBalance: initialBalance,
          userFinalBalance: finalBalance,
          paidWithBalance: true,
          paymentSource: "BALANCE",
        },
      });

      await tx.payment.update({
        where: { uid: paymentUid },
        data: { status: "SUCCESS" },
      });
    });

    return {
      message: "Payment completed with wallet balance",
      paymentUid,
      paymentSource: "BALANCE",
    };
  }

  const gateway = await prisma.paymentGateway.findFirst({
    where: { platform, shopId },
    select: {
      uid: true,
      encryptedSecretKey: true,
      iv: true,
      description: true,
      platform: true,
    },
  });

  if (!gateway) {
    throw new Error("Payment gateway not configured");
  }

  const shouldUseHybrid =
    Boolean(useBalance) &&
    platform !== BALANCE_GATEWAY_PLATFORM &&
    platform !== "MANUAL";

  const userBalance = await prisma.user.findFirst({
    where: { uid: user.uid, shopId: user.shopId! },
    select: { balance: true, currency: true },
  });

  if (!userBalance) {
    throw new Error("User not found");
  }

  let availableBalanceInCartCurrency = new Decimal(0);
  if (shouldUseHybrid) {
    if (userBalance.currency === cartCurrency) {
      availableBalanceInCartCurrency = new Decimal(userBalance.balance);
    } else {
      const convertedBalance = await convertCurrency(
        Number(userBalance.balance),
        userBalance.currency,
        cartCurrency,
      );
      availableBalanceInCartCurrency = new Decimal(convertedBalance);
    }
  }

  const balancePortionInCartCurrency = shouldUseHybrid
    ? Decimal.min(availableBalanceInCartCurrency, finalAmountCartCurrency)
    : new Decimal(0);

  const gatewayPortionInCartCurrency = finalAmountCartCurrency.minus(
    balancePortionInCartCurrency,
  );

  if (shouldUseHybrid && gatewayPortionInCartCurrency.lte(0)) {
    throw new Error(
      "Wallet already covers full amount. Use wallet balance payment option.",
    );
  }

  // Convert payable gateway amount (not total) to selected payment currency
  const convertedAmount = await convertCurrency(
    gatewayPortionInCartCurrency.toNumber(),
    cartCurrency,
    currency,
  );

  const totalInPaymentCurrency = await convertCurrency(
    finalAmountCartCurrency.toNumber(),
    cartCurrency,
    currency,
  );

  const setting = await prisma.setting.findFirst({
    select: { shopName: true, logoUrl: true },
  });

  if (!setting) throw new Error("Platform's settings missing");

  const uuid = v4();

  const paymentData = {
    tx_ref: uuid,
    amount: convertedAmount,
    currency,
    redirect_url: buildRedirectUrlWithPaymentUid(redirectUrl, uuid),
    customer: {
      email: user.email,
    },
    customizations: {
      title: setting.shopName,
      description: gateway.description,
      logo: setting.logoUrl,
    },
    meta: {
      cartUid: cartUid,
      txRef: uuid,
      purpose,
      shippingInfoUid,
      notes,
      userUid: user.uid,
      shopId: user.shopId,
      shippingCost,
      shippingCurrency,
      selectedShippingRate,
      useBalance: shouldUseHybrid,
    },
  };

  if (
    gateway.platform !== "MANUAL" &&
    (gateway.encryptedSecretKey === null || gateway.iv === null)
  ) {
    throw new Error("Payment gateway not properly configured");
  }

  const parsedSecretKey = {
    encryptedSecretKey: gateway.encryptedSecretKey!,
    iv: gateway.iv!,
  };
  await prisma.$transaction(async (tx) => {
    const counter = await tx.shopCounter.update({
      where: { shopId: user.shopId! },
      data: {
        paymentCounter: { increment: 1 },
      },
    });

    await tx.payment.create({
      data: {
        status: "PENDING",
        uid: uuid,
        amount: new Decimal(totalInPaymentCurrency),
        currency,
        userUid: user.uid,
        method: platform,
        paymentGatewayUid: gateway.uid,
        chargedAmount: new Decimal(convertedAmount),
        shopScopedId: counter.paymentCounter,
        shopId: user.shopId!,
      },
    });
  });

  switch (platform) {
    case "FLUTTERWAVE":
      return initFlutterwavePayment(paymentData, parsedSecretKey);
    case "PAYSTACK":
      return initPaystackPayment(paymentData, parsedSecretKey);
    case "MANUAL":
      await placeOrderFromCartTx(
        shippingInfoUid,
        uuid,
        true,
        notes,
        user,
        undefined,
        shippingCost,
        shippingCurrency,
        selectedShippingRate,
      );
      return {
        message: "Manual payment initiated. " + gateway.description,
        paymentSource: "DIRECT",
      };
    default:
      throw new Error("Unsupported payment platform");
  }
};

export const createWalletTopupPayment = async (
  user: User,
  input: CreateWalletPaymentInput,
) => {
  const gateway = await prisma.paymentGateway.findFirst({
    where: { platform: input.platform, shopId: user.shopId },
    select: {
      uid: true,
      encryptedSecretKey: true,
      iv: true,
      description: true,
      platform: true,
    },
  });

  if (!gateway) {
    throw new Error("Payment gateway not configured");
  }

  const amount = new Decimal(input.amount);
  if (amount.lte(0)) {
    throw new Error("Invalid wallet top-up amount");
  }

  const setting = await prisma.setting.findFirst({
    select: { shopName: true, logoUrl: true },
  });

  if (!setting) throw new Error("Platform's settings missing");

  const paymentUid = v4();

  if (
    gateway.platform !== "MANUAL" &&
    (gateway.encryptedSecretKey === null || gateway.iv === null)
  ) {
    throw new Error("Payment gateway not properly configured");
  }

  const parsedSecretKey = {
    encryptedSecretKey: gateway.encryptedSecretKey!,
    iv: gateway.iv!,
  };

  await prisma.$transaction(async (tx) => {
    const paymentCounter = await tx.shopCounter.update({
      where: { shopId: user.shopId! },
      data: { paymentCounter: { increment: 1 } },
      select: { paymentCounter: true },
    });

    await tx.payment.create({
      data: {
        status: "PENDING",
        uid: paymentUid,
        amount,
        currency: input.currency,
        userUid: user.uid,
        method: input.platform,
        paymentGatewayUid: gateway.uid,
        chargedAmount: amount,
        purpose: "WALLET_TOPUP",
        shopScopedId: paymentCounter.paymentCounter,
        shopId: user.shopId!,
      },
    });
  });

  const paymentData = {
    tx_ref: paymentUid,
    amount: amount.toNumber(),
    currency: input.currency,
    redirectUrl: buildRedirectUrlWithPaymentUid(input.redirectUrl, paymentUid),
    redirect_url: buildRedirectUrlWithPaymentUid(input.redirectUrl, paymentUid),
    customer: {
      email: user.email,
    },
    customizations: {
      title: setting.shopName,
      description: gateway.description || "Wallet top-up",
      logo: setting.logoUrl,
    },
    meta: {
      purpose: "WALLET_TOPUP",
      paymentUid,
      userUid: user.uid,
      shopId: user.shopId,
      amount: amount.toNumber(),
      currency: input.currency,
    },
  };

  switch (input.platform) {
    case "FLUTTERWAVE":
      return initFlutterwavePayment(paymentData, parsedSecretKey);
    case "PAYSTACK":
      return initPaystackPayment(paymentData, parsedSecretKey);
    case "MANUAL":
      return {
        message: "Manual wallet top-up initiated. ",
        paymentSource: "DIRECT",
      };
    default:
      throw new Error("Unsupported payment platform");
  }
};

const handleFlutterwaveSuccess = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["data"]["customer"],
) => {
  return await flutterwaveProvider.processSuccess(req, data, customer);
};

const handleFlutterwaveFailure = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["data"]["customer"],
) => {
  return await flutterwaveProvider.processFailure(req, data, customer);
};

const handlePaystackSuccess = async (
  req: Request,
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"],
) => {
  return await paystackProvider.processSuccess(req, data, customer);
};

const handlePaystackFailure = async (
  req: Request,
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"],
) => {
  return await paystackProvider.processFailure(req, data, customer);
};

export default {
  handleFlutterwaveSuccess,
  handleFlutterwaveFailure,
  handlePaystackSuccess,
  handlePaystackFailure,
};
