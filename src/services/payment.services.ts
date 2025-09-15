import flutterwaveProvider from "../providers/flutterwave.providers";
import paystackProvider from "../providers/paystack.providers";
import { prisma } from "../config/db.config";
import { initFlutterwavePayment } from "../providers/flutterwave.providers";
import { initPaystackPayment } from "../providers/paystack.providers";
import type { CreatePaymentInput } from "../schemas/payment.schema";
import { TransactionType, User } from "../../prisma/generated";

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
    tx_ref: `sub_${orderUid}_${Date.now()}`,
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
      userUid: user.uid,
      shopId: user.shopId,
      type: "CREDIT" as TransactionType,
    },
  };

  if (gateway.encryptedSecretKey === null || gateway.iv === null) {
    throw new Error("Payment gateway not properly configured");
  }

  const parsedSecretKey = {
    encrypted_key: gateway.encryptedSecretKey,
    iv: gateway.iv,
  };

  switch (platform) {
    case "FLUTTERWAVE":
      return initFlutterwavePayment(paymentData, parsedSecretKey);
    case "PAYSTACK":
      return initPaystackPayment(paymentData, parsedSecretKey);
    default:
      throw new Error("Unsupported payment platform");
  }
};

const handleFlutterwaveSuccess = async (data: any, customer: any) => {
  return await flutterwaveProvider.processSuccess(data, customer);
};

const handleFlutterwaveFailure = async (data: any, customer: any) => {
  return await flutterwaveProvider.processFailure(data, customer);
};

const handlePaystackSuccess = async (data: any, customer: any) => {
  return await paystackProvider.processSuccess(data, customer);
};

const handlePaystackFailure = async (data: any, customer: any) => {
  return await paystackProvider.processFailure(data, customer);
};

export default {
  handleFlutterwaveSuccess,
  handleFlutterwaveFailure,
  handlePaystackSuccess,
  handlePaystackFailure,
};
