import { prisma } from "../config/db.config";
import convertCurrency from "../utils/ConvertCurrency";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { PaystackWebhookData } from "../schemas/webhook.schema";
import type { Request } from "express";
import { verifyPaystackSignature } from "../utils/webhook/verifySignatures";

const verifySignature = async (req: Request, shopId: number) => {
  const gateway = await prisma.paymentGateway.findFirst({
    where: { shopId, platform: "PAYSTACK" },
  });

  if (!gateway || !gateway.signature) {
    throw new Error("Invalid shop or missing signature");
  }

  if (!gateway.encryptedSecretKey || !gateway.iv) {
    throw new Error("Missing encrypted secret key or IV");
  }

  const decryptedKey = decryptKey(gateway.encryptedSecretKey, gateway.iv);
  if (!verifyPaystackSignature(req, decryptedKey)) {
    throw new Error("Invalid signature");
  }
};

export const initPaystackPayment = async (
  paymentData: any,
  secretKey: { encryptedSecretKey: string; iv: string }
) => {
  const convertedNGNAmount = await convertCurrency(
    paymentData.amount,
    paymentData.currency,
    "NGN"
  );
  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: paymentData.customer.email,
      amount: convertedNGNAmount * 100, // Paystack uses kobo
      currency: "NGN",
      callback_url: paymentData.redirect_url,
      metadata: paymentData.meta,
    },
    {
      headers: {
        Authorization: `Bearer ${decryptKey(
          secretKey.encryptedSecretKey,
          secretKey.iv
        )}`,
      },
    }
  );
  return { url: response.data.data.authorization_url };
};

const processSuccess = async (
  req: Request,
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"]
) => {
  const payment = await prisma.payment.findFirst({
    where: { uid: data.metadata.txRef, status: "PENDING" },
  });

  if (!payment) throw new Error("Payment not found");

  await verifySignature(req, payment.shopId);

  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (!user) throw new Error("User not found");

  await prisma.$transaction(async (tx) => {
    const counter = await tx.shopCounter.update({
      where: { shopId: user.shopId! },
      data: {
        transactionCounter: { increment: 1 },
      },
    });

    await tx.payment.update({
      where: { uid: payment.uid },
      data: {
        status: "SUCCESS",
      },
    });

    const convertedUSDmount = await convertCurrency(
      data.amount,
      data.currency,
      "USD"
    );

    await tx.transaction.create({
      data: {
        uid: payment.uid,
        type: "ORDER_PAYMENT",
        amount: convertedUSDmount,
        description: `Order payment via Paystack`,
        userUid: user.uid,
        shopScopedId: counter.transactionCounter,
        shopId: user.shopId,
      },
    });

    // Optional: Update order status to paid if orderUid matches
    if (data.metadata.orderUid) {
      await tx.order.update({
        where: { uid: data.metadata.orderUid },
        data: {
          status: "PROCESSING",
          paymentReference: payment.uid,
          paymentMethod: "PAYSTACK",
        },
      });
    }
  });
};

const processFailure = async (
  req: Request,
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"]
) => {
  const payment = await prisma.payment.findFirst({
    where: { uid: data.metadata.txRef, status: "PENDING" },
  });

  if (!payment) throw new Error("Payment not found");

  await verifySignature(req, payment.shopId);

  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (!user) throw new Error("User not found");

  await prisma.payment.update({
    where: { uid: payment.uid },
    data: {
      status: "FAILED",
    },
  });
};

export default { processSuccess, processFailure };
