import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { sendUserEmail, sendEmailToAdmins } from "../emails";
import {
  UpdateOrderSchema,
  BulkStatusUpdateSchema,
  GetOrdersByStatusSchema,
  OrderUidSchema,
  UpdateOrderByUserSchema,
  RefundRequestSchema,
  UpdateBillingInfoSchema,
  VerifyPaymentSchema,
} from "../schemas/order.schema";
import { UserAuthSchema } from "../schemas/user.schema";
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
 * - OrderItems shop price at time of purchase (for history)
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
                slug: true,
                images: true,
                imageUrl: true,
              },
            },
          },
        },
        billingInfo: true,
        payment: {
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
  res: Response,
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
        userUid: uid,
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
                slug: true,
                images: true,
                status: true,
              },
            },
          },
        },
        billingInfo: true,
        payment: {
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
        },
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
export const getUserOrdersByStatus = async (
  req: Request,
  res: Response,
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
                slug: true,
                images: true,
                imageUrl: true,
              },
            },
          },
        },
        billingInfo: true,
        payment: {
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
  res: Response,
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
            fullName: true,
            username: true,
            email: true,
            image: true,
            uid: true,
            phone: true,
          },
        },
        billingInfo: true,
        payment: {
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
        },
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
  res: Response,
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
        user: {
          select: {
            fullName: true,
            username: true,
            email: true,
            image: true,
            uid: true,
            phone: true,
          },
        },
        billingInfo: true,
        payment: {
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
        },
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

export const getOrdersByStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const paramsParsed = GetOrdersByStatusSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }

  const { shopId } = authParsed.data;
  const { status } = paramsParsed.data;

  try {
    const orders = await prisma.order.findMany({
      where: {
        shopId,
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
        user: {
          select: {
            fullName: true,
            username: true,
            email: true,
            image: true,
            uid: true,
            phone: true,
          },
        },
        billingInfo: true,
        payment: {
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
 * PATCH /orders/:orderUid (User)
 * Update order details (deliveredAt, notes, etc.)
 */
export const updateOrderByUser = async (
  req: Request,
  res: Response,
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

  const bodyParsed = UpdateOrderByUserSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  const { shopId, uid } = authParsed.data;
  const { orderUid } = paramsParsed.data;
  const { notes, received } = bodyParsed.data;

  try {
    // Verify order exists and belongs to this user
    const order = await prisma.order.findFirst({
      where: { uid: orderUid, shopId, userUid: uid },
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
            username: true,
          },
        },
        billingInfo: true,
        shop: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Validate received flag - only allow if order is SHIPPED or DELIVERED
    if (received === true) {
      const allowedStatuses = ["SHIPPED", "DELIVERED"];
      if (!allowedStatuses.includes(order.status)) {
        res.status(400).json({
          error: `Cannot mark order as received. Order must be shipped first. Current status: ${order.status}`,
        });
        return;
      }
    }

    // Build update data
    const updateData: any = {};

    // Update notes if provided
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update deliveredAt if marking as received
    if (received === true && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
      updateData.status = "DELIVERED";
    }

    // Only update if there's actual data to update
    if (Object.keys(updateData).length === 0) {
      res.status(200).json({
        success: "No changes to update",
        order: {
          uid: order.uid,
          status: order.status,
          notes: order.notes,
          deliveredAt: order.deliveredAt,
        },
      });
      return;
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: updateData,
    });

    res.status(200).json({
      success: "Order updated successfully",
      order: {
        uid: updatedOrder.uid,
        status: updatedOrder.status,
        notes: updatedOrder.notes,
        deliveredAt: updatedOrder.deliveredAt,
      },
    });
  } catch (error: any) {
    console.error("Update order error:", error);
    res.status(500).json({ error: "Failed to update order." });
  }
};

/**
 * PATCH /admin/orders/:orderUid (Admin)
 * Update order details (status, notes, etc.)
 * Common flow: PENDING → PROCESSING → SHIPPED → DELIVERED
 */
export const updateOrder = async (
  req: Request,
  res: Response,
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
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
            username: true,
          },
        },
        billingInfo: true,
        shop: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Validate received flag - only allow if order is SHIPPED or DELIVERED
    if (bodyParsed.data.received === true) {
      const allowedStatuses = ["SHIPPED", "DELIVERED"];
      if (!allowedStatuses.includes(order.status)) {
        res.status(400).json({
          error: `Cannot mark order as received. Order must be shipped first. Current status: ${order.status}`,
        });
        return;
      }
    }

    // Build update data
    const updateData: any = { ...bodyParsed.data };

    // Update notes if provided
    if (bodyParsed.data.notes !== undefined) {
      updateData.notes = bodyParsed.data.notes;
    }

    // Update deliveredAt if marking as received
    if (bodyParsed.data.received === true && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
      updateData.status = "DELIVERED";
    }

    const oldStatus = order.status;

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: updateData,
    });

    // Send email notification if status changed
    if (
      bodyParsed.data.status &&
      bodyParsed.data.status !== oldStatus &&
      order.user?.email
    ) {
      try {
        const orderDetails = {
          orderNumber: updatedOrder.uid,
          orderDate: updatedOrder.timestamp.toLocaleDateString(),
          totalAmount: Number(updatedOrder.totalAmount).toFixed(2),
          currency: updatedOrder.currency || "USD",
          trackingUrl: `https://${order.shop.uid || ""}/client/orders?uid=${updatedOrder.uid}`,
          customerName: order.user.fullName || order.user.username,
        };

        switch (bodyParsed.data.status) {
          case "SHIPPED":
            await sendUserEmail(shopId, order.user.email, "ORDER_SHIPPED", {
              ...orderDetails,
              trackingNumber: updatedOrder.trackingNumber || "N/A",
              estimatedDelivery: updatedOrder.deliveredAt
                ? new Date(updatedOrder.deliveredAt).toLocaleDateString()
                : "To be determined",
            });
            break;
          case "DELIVERED":
            await sendUserEmail(shopId, order.user.email, "ORDER_DELIVERED", {
              ...orderDetails,
              deliveryDate: updatedOrder.deliveredAt
                ? new Date(updatedOrder.deliveredAt).toLocaleDateString()
                : new Date().toLocaleDateString(),
            });
            break;
          case "CANCELED":
            await sendUserEmail(shopId, order.user.email, "ORDER_CANCELED", {
              ...orderDetails,
              cancelReason:
                "Your order has been cancelled. If you have any questions, please contact support.",
              refundAmount: Number(updatedOrder.totalAmount).toFixed(2),
              refundMethod: "Original payment method",
            });
            break;
        }
      } catch (emailError) {
        console.error("Failed to send order status email:", emailError);
      }
    }

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
  res: Response,
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
  res: Response,
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
        }),
      ),
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

