// src/controllers/order.controllers.ts
import type { Request, Response } from "express";
import { prisma } from "../config/db";
import {
  updateOrderSchema,
  bulkStatusUpdateSchema,
  getOrdersByStatusSchema,
  OrderPublicSchema,
  OrderSchema,
} from "../schemas/order.schema";
import { z } from "zod";

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  const { shopId, user } = req.auth!;

  try {
    const orders = await prisma.order.findMany({
      where: { shopId, userUid: user.uid },
      orderBy: { id: "desc" },
    });
    const parsedOrders = z.array(OrderPublicSchema).parse(orders);
    res.status(200).json(parsedOrders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrdersForAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shopId } = req.auth!;

  try {
    const orders = await prisma.order.findMany({
      where: { shopId },
      orderBy: { id: "desc" },
    });
    const parsedOrders = z.array(OrderSchema).parse(orders);
    res.status(200).json(parsedOrders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shopId, user } = req.auth!;
  const parsed = z.object({ orderUid: z.string() }).safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        uid: parsed.data.orderUid,
        shopId,
        userUid: user.uid,
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    const parsedOrder = OrderPublicSchema.parse(order);
    res.status(200).json(parsedOrder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderByIDForAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shopId } = req.auth!;
  const parsed = z.object({ orderUid: z.string() }).safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        uid: parsed.data.orderUid,
        shopId,
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    const parsedOrder = OrderSchema.parse(order);
    res.status(200).json(parsedOrder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = updateOrderSchema.safeParse(req.body);
  const { orderUid } = req.params;

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  
  const { shopId } = req.auth!;
  
  try {
    await prisma.order.updateMany({
      where: { uid: orderUid, shopId },
      data: parsed.data.update,
    });
    res.status(200).json({ success: "Order updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { orderUid } = req.params;
  const { shopId } = req.auth!;

  try {
    await prisma.order.deleteMany({ where: { uid: orderUid, shopId } });
    res.status(200).json({ success: "Order deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrdersByStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = getOrdersByStatusSchema
    .extend({
      status: z.union([getOrdersByStatusSchema.shape.status, z.literal("all")]),
    })
    .safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  
  const { shopId, role, user } = req.auth!;
  const { status } = parsed.data;

  try {
    const whereClause: any = {
      shopId,
      ...(role === "user" ? { userUid: user.uid } : {}),
      ...(status === "all" ? {} : { status }),
    };

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { id: "desc" },
    });

    const parsedOrders = orders.map((o) =>
      role === "user" ? OrderPublicSchema.parse(o) : OrderSchema.parse(o)
    );

    res.status(200).json(parsedOrders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const bulkUpdateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = bulkStatusUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  
  const { shopId } = req.auth!;
  
  try {
    await prisma.$transaction(
      parsed.data.updates.map((update) =>
        prisma.order.updateMany({
          where: { uid: update.uid, shopId },
          data: { status: update.status },
        })
      )
    );
    res.status(200).json({ success: "Bulk status update completed" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};