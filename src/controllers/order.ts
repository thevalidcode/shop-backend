import type { Request, Response } from "express";
import { getDocs, addShopDoc, updateShopDoc, deleteShopDoc } from "../crud";
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

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, shop_id, user } = authParsed.data;

  if (role !== "user") {
    res.status(403).json({ error: "Access denied, Users only." });
    return;
  }
  try {
    const orders = await getDocs("orders", shop_id, {
      filter: { user_uid: user.uid },
    });
    const sorted = orders.sort((a: any, b: any) => b.id - a.id);
    const parsedOrders = sorted.map(
      (o: any) => OrderPublicSchema.safeParse(o).data
    );
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

  const { role, shop_id } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

  try {
    const orders = await getDocs("orders", shop_id);
    const sorted = orders.sort((a: any, b: any) => b.id - a.id);
    const parsedOrders = sorted.map((o: any) => OrderSchema.safeParse(o).data);
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
  const { order_uid } = req.params;

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, shop_id, user } = authParsed.data;

  try {
    const order = await getDocs("orders", shop_id, {
      find: {
        uid: order_uid,
        user_uid: user.uid,
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    const parsedOrder =
      role === "user"
        ? OrderPublicSchema.safeParse(order)
        : OrderSchema.safeParse(order);
    res.status(200).json(parsedOrder.data);
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

  const { shop_id, role } = authParsed.data;
  if (role !== "user") {
    res.status(403).json({ error: "Access denied, Users only." });
    return;
  }
  const reqData = parsed.data;

  try {
    const newOrder = await addShopDoc("orders", reqData, shop_id);
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
  const { order_uid } = req.params;

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, shop_id } = authParsed.data;
  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

  try {
    await updateShopDoc("orders", order_uid, parsed.data.update, shop_id);
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
  const { order_uid } = req.params;

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, shop_id } = authParsed.data;
  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

  try {
    await deleteShopDoc("orders", order_uid, shop_id);
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

  const { shop_id, role, user } = authParsed.data;
  const { status } = parsed.data;

  try {
    const queryOptions =
      role === "user" ? { filter: { user_uid: user.uid } } : undefined;

    const allOrders = await getDocs("orders", shop_id, queryOptions);

    const filteredOrders =
      status === "all"
        ? allOrders
        : allOrders.filter((o: any) => o.status === status);

    const parsedOrders = filteredOrders.map(
      (o: any) =>
        (role === "user"
          ? OrderPublicSchema.safeParse(o)
          : OrderSchema.safeParse(o)
        ).data
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

  const { role, shop_id } = authParsed.data;

  if (role !== "user") {
    res.status(403).json({ error: "Access denied, Users only." });
    return;
  }

  try {
    const results = await Promise.all(
      parsed.data.orders.map((order) => addShopDoc("orders", order, shop_id))
    );
    const uids = results.map((r: any) => r.uid);
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

  const { role, shop_id } = authParsed.data;
  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

  try {
    await Promise.all(
      parsed.data.updates.map((update) =>
        updateShopDoc("orders", update.uid, { status: update.status }, shop_id)
      )
    );
    res.status(200).json({ success: "Bulk status update completed" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