/**
 * PATCH /orders/:orderUid/cancel-request (User)
 * User requests to cancel their order
 * Only allowed for PENDING, VERIFYING_PAYMENT orders
 */
export const cancelOrderByUser = async (
  req: Request,
  res: Response,
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

  const { shopId, uid, user } = authParsed.data;
  const { orderUid } = paramsParsed.data;

  try {
    // Find order and verify ownership
    const order = await prisma.order.findFirst({
      where: { uid: orderUid, shopId, userUid: uid },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        shop: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Check if order can be canceled
    const cancelableStatuses = ["PENDING", "VERIFYING_PAYMENT"];
    if (!cancelableStatuses.includes(order.status)) {
      res.status(400).json({
        error: `Cannot cancel order with status: ${order.status}. Only Pending or Verifying Payment orders can be canceled.`,
      });
      return;
    }

    // Update order status to CANCELED
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELED",
      },
    });

    // Send cancellation email to user
    await sendUserEmail(shopId, user.email, "ORDER_CANCELED", {
      orderRef: order.orderRef,
      cancellationReason: "Canceled by customer request",
      refundAmount: Number(order.totalAmount),
      currency: order.currency,
      refundETA: "3-5 business days",
    });

    // Send notification email to admins for refund processing
    await sendEmailToAdmins(shopId, "ORDER_CANCELED_ADMIN", {
      orderRef: order.orderRef,
      customerName: user.fullName || user.username || "Customer",
      customerEmail: user.email,
      canceledAt: new Date().toLocaleString(),
      refundAmount: Number(order.totalAmount),
      currency: order.currency,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
      })),
      adminDashboardUrl: `https://${order.shop.uid || ""}/admin/orders?uid=${order.uid}`,
    });

    res.status(200).json({
      success: "Order canceled successfully",
      order: {
        uid: updatedOrder.uid,
        status: updatedOrder.status,
        orderRef: updatedOrder.orderRef,
      },
    });
  } catch (error: any) {
    console.error("Cancel order error:", error);
    res.status(500).json({ error: "Failed to cancel order." });
  }
};

/**
 * POST /orders/:orderUid/refund-request (User)
 * User requests a refund for their order
 */
