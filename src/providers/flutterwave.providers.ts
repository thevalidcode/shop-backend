import { prisma } from "../config/db.config";
import convertCurrency from "../utils/ConvertCurrency";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { FlutterwaveWebhookData } from "../schemas/webhook.schema";
import { Decimal } from "@prisma/client/runtime/library";
import { getRates } from "../controllers/rate.controllers";

export const initFlutterwavePayment = async (
  paymentData: any,
  secretKey: { encrypted_key: string; iv: string }
) => {
  const exchangeRates = await getRates();
  const convertedUSDAmount = convertCurrency(
    paymentData.amount,
    paymentData.currency,
    "NGN",
    exchangeRates
  );
  const response = await axios.post(
    "https://api.flutterwave.com/v3/payments",
    { ...paymentData, amount: convertedUSDAmount },
    {
      headers: {
        Authorization: `Bearer ${decryptKey(
          secretKey.encrypted_key,
          secretKey.iv
        )}`,
      },
    }
  );
  return { url: response.data.data.link };
};

const processSuccess = async (
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["customer"]
) => {
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (!user) throw new Error("User not found");

  await prisma.$transaction(async (tx) => {
    const counter = await tx.shopCounter.update({
      where: { shopId: data.meta.shopId },
      data: { paymentCounter: { increment: 1 } },
    });
    await tx.payment.create({
      data: {
        uid: uuidv4(),
        status: "SUCCESS",
        amount: data.amount,
        shopId: data.meta.shopId,
        shopScopedId: counter.paymentCounter,
        method: "FLUTTERWAVE",
        currency: data.currency,
        chargedAmount: data.amount,
        userUid: user.uid,
      },
    });
  });

  // Optional: send email notification
};

const processFailure = async (
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["customer"]
) => {
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (!user) throw new Error("User not found");
  const amountInDecimal = new Decimal(data.amount / 100);
  await prisma.$transaction(async (tx) => {
    const counter = await tx.shopCounter.update({
      where: { shopId: data.meta.shopId },
      data: { paymentCounter: { increment: 1 } },
    });
    await tx.payment.create({
      data: {
        uid: crypto.randomUUID(),
        status: "FAILED",
        amount: amountInDecimal,
        method: "FLUTTERWAVE",
        shopId: data.meta.shopId,
        shopScopedId: counter.paymentCounter,
        currency: data.currency,
        chargedAmount: amountInDecimal,
        userUid: user.uid,
      },
    });
  });
};

export default { processSuccess, processFailure };
