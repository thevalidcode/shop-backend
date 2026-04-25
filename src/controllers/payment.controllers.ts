import type { Request, Response } from "express";
import {
  InitializePaymentSchema,
  CreateWalletPaymentSchema,
  UpdatePaymentStatusSchema,
  PaymentUidSchema,
} from "../schemas/payment.schema";
import { PaymentFiltersSchema } from "../schemas/payment.schema";
import { UserAuthSchema } from "../schemas/user.schema";
import { prisma } from "../config/db.config";
import * as paymentServices from "../services/payment.services";
import { User } from "../../prisma/generated";
import { AdminAuthSchema } from "../schemas/admin.schema";
import {
  handleShopPaymentFailure,
  handleShopPaymentSuccess,
} from "../services/payments/provider-webhook-handler";

/**
 * @desc    Initialize a payment transaction with any payment method
 * @route   POST /api/v1/payment/initialize
 * @access  Private (User)
 */
export const initializePayment = async (
  req: Request,
  res: Response,
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

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const result = await paymentServices.createPayment(
      user as User,
      parsed.data,
    );

    res.status(200).json({ status: "success", ...result });
  } catch (error: any) {
    console.error(error.response?.data || error.message);

    if (error.message === "INSUFFICIENT_WALLET_BALANCE") {
      res.status(400).json({ error: "Insufficient wallet balance" });
      return;
    }

    res.status(500).json({ error: "Payment initialization failed." });
  }
};

export const createWalletTopupPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = CreateWalletPaymentSchema.safeParse(req.body);
  const { uid: userUid, shopId } = req.auth!;

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { uid: userUid, shopId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const result = await paymentServices.createWalletTopupPayment(
      user as User,
      parsed.data,
    );

    res.status(200).json({ status: "success", ...result });
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Wallet top-up initialization failed." });
  }
};

export const getPaymentsForUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { user, shopId } = authParsed.data;

  try {
    const payments = await prisma.payment.findMany({
      where: { userUid: user.uid, shopId },
      include: {
        paymentGateway: {
          select: {
            uid: true,
            name: true,
            description: true,
            platform: true,
            status: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    res.status(200).json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPaymentsForAdmins = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { shopId } = authParsed.data;
  const queryParsed = PaymentFiltersSchema.safeParse(req.query);

  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.flatten() });
    return;
  }

  const { page, limit, status, method, search } = queryParsed.data;
  const skip = (page - 1) * limit;

  const searchFilter = search
    ? {
        OR: [
          { uid: { contains: search, mode: "insensitive" as const } },
          {
            user: {
              is: {
                OR: [
                  {
                    username: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                  { email: { contains: search, mode: "insensitive" as const } },
                  {
                    fullName: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              },
            },
          },
          {
            paymentGateway: {
              is: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
          },
        ],
      }
    : {};

  const where = {
    shopId,
    ...(status ? { status } : {}),
    ...(method ? { method } : {}),
    ...searchFilter,
  };

  try {
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              username: true,
              email: true,
            },
          },
          paymentGateway: {
            select: {
              uid: true,
              name: true,
              description: true,
              platform: true,
              status: true,
            },
          },
        },
        orderBy: { id: "desc" },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);
    res.status(200).json({
      payments,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePaymentStatusForAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const paramsParsed = PaymentUidSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }

  const bodyParsed = UpdatePaymentStatusSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  const { shopId } = authParsed.data;
  const { paymentUid } = paramsParsed.data;
  const {
    status,
    shippingInfoUid,
    notes,
    shippingCost,
    shippingCurrency,
    selectedShippingRate,
  } = bodyParsed.data;

  try {
    const payment = await prisma.payment.findFirst({
      where: { uid: paymentUid, shopId },
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
            username: true,
          },
        },
        orders: {
          select: {
            uid: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }

    if (payment.status === status) {
      res.status(200).json({
        success: "Payment status already up to date",
        payment: {
          uid: payment.uid,
          status: payment.status,
          purpose: payment.purpose,
        },
      });
      return;
    }

    if (status === "PENDING") {
      if (payment.status === "SUCCESS") {
        res.status(400).json({
          error:
            "Cannot move a successful payment back to pending because irreversible side effects may already be applied.",
        });
        return;
      }

      await prisma.payment.update({
        where: { uid: payment.uid },
        data: { status: "PENDING" },
      });

      await prisma.order.updateMany({
        where: {
          paymentUid: payment.uid,
          shopId,
          status: "CANCELED",
        },
        data: { status: "VERIFYING_PAYMENT" },
      });

      res.status(200).json({
        success: "Payment moved to pending",
        payment: {
          uid: payment.uid,
          status: "PENDING",
          purpose: payment.purpose,
        },
      });
      return;
    }

    if (payment.status !== "PENDING") {
      res.status(400).json({
        error: `Payment must be in PENDING status before transitioning to ${status}.`,
      });
      return;
    }

    if (status === "SUCCESS") {
      await handleShopPaymentSuccess({
        paymentUid: payment.uid,
        shopId,
        customerEmail: payment.user.email,
        shippingInfoUid,
        notes,
        shippingCost,
        shippingCurrency,
        selectedShippingRate,
        paymentMethod: payment.method,
      });
    }

    if (status === "FAILED") {
      await handleShopPaymentFailure({
        paymentUid: payment.uid,
        shopId,
        customerEmail: payment.user.email,
      });
    }

    const updatedPayment = await prisma.payment.findUnique({
      where: { uid: payment.uid },
      select: { uid: true, status: true, purpose: true },
    });

    res.status(200).json({
      success: "Payment status updated successfully",
      payment: updatedPayment,
    });
  } catch (error: any) {
    console.error("Update payment status error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to update payment status" });
  }
};
