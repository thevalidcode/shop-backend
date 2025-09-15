import { prisma } from "../config/db.config";
import convertCurrency from "../utils/ConvertCurrency";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { Decimal } from "@prisma/client/runtime/library";
import { PaystackWebhookData } from "../schemas/webhook.schema";
import { getRates } from "../controllers/rate.controllers";

export const initPaystackPayment = async (
  paymentData: any,
  secretKey: { encrypted_key: string; iv: string }
) => {
  const exchangeRates = await getRates();
  const convertedNGNAmount = convertCurrency(
    paymentData.amount,
    paymentData.currency,
    "NGN",
    exchangeRates
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
          secretKey.encrypted_key,
          secretKey.iv
        )}`,
      },
    }
  );
  return { url: response.data.data.authorization_url };
};

const processSuccess = async (
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"]
) => {
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (!user) throw new Error("User not found");

  const amount = new Decimal(data.amount / 100); // Paystack uses kobo

  await prisma.$transaction(async (tx) => {
    const counter = await tx.shopCounter.update({
      where: { shopId: data.metadata.shopId },
      data: { paymentCounter: { increment: 1 } },
    });
    await tx.payment.create({
      data: {
        uid: uuidv4(),
        status: "SUCCESS",
        amount,
        shopId: data.metadata.shopId,
        shopScopedId: counter.paymentCounter,
        method: "PAYSTACK",
        currency: data.currency,
        chargedAmount: amount,
        userUid: user.uid,
      },
    });
  });
};

const processFailure = async (
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"]
) => {
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (!user) throw new Error("User not found");
  const amountInDecimal = new Decimal(data.amount / 100);
  await prisma.$transaction(async (tx) => {
    const counter = await tx.shopCounter.update({
      where: { shopId: data.metadata.shopId },
      data: { paymentCounter: { increment: 1 } },
    });
    await tx.payment.create({
      data: {
        uid: crypto.randomUUID(),
        status: "FAILED",
        amount: amountInDecimal,
        method: "PAYSTACK",
        shopId: data.metadata.shopId,
        shopScopedId: counter.paymentCounter,
        currency: data.currency,
        chargedAmount: amountInDecimal,
        userUid: user.uid,
      },
    });
  });
};

export default { processSuccess, processFailure };
