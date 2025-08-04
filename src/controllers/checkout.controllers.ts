import { Request, Response } from "express";
import { prisma } from "../config/db";
import { CreateOrderSchema, PaystackWebhookSchema } from "../schemas/checkout.schema";
import { v4 as uuidv4 } from "uuid";
import { Decimal } from "@prisma/client/runtime/library";
import { decryptKey } from "../utils/encrypt";
import axios from "axios";
import crypto from "crypto";
import { env } from "../config/env";

/**
 * @desc    Create an order from the user's current cart
 * @route   POST /api/v1/checkout
 * @access  Private (User)
 */
export const createOrderFromCart = async (req: Request, res: Response): Promise<void> => {
  const { uid: userUid, shopId } = req.auth!;
  const validation = CreateOrderSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({ error: validation.error.flatten() });
    return;
  }

  const { shippingAddress, billingAddress, paymentMethod } = validation.data;

  try {
    const cart = await prisma.cart.findUnique({
      where: { userUid },
      include: { 
        items: { include: { product: true } },
        user: { select: { currency: true } } // Include user's currency preference
      },
    });

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ error: "Your cart is empty." });
      return;
    }

    const newOrder = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${item.product.name}`);
        }
      }

      const totalAmount = cart.items.reduce((sum, item) => {
        const itemTotal = new Decimal(item.product.price).times(item.quantity);
        return sum.plus(itemTotal);
      }, new Decimal(0));

      const order = await tx.order.create({
        data: {
          shopId,
          userUid,
          totalAmount,
          currency: cart.user.currency, // Use user's currency preference
          shippingAddress,
          billingAddress,
          paymentMethod,
          orderRef: `ORD-${shopId}-${Date.now()}`,
          uid: uuidv4(),
          shopScopedId: (await tx.shopCounter.update({ where: { shopId }, data: { orderCounter: { increment: 1 } } })).orderCounter,
        },
      });

      await tx.orderItem.createMany({
        data: cart.items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtTimeOfPurchase: item.product.price,
        })),
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      
      await tx.cart.delete({ where: { id: cart.id } });

      return order;
    });

    res.status(201).json(newOrder);

  } catch (error: any) {
    if (error.message.startsWith("Insufficient stock")) {
      res.status(400).json({ error: error.message });
    } else {
      console.error("Order creation failed:", error);
      res.status(500).json({ error: "Could not create order." });
    }
  }
};

/**
 * @desc    Initialize a payment transaction with Paystack
 * @route   POST /api/v1/payment/initialize
 * @access  Private (User)
 */
export const initializePayment = async (req: Request, res: Response): Promise<void> => {
  const { orderUid } = req.body;
  const { uid: userUid, shopId, email } = req.auth!;

  if (!orderUid) {
    res.status(400).json({ error: "Order UID is required." });
    return;
  }
  
  try {
    const order = await prisma.order.findFirst({
      where: { uid: orderUid, userUid, shopId, status: "Pending" },
    });

    if (!order) {
      res.status(404).json({ error: "Pending order not found." });
      return;
    }

    const gateway = await prisma.paymentGateway.findFirst({
      where: { shopId, name: "paystack", isActive: true },
    });

    if (!gateway) {
      res.status(400).json({ error: "Paystack payment is not enabled for this store." });
      return;
    }

    const secretKey = decryptKey(gateway.encryptedSecretKey, gateway.iv);
    const amountInKobo = order.totalAmount.times(100).toNumber();

    const response = await axios.post("https://api.paystack.co/transaction/initialize", {
      email: email,
      amount: amountInKobo,
      reference: order.orderRef,
      currency: order.currency,
      metadata: { orderUid: order.uid }
    }, {
      headers: { Authorization: `Bearer ${secretKey}` }
    });
    
    res.status(200).json(response.data.data);

  } catch (error: any) {
    console.error("Paystack initialization failed:", error.response?.data || error.message);
    res.status(500).json({ error: "Payment initialization failed." });
  }
};

/**
 * @desc    Handle incoming webhook from Paystack
 * @route   POST /api/v1/payment/webhook
 * @access  Public
 */
export const verifyPaymentWebhook = async (req: Request, res: Response): Promise<void> => {
    const paystackSignature = req.headers['x-paystack-signature'] as string;
    const { shopId } = req.params;

    if (!paystackSignature) {
        res.sendStatus(400);
        return;
    }
    
    try {
        const gateway = await prisma.paymentGateway.findFirst({
            where: { shopId: Number(shopId), name: "paystack", isActive: true },
        });

        if (!gateway) {
            console.warn(`Webhook received for shop ${shopId} but no active Paystack gateway found.`);
            res.sendStatus(404);
            return;
        }

        const secretKey = decryptKey(gateway.encryptedSecretKey, gateway.iv);

        const hash = crypto.createHmac('sha512', secretKey).update(JSON.stringify(req.body)).digest('hex');
        if (hash !== paystackSignature) {
            res.sendStatus(401);
            return;
        }

        const validation = PaystackWebhookSchema.safeParse(req.body);
        if (!validation.success) {
            res.sendStatus(400);
            return;
        }

        const { event, data } = validation.data;

        if (event === 'charge.success') {
            const orderRef = data.reference;

            await prisma.order.update({
                where: { orderRef },
                data: {
                    status: 'Processing',
                    paymentReference: orderRef,
                },
            });
        }
        
        res.sendStatus(200);

    } catch (error) {
        console.error(`Error processing Paystack webhook for shop ${shopId}:`, error);
        res.sendStatus(500);
    }
};