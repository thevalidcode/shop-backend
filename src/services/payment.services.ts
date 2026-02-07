import flutterwaveProvider from "../providers/flutterwave.providers";
import paystackProvider from "../providers/paystack.providers";
import { prisma } from "../config/db.config";
import { initFlutterwavePayment } from "../providers/flutterwave.providers";
import { initPaystackPayment } from "../providers/paystack.providers";
import type { CreatePaymentInput } from "../schemas/payment.schema";
import { TransactionType, User } from "../../prisma/generated";
import {
  FlutterwaveWebhookData,
  PaystackWebhookData,
} from "../schemas/webhook.schema";
import type { Request } from "express";
import { calculateCartTotal, placeOrderFromCart } from "../utils/cart";
import convertCurrency from "../utils/ConvertCurrency";
import { v4 } from "uuid";
import { Decimal } from "@prisma/client/runtime/client";

export const createPayment = async (user: User, input: CreatePaymentInput) => {
  const {
    platform,
    currency,
    cartUid,
    redirectUrl,
    billingInfoUid,
    notes,
    shippingCost,
    shippingCurrency,
    selectedShippingRate,
  } = input;
  const { uid: userUid, shopId } = user;

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

  const cart = await prisma.cart.findFirst({
    where: { uid: cartUid, userUid, shopId },
    include: { items: { include: { product: true } } },
  });

  if (!cart) {
    throw new Error("No cart was found");
  }

  // Calculate total price using reusable utility
  const cartTotal = await calculateCartTotal(cart);
  const cartAmount = cartTotal.amount;
  const cartCurrency = cartTotal.currency;

  // Convert shipping cost to cart currency if provided
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
    // If no shipping currency provided, assume it matches cart currency
    shippingInCartCurrency = new Decimal(shippingCost);
  }

  const finalAmount = cartAmount.plus(shippingInCartCurrency);

  // Convert final amount to payment currency
  const convertedAmount = await convertCurrency(
    finalAmount.toNumber(),
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
    redirect_url: redirectUrl,
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
      billingInfoUid,
      notes,
      userUid: user.uid,
      shopId: user.shopId,
      type: "CREDIT" as TransactionType,
      shippingCost,
      shippingCurrency,
      selectedShippingRate,
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
        amount: finalAmount,
        currency,
        userUid: user.uid,
        method: platform,
        paymentGatewayUid: gateway.uid,
        chargedAmount: finalAmount,
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
      await placeOrderFromCart(
        billingInfoUid,
        uuid,
        true,
        notes,
        user,
        shippingCost,
        shippingCurrency,
        selectedShippingRate,
      );
      return {
        message: "Manual payment initiated. " + gateway.description,
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
