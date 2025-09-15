import type { Request, Response } from "express";
import {
  InitializePaymentSchema,
  PaymentPublicSchema,
  PaymentSchema,
} from "../schemas/payment.schema";
import { AuthSchema } from "../schemas/user.schema";
import { prisma } from "../config/db.config";
import * as paymentServices from "../services/payment.services";
import { User } from "../../prisma/generated";

/**
 * @desc    Initialize a payment transaction with any payment method
 * @route   POST /api/v1/payment/initialize
 * @access  Private (User)
 */
export const initializePayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = InitializePaymentSchema.safeParse(req.body);
  const { uid: userUid, shopId } = req.auth!;

  if (!parsed.data) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { uid: userUid, shopId },
    });
    const result = await paymentServices.createPayment(
      user as User,
      parsed.data
    );

    res.status(200).json({ status: "success", ...result });
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Payment initialization failed." });
  }
};

export const getPaymentsForUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { user, shopId } = authParsed.data;

  try {
    const payments = await prisma.payment.findMany({
      where: { userUid: user.uid, shopId },
      orderBy: { id: "desc" },
    });

    const parsedPayments = payments.map(
      (o) => PaymentPublicSchema.safeParse(o).data
    );
    res.status(200).json(parsedPayments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPaymentsForAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { shopId } = authParsed.data;
  try {
    const payment = await prisma.payment.findMany({
      where: { shopId },
      orderBy: { id: "desc" },
    });

    const parsedPayments = payment.map((o) => PaymentSchema.safeParse(o).data);
    res.status(200).json(parsedPayments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
