import { prisma } from "../config/db.config";
import { verifyFlutterwaveSignature } from "../utils/webhook/verifySignatures";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { FlutterwaveWebhookData } from "../schemas/webhook.schema";
import type { Request } from "express";
import convertCurrency from "../utils/ConvertCurrency";

const verifySignature = async (req: Request, shopId: number) => {
  const gateway = await prisma.paymentGateway.findFirst({
    where: { shopId, platform: "FLUTTERWAVE" },
  });

  if (!gateway || !gateway.signature) {
    throw new Error("Invalid shop or missing signature");
  }

  if (!verifyFlutterwaveSignature(req, gateway.signature)) {
    throw new Error("Invalid signature");
  }
};

export const initFlutterwavePayment = async (
  paymentData: any,
  secretKey: { encryptedSecretKey: string; iv: string }
) => {
  const response = await axios.post(
    "https://api.flutterwave.com/v3/payments",
    { ...paymentData },
    {
      headers: {
        Authorization: `Bearer ${decryptKey(
          secretKey.encryptedSecretKey,
          secretKey.iv
        )}`,
        "Content-Type": "application/json",
      },
    }
  );
  return { url: response.data.data.link };
};

const processSuccess = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["data"]["customer"]
) => {
  const payment = await prisma.payment.findFirst({
    where: { uid: data.data.tx_ref, status: "PENDING" },
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
      data.data.amount,
      data.data.currency,
      "USD"
    );

    await tx.transaction.create({
      data: {
        uid: payment.uid,
        type: "ORDER_PAYMENT",
        amount: convertedUSDmount,
        description: `Order payment via Flutterwave`,
        userUid: user.uid,
        shopScopedId: counter.transactionCounter,
        shopId: user.shopId,
      },
    });

    // Optional: Update order status to paid if orderUid matches
    if (data.meta_data?.orderUid) {
      await tx.order.update({
        where: { uid: data.meta_data.orderUid },
        data: {
          status: "PROCESSING",
          paymentReference: payment.uid,
          paymentMethod: "FLUTTERWAVE",
        },
      });
    }
  });
};

const processFailure = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["data"]["customer"]
) => {
  const payment = await prisma.payment.findFirst({
    where: { uid: data.data.tx_ref, status: "PENDING" },
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
