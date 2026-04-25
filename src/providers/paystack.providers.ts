import { prisma } from "../config/db.config";
import convertCurrency from "../utils/ConvertCurrency";
import { placeOrderFromCartTx } from "../utils/cart";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { PaystackWebhookData } from "../schemas/webhook.schema";
import type { Request } from "express";
import { verifyPaystackSignature } from "../utils/webhook/verifySignatures";
import {
  handleShopPaymentFailure,
  handleShopPaymentSuccess,
} from "../services/payments/provider-webhook-handler";

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
    select: { shopId: true },
  });

  if (!payment) throw new Error("Payment not found");

  await verifySignature(req, payment.shopId);

  await handleShopPaymentSuccess({
    paymentUid: data.metadata.txRef,
    shopId: payment.shopId,
    customerEmail: customer.email,
    shippingInfoUid: data.metadata.shippingInfoUid,
    notes: data.metadata.notes ?? undefined,
    shippingCost: data.metadata.shippingCost
      ? Number(data.metadata.shippingCost)
      : undefined,
    shippingCurrency: data.metadata.shippingCurrency as string | undefined,
    selectedShippingRate: data.metadata.selectedShippingRate,
    paymentMethod: "PAYSTACK",
  });
};

const processFailure = async (
  req: Request,
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"],
) => {
  const payment = await prisma.payment.findFirst({
    where: { uid: data.metadata.txRef, status: "PENDING" },
    select: { shopId: true },
  });

  if (!payment) throw new Error("Payment not found");

  await verifySignature(req, payment.shopId);

  await handleShopPaymentFailure({
    paymentUid: data.metadata.txRef,
    shopId: payment.shopId,
    customerEmail: customer.email,
  });
};

export default { processSuccess, processFailure };
