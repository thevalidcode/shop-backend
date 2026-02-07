import { prisma } from "../config/db.config";
import { verifyFlutterwaveSignature } from "../utils/webhook/verifySignatures";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { FlutterwaveWebhookData } from "../schemas/webhook.schema";
import type { Request } from "express";
import { placeOrderFromCartTx } from "../utils/cart";
import { sendUserEmail } from "../emails";

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
  secretKey: { encryptedSecretKey: string; iv: string },
) => {
  const response = await axios.post(
    "https://api.flutterwave.com/v3/payments",
    { ...paymentData },
    {
      headers: {
        Authorization: `Bearer ${decryptKey(
          secretKey.encryptedSecretKey,
          secretKey.iv,
        )}`,
        "Content-Type": "application/json",
      },
    },
  );
  return { url: response.data.data.link };
};

const processSuccess = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["data"]["customer"],
) => {
  const payment = await prisma.payment.findFirst({
    where: { uid: data.data.tx_ref, status: "PENDING" },
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
      include: { shop: true },
    });
    await placeOrderFromCartTx(
      data.meta_data.billingInfoUid,
      payment.uid,
      false,
      data.meta_data.notes,
      user,
      tx,
      data.meta_data.shippingCost ? Number(data.meta_data.shippingCost) : undefined,
      data.meta_data.shippingCurrency as string | undefined,
      data.meta_data.selectedShippingRate,
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
      paymentMethod: "Flutterwave",
      receiptUrl: `https://${user.shop.uid || ""}/client/orders`,
    });
  } catch (emailError) {
    console.error("Failed to send payment success email:", emailError);
  }
};

const processFailure = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["data"]["customer"],
) => {
  const payment = await prisma.payment.findFirst({
    where: { uid: data.data.tx_ref, status: "PENDING" },
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
