import { prisma } from "../config/db.config";
import convertCurrency from "../utils/ConvertCurrency";
import { placeOrderFromCartTx } from "../utils/cart";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { PaystackWebhookData } from "../schemas/webhook.schema";
import type { Request } from "express";
import { verifyPaystackSignature } from "../utils/webhook/verifySignatures";
import { sendUserEmail } from "../emails";

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
  secretKey: { encryptedSecretKey: string; iv: string },
) => {
  const convertedNGNAmount = await convertCurrency(
    paymentData.amount,
    paymentData.currency,
    "NGN",
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
          secretKey.iv,
        )}`,
      },
    },
  );
  return { url: response.data.data.authorization_url };
};

const processSuccess = async (
  req: Request,
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"],
) => {
  const payment = await prisma.payment.findFirst({
    where: { uid: data.metadata.txRef, status: "PENDING" },
  });

  if (!payment) throw new Error("Payment not found");

  await verifySignature(req, payment.shopId);

  const user = await prisma.user.findFirst({
    where: { email: customer.email, shopId: payment.shopId },
    include: { shop: true },
  });

  if (!user) throw new Error("User not found");

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { uid: payment.uid },
      data: {
        status: "SUCCESS",
      },
    });

    await placeOrderFromCartTx(
      data.metadata.billingInfoUid,
      payment.uid,
      false,
      data.metadata.notes,
      user,
      tx,
      data.metadata.shippingCost
        ? Number(data.metadata.shippingCost)
        : undefined,
      data.metadata.shippingCurrency as string | undefined,
      data.metadata.selectedShippingRate,
    );
  });

  // Send payment successful email
  try {
    await sendUserEmail(payment.shopId, user.email, "PAYMENT_SUCCESSFUL", {
      userName: user.fullName || user.username,
      transactionId: payment.uid,
      amount: Number(payment.amount).toFixed(2),
      currency: payment.currency,
      paymentDate: new Date().toLocaleDateString(),
      paymentMethod: "Paystack",
      receiptUrl: `https://${user.shop.uid || ""}/client/orders`,
    });
  } catch (emailError) {
    console.error("Failed to send payment success email:", emailError);
  }
};

const processFailure = async (
  req: Request,
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"],
) => {
  const payment = await prisma.payment.findFirst({
    where: { uid: data.metadata.txRef, status: "PENDING" },
  });

  if (!payment) throw new Error("Payment not found");

  await verifySignature(req, payment.shopId);

  const user = await prisma.user.findFirst({
    where: { email: customer.email, shopId: payment.shopId },
    include: { shop: true },
  });

  if (!user) throw new Error("User not found");

  await prisma.payment.update({
    where: { uid: payment.uid },
    data: {
      status: "FAILED",
    },
  });

  // Send payment failed email
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
};

export default { processSuccess, processFailure };
