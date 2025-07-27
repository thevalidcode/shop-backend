import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/db";
import { AuthSchema } from "../schemas/user.schema";
import {
  placeOrderSchema,
  updateOrderSchema,
  bulkCreateSchema,
  bulkStatusUpdateSchema,
  getOrdersByStatusSchema,
  OrderPublicSchema,
  OrderSchema,
} from "../schemas/order.schema";
import { z } from "zod";
import { getNextShopModelId } from "../utils/nextId";

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, shopId, user } = authParsed.data;

  if (role !== "user") {
    res.status(403).json({ error: "Access denied, Users only." });
    return;
  }
  try {
    const orders = await prisma.order.findMany({
      where: { shopId, userUid: user.uid },
      orderBy: { id: "desc" },
    });
    const parsedOrders = orders.map((o) => OrderPublicSchema.parse(o));
    res.status(200).json(parsedOrders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrdersForAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, shopId } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

  try {
    const orders = await prisma.order.findMany({
      where: { shopId },
      orderBy: { id: "desc" },
    });
    const parsedOrders = orders.map((o) => OrderSchema.parse(o));
    res.status(200).json(parsedOrders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { shopId, user } = authParsed.data;
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
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { role, shopId } = authParsed.data;
  const parsed = z.object({ orderUid: z.string() }).safeParse(req.params);

  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

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

export const placeOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = placeOrderSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { shopId, role, user } = authParsed.data;
  if (role !== "user") {
    res.status(403).json({ error: "Access denied, Users only." });
    return;
  }

  try {
    const newId = await getNextShopModelId("order", shopId);
    const newOrder = await prisma.order.create({
      data: {
        ...parsed.data,
        uid: uuidv4(),
        id: newId,
        shopId,
        userUid: user.uid,
        productId: parsed.data.productId,
        shippingAddress: parsed.data.shippingAddress,
        billingAddress: parsed.data.billingAddress,
        paymentMethod: parsed.data.paymentMethod,
      },
    });
    res
      .status(200)
      .json({ success: "Order placed successfully", uid: newOrder.uid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = updateOrderSchema.safeParse(req.body);
  const { orderUid } = req.params;

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, shopId } = authParsed.data;
  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

  try {
    await prisma.order.update({
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
  const authParsed = AuthSchema.safeParse(req.auth);
  const { orderUid } = req.params;

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, shopId } = authParsed.data;
  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

  try {
    await prisma.order.delete({ where: { uid: orderUid, shopId } });
    res.status(200).json({ success: "Order deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrdersByStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = getOrdersByStatusSchema
    .extend({
      status: z.union([getOrdersByStatusSchema.shape.status, z.literal("all")]),
    })
    .safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { shopId, role, user } = authParsed.data;
  const { status } = parsed.data;

  try {
    const whereClause = {
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

export const bulkCreateOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = bulkCreateSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, shopId, user } = authParsed.data;

  if (role !== "user") {
    res.status(403).json({ error: "Access denied, Users only." });
    return;
  }

  try {
    const orders = await Promise.all(
      parsed.data.orders.map(async (order) => {
        const newId = await getNextShopModelId("order", shopId);
        return prisma.order.create({
          data: {
            ...order,
            uid: uuidv4(),
            id: newId,
            shopId,
            userUid: user.uid,
            productId: order.productId,
            shippingAddress: order.shippingAddress,
            billingAddress: order.billingAddress,
            paymentMethod: order.paymentMethod,
          },
        });
      })
    );

    const uids = orders.map((o) => o.uid);
    res.status(200).json({ success: "Bulk orders created", uids });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const bulkUpdateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = bulkStatusUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, shopId } = authParsed.data;
  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

  try {
    await Promise.all(
      parsed.data.updates.map((update) =>
        prisma.order.update({
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