export const requestRefund = async (
  req: Request,
  res: Response,
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

  const bodyParsed = RefundRequestSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  const { shopId, uid, user } = authParsed.data;
  const { orderUid } = paramsParsed.data;
  const { reason } = bodyParsed.data;

  try {
    // Find order and verify ownership
    const order = await prisma.order.findFirst({
      where: { uid: orderUid, shopId, userUid: uid },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        shop: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Check if order is eligible for refund
    const refundableStatuses = ["DELIVERED", "SHIPPED", "PROCESSING"];
    if (!refundableStatuses.includes(order.status)) {
      res.status(400).json({
        error: `Cannot request refund for order with status: ${order.status}`,
      });
      return;
    }

    // Send notification email to admins about refund request
    await sendEmailToAdmins(shopId, "REFUND_REQUESTED_ADMIN", {
      orderRef: order.orderRef,
      customerName: user.fullName || user.username || "Customer",
      customerEmail: user.email,
      refundReason: reason,
      requestedAt: new Date().toLocaleString(),
      refundAmount: Number(order.totalAmount),
      currency: order.currency,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
      })),
      adminDashboardUrl: `https://${order.shop.uid || ""}/admin/orders?uid=${order.uid}`,
    });

    res.status(200).json({
      success:
        "Refund request submitted successfully. Our team will review it shortly.",
      order: {
        uid: order.uid,
        orderRef: order.orderRef,
      },
    });
  } catch (error: any) {
    console.error("Refund request error:", error);
    res.status(500).json({ error: "Failed to submit refund request." });
  }
};

/**
 * PATCH /orders/:orderUid/billing (User)
 * Update billing information for an order
 * Only allowed for PENDING orders
 */
export const updateOrderBilling = async (
  req: Request,
  res: Response,
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

  const bodyParsed = UpdateBillingInfoSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  const { shopId, uid } = authParsed.data;
  const { orderUid } = paramsParsed.data;
  const { billingInfoUid } = bodyParsed.data;

  try {
    // Find order and verify ownership
    const order = await prisma.order.findFirst({
      where: { uid: orderUid, shopId, userUid: uid },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Only allow billing updates for PENDING orders
    if (order.status !== "PENDING") {
      res.status(400).json({
        error: `Cannot update billing info for order with status: ${order.status}. Only PENDING orders can be updated.`,
      });
      return;
    }

    // Verify billing info exists and belongs to user
    const billingInfo = await prisma.billingInfo.findFirst({
      where: { uid: billingInfoUid, shopId, userUid: uid },
    });

    if (!billingInfo) {
      res.status(404).json({ error: "Billing information not found" });
      return;
    }

    // Update order with new billing info
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { billingInfoUid },
    });

    res.status(200).json({
      success: "Billing information updated successfully",
      order: {
        uid: updatedOrder.uid,
        billingInfoUid: updatedOrder.billingInfoUid,
      },
    });
  } catch (error: any) {
    console.error("Update billing error:", error);
    res.status(500).json({ error: "Failed to update billing information." });
  }
};

/**
 * POST /orders/admin/:orderUid/verify-payment (Admin)
 * Admin verifies or rejects a payment
 */
export const verifyPayment = async (
  req: Request,
  res: Response,
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

  const bodyParsed = VerifyPaymentSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  const { shopId } = authParsed.data;
  const { orderUid } = paramsParsed.data;
  const { verified } = bodyParsed.data;

  try {
    // Find order
    const order = await prisma.order.findFirst({
      where: { uid: orderUid, shopId },
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
          },
        },
        payment: true,
        shop: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Check if order is in VERIFYING_PAYMENT status
    if (order.status !== "VERIFYING_PAYMENT") {
      res.status(400).json({
        error: `Cannot verify payment for order with status: ${order.status}. Order must be in VERIFYING_PAYMENT status.`,
      });
      return;
    }

    let updatedOrder;
    if (verified) {
      // Payment verified - move to PROCESSING
      updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { status: "PROCESSING" },
      });

      // Update payment status if it exists
      if (order.payment) {
        await prisma.payment.update({
          where: { id: order.payment.id },
          data: { status: "SUCCESS" },
        });
      }

    } else {
      // Payment rejected - move to CANCELED
      updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELED",
        },
      });

      // Update payment status if it exists
      if (order.payment) {
        await prisma.payment.update({
          where: { id: order.payment.id },
          data: { status: "FAILED" },
        });
      }

    }

    res.status(200).json({
      success: verified
        ? "Payment verified successfully. Order is now processing."
        : "Payment rejected. Order has been canceled.",
      order: {
        uid: updatedOrder.uid,
        status: updatedOrder.status,
        orderRef: updatedOrder.orderRef,
      },
    });
  } catch (error: any) {
    console.error("Verify payment error:", error);
    res.status(500).json({ error: "Failed to verify payment." });
  }
};
