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

export const createPayment = async (user: User, input: CreatePaymentInput) => {
  const { platform, currency, orderUid, redirect_url } = input;
  const { uid: userUid, shopId } = user;

  const gateway = await prisma.paymentGateway.findFirst({
    where: { platform },
    select: { encryptedSecretKey: true, iv: true, description: true },
  });

  if (!gateway) {
    throw new Error("Payment gateway not configured");
  }

  const order = await prisma.order.findFirst({
    where: { uid: orderUid, userUid, shopId, status: "PENDING" },
  });

  if (!order) {
    throw new Error("No order was found");
  }

  const setting = await prisma.setting.findFirst({
    select: { shopName: true, logoUrl: true },
  });

  if (!setting) throw new Error("Platform's settings missing");

  const paymentData = {
    tx_ref: order.uid,
    amount: order.totalAmount.toNumber(),
    currency,
    redirect_url,
    customer: {
      email: user.email,
    },
    customizations: {
      title: setting.shopName,
      description: gateway.description,
      logo: setting.logoUrl,
    },
    meta: {
      orderUid: orderUid,
      txRef: order.uid,
      userUid: user.uid,
      shopId: user.shopId,
      type: "CREDIT" as TransactionType,
    },
  };

  if (gateway.encryptedSecretKey === null || gateway.iv === null) {
    throw new Error("Payment gateway not properly configured");
  }

  const parsedSecretKey = {
    encryptedSecretKey: gateway.encryptedSecretKey,
    iv: gateway.iv,
  };
  await prisma.$transaction(async (tx) => {
    const counter = await tx.shopCounter.update({
      where: { shopId: user.shopId! },
      data: {
        paymentCounter: { increment: 1 },
      },
    });

    await prisma.payment.create({
      data: {
        status: "PENDING",
        uid: order.uid,
        amount: order.totalAmount,
        currency,
        userUid: user.uid,
        method: platform,
        chargedAmount: order.totalAmount,
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
    default:
      throw new Error("Unsupported payment platform");
  }
};

const handleFlutterwaveSuccess = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["data"]["customer"]
) => {
  return await flutterwaveProvider.processSuccess(req, data, customer);
};

const handleFlutterwaveFailure = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["data"]["customer"]
) => {
  return await flutterwaveProvider.processFailure(req, data, customer);
};

const handlePaystackSuccess = async (
  req: Request,
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"]
) => {
  return await paystackProvider.processSuccess(req, data, customer);
};

const handlePaystackFailure = async (
  req: Request,
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"]
) => {
  return await paystackProvider.processFailure(req, data, customer);
};

export default {
  handleFlutterwaveSuccess,
  handleFlutterwaveFailure,
  handlePaystackSuccess,
  handlePaystackFailure,
};
