import { prisma } from "../config/db.config";
import { verifyFlutterwaveSignature } from "../utils/webhook/verifySignatures";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { FlutterwaveWebhookData } from "../schemas/webhook.schema";
import type { Request } from "express";
import {
  handleShopPaymentFailure,
  handleShopPaymentSuccess,
} from "../services/payments/provider-webhook-handler";

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
    select: { shopId: true },
  });

  if (!payment) throw new Error("Payment not found");

  await verifySignature(req, payment.shopId);

  await handleShopPaymentSuccess({
    paymentUid: data.data.tx_ref,
    shopId: payment.shopId,
    customerEmail: customer.email,
    shippingInfoUid: data.meta_data.shippingInfoUid,
    notes: data.meta_data.notes ?? undefined,
    shippingCost: data.meta_data.shippingCost
      ? Number(data.meta_data.shippingCost)
      : undefined,
    shippingCurrency: data.meta_data.shippingCurrency as string | undefined,
    selectedShippingRate: data.meta_data.selectedShippingRate,
    paymentMethod: "FLUTTERWAVE",
  });
};

const processFailure = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["data"]["customer"],
) => {
  const payment = await prisma.payment.findFirst({
    where: { uid: data.data.tx_ref, status: "PENDING" },
    select: { shopId: true },
  });

  if (!payment) throw new Error("Payment not found");

  await verifySignature(req, payment.shopId);

  await handleShopPaymentFailure({
    paymentUid: data.data.tx_ref,
    shopId: payment.shopId,
    customerEmail: customer.email,
  });
};

export default { processSuccess, processFailure };
