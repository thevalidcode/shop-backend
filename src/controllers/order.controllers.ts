import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import {
  UpdateOrderSchema,
  BulkStatusUpdateSchema,
  GetOrdersByStatusSchema,
  OrderUidSchema,
} from "../schemas/order.schema";
import { UserAuthSchema } from "../schemas/user.schema";
import { z } from "zod";
import { AdminAuthSchema } from "../schemas/admin.schema";

/**
 * ORDER FLOW OVERVIEW:
 *
 * USER FLOW:
 * 1. User places order from cart (see cart.controllers.ts)
 * 2. User can view their orders (all or by status)
 * 3. User can view single order details with items
 * 4. User receives order status updates
 *
 * ADMIN FLOW:
 * 1. Admin views all shop orders (with filters)
 * 2. Admin updates order status (PENDING → PROCESSING → SHIPPED → DELIVERED)
 * 3. Admin can bulk update multiple orders
 * 4. Admin can delete orders (cancellations)
 *
 * ORDER STRUCTURE:
 * - Each Order belongs to a User and Shop
 * - Order has BillingInfo reference
 * - Order contains multiple OrderItems
 * - OrderItems store price at time of purchase (for history)
 * - Order totalAmount is sum of all OrderItems
 */

/**
 * USER ENDPOINTS
 */

/**
 * GET /orders (User)
 * Get all orders for the authenticated user
 */
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { shopId, uid } = authParsed.data;

  try {
    const orders = await prisma.order.findMany({
      where: { shopId, userUid: uid },
      include: {
        items: {
          include: {
            product: {
              select: {
                uid: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        billingInfo: {
          select: {
            fullName: true,
            address: true,
            city: true,
            state: true,
            country: true,
            postalCode: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    res.status(200).json(orders);
  } catch (error: any) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: "Failed to retrieve orders." });
  }
};

/**
 * GET /orders/:orderUid (User)
 * Get single order details for authenticated user
 */
export const getOrderByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const paramsParsed = OrderUidSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }

  const { shopId, uid } = authParsed.data;
  const { orderUid } = paramsParsed.data;

  try {
    const order = await prisma.order.findFirst({
      where: {
        uid: orderUid,
        shopId,
        userUid: uid, // Security: user can only see their own orders
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                uid: true,
                name: true,
                description: true,
                imageUrl: true,
                status: true,
              },
            },
          },
        },
        billingInfo: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.status(200).json(order);
  } catch (error: any) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ error: "Failed to retrieve order." });
  }
};

/**
 * GET /orders/status/:status (User)
 * Get user's orders filtered by status
 */
export const getOrdersByStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const paramsParsed = GetOrdersByStatusSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }

  const { shopId, uid } = authParsed.data;
  const { status } = paramsParsed.data;

  try {
    const orders = await prisma.order.findMany({
      where: {
        shopId,
        userUid: uid,
        status,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                uid: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    res.status(200).json(orders);
  } catch (error: any) {
    console.error("Get orders by status error:", error);
    res.status(500).json({ error: "Failed to retrieve orders." });
  }
};

/**
 * ADMIN ENDPOINTS
 */

/**
 * GET /admin/orders (Admin)
 * Get all orders in the shop (admin view)
 */
export const getOrdersForAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { shopId } = authParsed.data;

  try {
    const orders = await prisma.order.findMany({
      where: { shopId },
      include: {
        items: {
          include: {
            product: {
              select: {
                uid: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        user: {
          select: {
            uid: true,
            email: true,
            fullName: true,
          },
        },
        billingInfo: true,
      },
      orderBy: { timestamp: "desc" },
    });

    res.status(200).json(orders);
  } catch (error: any) {
    console.error("Get admin orders error:", error);
    res.status(500).json({ error: "Failed to retrieve orders." });
  }
};

/**
 * GET /admin/orders/:orderUid (Admin)
 * Get single order details with full information (admin view)
 */
export const getOrderByIDForAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const paramsParsed = OrderUidSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }

  const { shopId } = authParsed.data;
  const { orderUid } = paramsParsed.data;

  try {
    const order = await prisma.order.findFirst({
      where: {
        uid: orderUid,
        shopId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
        billingInfo: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.status(200).json(order);
  } catch (error: any) {
    console.error("Get admin order by ID error:", error);
    res.status(500).json({ error: "Failed to retrieve order." });
  }
};

/**
 * PATCH /admin/orders/:orderUid (Admin)
 * Update order details (status, notes, etc.)
 * Common flow: PENDING → PROCESSING → SHIPPED → DELIVERED
 */
export const updateOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const paramsParsed = OrderUidSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }

  const bodyParsed = UpdateOrderSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  const { shopId } = authParsed.data;
  const { orderUid } = paramsParsed.data;

  try {
    // Verify order exists in this shop
    const order = await prisma.order.findFirst({
      where: { uid: orderUid, shopId },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: bodyParsed.data,
    });

    res.status(200).json({
      success: "Order updated successfully",
      order: {
        uid: updatedOrder.uid,
        status: updatedOrder.status,
      },
    });
  } catch (error: any) {
    console.error("Update order error:", error);
    res.status(500).json({ error: "Failed to update order." });
  }
};

/**
 * DELETE /admin/orders/:orderUid (Admin)
 * Delete/cancel an order
 * Note: This permanently deletes the order. Consider using status="CANCELLED" instead.
 */
export const deleteOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const paramsParsed = OrderUidSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }

  const { shopId } = authParsed.data;
  const { orderUid } = paramsParsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      // Find order
      const order = await tx.order.findFirst({
        where: { uid: orderUid, shopId },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Delete order items first (cascade might handle this, but explicit is safer)
      await tx.orderItem.deleteMany({
        where: { orderId: order.id },
      });

      // Delete order
      await tx.order.delete({
        where: { id: order.id },
      });
    });

    res.status(200).json({ success: "Order deleted successfully" });
  } catch (error: any) {
    console.error("Delete order error:", error);
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to delete order." });
    }
  }
};

/**
 * POST /admin/orders/bulk-update (Admin)
 * Bulk update order statuses
 * Useful for processing multiple orders at once
 */
export const bulkUpdateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const bodyParsed = BulkStatusUpdateSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  const { shopId } = authParsed.data;
  const { updates } = bodyParsed.data;

  try {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.order.updateMany({
          where: { uid: update.orderUid, shopId },
          data: { status: update.status },
        })
      )
    );

    res.status(200).json({
      success: `Successfully updated ${updates.length} orders`,
      count: updates.length,
    });
  } catch (error: any) {
    console.error("Bulk update error:", error);
    res.status(500).json({ error: "Failed to bulk update orders." });
  }
};
