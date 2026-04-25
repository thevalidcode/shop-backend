import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { subscriptionService } from "../services/subscription.services";
import { ApiActionSchema } from "../schemas/api.schema";
import { ApiCreateOrderActionSchema } from "../schemas/api.schema";
import { createPayment } from "../services/payment.services";
import { Decimal } from "@prisma/client/runtime/client";
import { User } from "../../prisma/generated";
import { getShippingRatesForCart } from "../services/shipping.services";
import { v4 as uuidv4 } from "uuid";
import { decryptKey } from "../utils/encrypt";
import crypto from "crypto";
import { sendEmailToAdmins, sendUserEmail } from "../emails";

const shippingInfoSelect = {
  uid: true,
  fullName: true,
  email: true,
  phone: true,
  address: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  isDefault: true,
  timestamp: true,
  updatedAt: true,
} as const;

const hashApiKey = (key: string) =>
  crypto.createHash("sha256").update(key).digest("hex");

async function assertApiAccess(shopId: number): Promise<void> {
  const validation = await subscriptionService.getValidatedSubscription(shopId);
  if (!validation.valid || !validation.subscription) {
    throw new Error("API_ACCESS_REQUIRED");
  }

  const apiAccess = validation.subscription.plan.features?.api_access;
  if (!apiAccess) {
    throw new Error("API_ACCESS_DISABLED");
  }
}

async function getApiUser(key: string) {
  const keyHash = hashApiKey(key);
  const user = await prisma.user.findFirst({
    where: { apiKeyHash: keyHash },
    include: { shop: true },
  });

  if (!user) {
    throw new Error("INVALID_API_KEY");
  }

  if (!user.encryptedApiKey || !user.apiKeyIv) {
    throw new Error("INVALID_API_KEY");
  }

  const decryptedKey = decryptKey(user.encryptedApiKey, user.apiKeyIv);
  if (decryptedKey !== key) {
    throw new Error("INVALID_API_KEY");
  }

  await assertApiAccess(user.shopId);
  return user;
}

async function resolvePaymentDefaults(
  user: User,
  input: { useBalance: boolean; platform?: string; currency?: string },
) {
  if (input.useBalance) {
    return {
      platform: "CREDIT" as const,
      currency: (input.currency || user.currency).toUpperCase(),
    };
  }

  if (input.platform && input.currency) {
    return {
      platform: input.platform,
      currency: input.currency.toUpperCase(),
    };
  }

  const fallbackGateway = await prisma.paymentGateway.findFirst({
    where: {
      shopId: user.shopId,
      status: "ACTIVE",
      NOT: { platform: "CREDIT" },
    },
    orderBy: [{ position: "asc" }, { id: "asc" }],
    select: { platform: true },
  });

  if (!fallbackGateway && !input.platform) {
    throw new Error("NO_ACTIVE_PAYMENT_GATEWAY");
  }

  return {
    platform: input.platform || fallbackGateway!.platform,
    currency: (input.currency || user.currency).toUpperCase(),
  };
}

async function getOrCreateCartForApi(user: User) {
  let cart = await prisma.cart.findUnique({
    where: { userUid_shopId: { userUid: user.uid, shopId: user.shopId } },
  });

  if (!cart) {
    const counter = await prisma.shopCounter.update({
      where: { shopId: user.shopId },
      data: { cartCounter: { increment: 1 } },
      select: { cartCounter: true },
    });

    cart = await prisma.cart.create({
      data: {
        uid: uuidv4(),
        shopScopedId: counter.cartCounter,
        userUid: user.uid,
        shopId: user.shopId,
      },
    });
  }

  return cart;
}

function mapOrder(order: {
  uid: string;
  shopScopedId: number;
  totalAmount: Decimal;
  currency: string;
  status: string;
  trackingNumber: string | null;
  estimatedDelivery: Date | null;
  deliveredAt: Date | null;
  supplierOrderUid: string | null;
  syncWithSupplier: boolean;
  shippingCost: Decimal | null;
  shippingCurrency: string | null;
  selectedShippingRate: unknown;
  shippingInfoUid: string | null;
  paymentUid: string | null;
  notes: string | null;
  orderRef: string;
  timestamp: Date;
  updatedAt: Date;
  items?: Array<{
    uid: string;
    quantity: number;
    priceAtTimeOfPurchase: Decimal;
    product: {
      uid: string;
      name: string;
      slug: string;
      imageUrl: string | null;
    };
  }>;
  payment?: {
    uid: string;
    method: string;
    status: string;
    amount: Decimal;
    chargedAmount: Decimal;
    currency: string;
    purpose: string;
    createdAt: Date;
  } | null;
  shippingInfo?: {
    uid: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    timestamp: Date;
    updatedAt: Date;
  } | null;
  shipment?: {
    uid: string;
    platform: string;
    status: string;
    trackingNumber: string | null;
    trackingUrl: string | null;
    courierName: string | null;
    courierCode: string | null;
    estimatedDeliveryDate: Date | null;
    actualDeliveryDate: Date | null;
    lastSyncedAt: Date | null;
    externalShipmentId: string | null;
    labelUrl: string | null;
    metadata: unknown;
    trackingEvents?: Array<{
      uid: string;
      status: string;
      statusCode: string | null;
      location: string | null;
      description: string | null;
      courierStatus: string | null;
      timestamp: Date;
      rawPayload: unknown;
    }>;
  } | null;
}) {
  return {
    uid: order.uid,
    order: order.shopScopedId,
    orderRef: order.orderRef,
    charge: Number(order.totalAmount),
    currency: order.currency,
    status: order.status,
    trackingNumber: order.trackingNumber,
    estimatedDelivery: order.estimatedDelivery,
    deliveredAt: order.deliveredAt,
    supplierOrderUid: order.supplierOrderUid,
    syncWithSupplier: order.syncWithSupplier,
    shippingCost: order.shippingCost ? Number(order.shippingCost) : null,
    shippingCurrency: order.shippingCurrency,
    selectedShippingRate: order.selectedShippingRate,
    shippingInfoUid: order.shippingInfoUid,
    paymentUid: order.paymentUid,
    notes: order.notes,
    items:
      order.items?.map((item) => ({
        uid: item.uid,
        quantity: item.quantity,
        priceAtTimeOfPurchase: Number(item.priceAtTimeOfPurchase),
        product: item.product,
      })) || [],
    payment: order.payment
      ? {
          uid: order.payment.uid,
          method: order.payment.method,
          status: order.payment.status,
          amount: Number(order.payment.amount),
          chargedAmount: Number(order.payment.chargedAmount),
          currency: order.payment.currency,
          purpose: order.payment.purpose,
          createdAt: order.payment.createdAt,
        }
      : null,
    shippingInfo: order.shippingInfo || null,
    shipment: order.shipment
      ? {
          uid: order.shipment.uid,
          platform: order.shipment.platform,
          status: order.shipment.status,
          trackingNumber: order.shipment.trackingNumber,
          trackingUrl: order.shipment.trackingUrl,
          courierName: order.shipment.courierName,
          courierCode: order.shipment.courierCode,
          estimatedDeliveryDate: order.shipment.estimatedDeliveryDate,
          actualDeliveryDate: order.shipment.actualDeliveryDate,
          lastSyncedAt: order.shipment.lastSyncedAt,
          externalShipmentId: order.shipment.externalShipmentId,
          labelUrl: order.shipment.labelUrl,
          metadata: order.shipment.metadata,
          trackingEvents:
            order.shipment.trackingEvents?.map((event) => ({
              uid: event.uid,
              status: event.status,
              statusCode: event.statusCode,
              location: event.location,
              description: event.description,
              courierStatus: event.courierStatus,
              timestamp: event.timestamp,
              rawPayload: event.rawPayload,
            })) || [],
        }
      : null,
    createdAt: order.timestamp,
    updatedAt: order.updatedAt,
  };
}

export async function apiRequests(req: Request, res: Response): Promise<void> {
  const parsed = ApiActionSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const user = await getApiUser(parsed.data.key);

    switch (parsed.data.action) {
      case "products": {
        const products = await prisma.product.findMany({
          where: {
            shopId: user.shopId,
            status: "ACTIVE",
          },
          orderBy: { position: "asc" },
          select: {
            uid: true,
            shopScopedId: true,
            name: true,
            slug: true,
            description: true,
            imageUrl: true,
            galleryUrls: true,
            min: true,
            max: true,
            price: true,
            comparePrice: true,
            currency: true,
            stock: true,
            categoryUid: true,
            isFeatured: true,
            brand: true,
            status: true,
            variants: {
              orderBy: { position: "asc" },
              take: 5,
              select: {
                uid: true,
                name: true,
                price: true,
                comparePrice: true,
                stock: true,
                sku: true,
                imageUrl: true,
                isDefault: true,
              },
            },
            images: {
              orderBy: { position: "asc" },
              take: 8,
              select: {
                uid: true,
                imageUrl: true,
                altText: true,
                position: true,
                isPrimary: true,
              },
            },
            reviews: {
              where: { status: "APPROVED" },
              orderBy: { timestamp: "desc" },
              take: 3,
              select: {
                uid: true,
                rating: true,
                title: true,
                comment: true,
                isVerified: true,
                timestamp: true,
                user: {
                  select: {
                    uid: true,
                    username: true,
                    fullName: true,
                  },
                },
              },
            },
          },
        });

        res.status(200).json({ data: products });
        return;
      }

      case "balance": {
        res.status(200).json({
          data: {
            balance: Number(user.balance),
            currency: user.currency,
          },
        });
        return;
      }

      case "create": {
        const createData = ApiCreateOrderActionSchema.parse(parsed.data);
        const useBalance = createData.useBalance ?? false;
        const paymentDefaults = await resolvePaymentDefaults(user as User, {
          useBalance,
          platform: createData.platform,
          currency: createData.currency,
        });

        const shop = await prisma.shop.findFirst({
          where: { shopId: user.shopId },
          select: { uid: true },
        });

        if (!shop?.uid) {
          throw new Error("SHOP_NOT_FOUND");
        }

        let calculatedShippingCost: number | undefined;
        let calculatedShippingCurrency: string | undefined;

        if (parsed.data.selectedShippingRate) {
          const requestedProvider =
            createData.selectedShippingRate?.provider ||
            createData.selectedShippingRate?.platform;

          const rates = await getShippingRatesForCart(
            user.shopId,
            createData.cartUid,
            createData.shippingInfoUid,
            requestedProvider,
          );

          const matchedRate = rates.find((rate) => {
            if (createData.selectedShippingRate?.rateId && rate.rateId) {
              return (
                String(rate.rateId) ===
                String(createData.selectedShippingRate.rateId)
              );
            }

            return (
              rate.platform ===
                (createData.selectedShippingRate?.provider ||
                  createData.selectedShippingRate?.platform) &&
              rate.serviceCode ===
                createData.selectedShippingRate?.serviceCode &&
              rate.accountUid === createData.selectedShippingRate?.accountUid
            );
          });

          if (!matchedRate) {
            res.status(400).json({
              error:
                "Selected shipping rate is invalid or expired. Fetch a fresh shipping quote and try again.",
            });
            return;
          }

          calculatedShippingCost = Number(matchedRate.cost);
          calculatedShippingCurrency = matchedRate.currency;
        }

        const result = await createPayment(user as User, {
          platform: paymentDefaults.platform as any,
          currency: paymentDefaults.currency,
          purpose: "ORDER",
          cartUid: createData.cartUid,
          redirectUrl: `https://${shop.uid}/client/payment-success`,
          shippingInfoUid: createData.shippingInfoUid,
          notes: createData.notes,
          shippingCost: calculatedShippingCost,
          shippingCurrency: calculatedShippingCurrency,
          selectedShippingRate: createData.selectedShippingRate,
          useBalance,
        });

        res.status(200).json({ data: result });
        return;
      }

      case "cart": {
        const cart = await getOrCreateCartForApi(user as User);
        const items = parsed.data.items ?? [];

        if (items.length) {
          await prisma.$transaction(async (tx) => {
            for (const item of items) {
              const product = await tx.product.findFirst({
                where: {
                  uid: item.productUid,
                  shopId: user.shopId,
                  status: "ACTIVE",
                },
                select: {
                  id: true,
                  uid: true,
                  trackInventory: true,
                  stock: true,
                },
              });

              if (!product) {
                throw new Error(`PRODUCT_NOT_FOUND:${item.productUid}`);
              }

              const existingItem = await tx.cartItem.findFirst({
                where: { cartId: cart.id, productId: product.id },
                select: { id: true, quantity: true },
              });

              const nextQuantity =
                (existingItem?.quantity || 0) + item.quantity;
              if (product.trackInventory && product.stock < nextQuantity) {
                throw new Error(`INSUFFICIENT_STOCK:${product.uid}`);
              }

              if (existingItem) {
                await tx.cartItem.update({
                  where: { id: existingItem.id },
                  data: { quantity: nextQuantity },
                });
              } else {
                const counter = await tx.shopCounter.update({
                  where: { shopId: user.shopId },
                  data: { cartItemCounter: { increment: 1 } },
                  select: { cartItemCounter: true },
                });

                await tx.cartItem.create({
                  data: {
                    uid: uuidv4(),
                    shopScopedId: counter.cartItemCounter,
                    cartId: cart.id,
                    productId: product.id,
                    quantity: item.quantity,
                  },
                });
              }
            }
          });
        }

        const cartItems = await prisma.cartItem.findMany({
          where: { cartId: cart.id },
          include: { product: { select: { uid: true } } },
          orderBy: { id: "asc" },
        });

        res.status(200).json({
          data: {
            uid: cart.uid,
            itemCount: cartItems.length,
            items: cartItems.map((item) => ({
              productUid: item.product.uid,
              quantity: item.quantity,
            })),
          },
        });
        return;
      }

      case "shipping_quote": {
        const rates = await getShippingRatesForCart(
          user.shopId,
          parsed.data.cartUid,
          parsed.data.shippingInfoUid,
          parsed.data.platform as any,
        );

        res.status(200).json({
          data: rates.map((rate) => ({
            provider: rate.platform,
            serviceName: rate.serviceName,
            serviceCode: rate.serviceCode,
            cost: rate.cost,
            currency: rate.currency,
            estimatedDays: rate.estimatedDays,
            selectedShippingRate: {
              provider: rate.platform,
              accountUid: rate.accountUid,
              courierName: rate.courierName,
              serviceName: rate.serviceName,
              serviceCode: rate.serviceCode,
              rateId: rate.rateId,
              cost: rate.cost,
              currency: rate.currency,
              estimatedDays: rate.estimatedDays,
            },
          })),
        });
        return;
      }

      case "shipping_methods": {
        const accounts = await prisma.shippingAccount.findMany({
          where: { shopId: user.shopId, isActive: true },
          select: {
            uid: true,
            platform: true,
            isPreferred: true,
            testMode: true,
          },
          orderBy: [{ isPreferred: "desc" }, { createdAt: "desc" }],
        });

        res.status(200).json({
          data: accounts.map((account) => ({
            uid: account.uid,
            platform: account.platform,
            name:
              account.platform === "SENDBOX"
                ? "Sendbox Delivery"
                : "Shippo Shipping",
            isPreferred: account.isPreferred,
            testMode: account.testMode,
          })),
        });
        return;
      }

      case "shipping_info": {
        const operation = parsed.data.operation || "list";

        if (operation === "list") {
          const shippingInfos = await prisma.shippingInfo.findMany({
            where: { userUid: user.uid, shopId: user.shopId },
            select: shippingInfoSelect,
            orderBy: [{ isDefault: "desc" }, { timestamp: "desc" }],
          });

          res.status(200).json({ data: shippingInfos });
          return;
        }

        if (!parsed.data.shippingInfoUid) {
          res.status(400).json({
            error:
              "shippingInfoUid is required for this shipping_info operation",
          });
          return;
        }

        const shippingInfo = await prisma.shippingInfo.findFirst({
          where: {
            uid: parsed.data.shippingInfoUid,
            userUid: user.uid,
            shopId: user.shopId,
          },
          select: { uid: true, isDefault: true },
        });

        if (!shippingInfo) {
          res.status(404).json({ error: "Shipping information not found" });
          return;
        }

        if (operation === "delete") {
          await prisma.$transaction(async (tx) => {
            await tx.shippingInfo.delete({ where: { uid: shippingInfo.uid } });

            if (shippingInfo.isDefault) {
              const replacement = await tx.shippingInfo.findFirst({
                where: { userUid: user.uid, shopId: user.shopId },
                orderBy: { timestamp: "desc" },
                select: { uid: true },
              });

              if (replacement) {
                await tx.shippingInfo.update({
                  where: { uid: replacement.uid },
                  data: { isDefault: true },
                });
              }
            }
          });

          const shippingInfos = await prisma.shippingInfo.findMany({
            where: { userUid: user.uid, shopId: user.shopId },
            select: shippingInfoSelect,
            orderBy: [{ isDefault: "desc" }, { timestamp: "desc" }],
          });

          res.status(200).json({
            data: {
              success: "Shipping information deleted successfully",
              shippingInfos,
            },
          });
          return;
        }

        if (operation === "set_default") {
          await prisma.$transaction(async (tx) => {
            await tx.shippingInfo.updateMany({
              where: {
                userUid: user.uid,
                shopId: user.shopId,
                isDefault: true,
                uid: { not: shippingInfo.uid },
              },
              data: { isDefault: false },
            });

            await tx.shippingInfo.update({
              where: { uid: shippingInfo.uid },
              data: { isDefault: true },
            });
          });

          const updated = await prisma.shippingInfo.findFirst({
            where: { uid: shippingInfo.uid },
            select: shippingInfoSelect,
          });

          res.status(200).json({
            data: {
              success: "Default shipping information updated successfully",
              shippingInfo: updated,
            },
          });
          return;
        }

        res.status(400).json({ error: "Unsupported shipping_info operation" });
        return;
      }

      case "create_shipping_info": {
        const payload = parsed.data;
        const setDefault = payload.isDefault ?? false;

        const created = await prisma.$transaction(async (tx) => {
          if (setDefault) {
            await tx.shippingInfo.updateMany({
              where: {
                userUid: user.uid,
                shopId: user.shopId,
                isDefault: true,
              },
              data: { isDefault: false },
            });
          }

          const counter = await tx.shopCounter.update({
            where: { shopId: user.shopId },
            data: { shippingInfoCounter: { increment: 1 } },
            select: { shippingInfoCounter: true },
          });

          return tx.shippingInfo.create({
            data: {
              uid: uuidv4(),
              shopScopedId: counter.shippingInfoCounter,
              userUid: user.uid,
              shopId: user.shopId,
              fullName: payload.fullName,
              email: payload.email,
              phone: payload.phone,
              address: payload.address,
              city: payload.city,
              state: payload.state,
              postalCode: payload.postalCode,
              country: payload.country,
              isDefault: setDefault,
            },
            select: shippingInfoSelect,
          });
        });

        res.status(201).json({
          data: {
            success: "Shipping information created successfully",
            shippingInfo: created,
          },
        });
        return;
      }

      case "orders": {
        if (parsed.data.orderUid) {
          const order = await prisma.order.findFirst({
            where: {
              uid: parsed.data.orderUid,
              shopId: user.shopId,
              userUid: user.uid,
            },
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      uid: true,
                      name: true,
                      slug: true,
                      imageUrl: true,
                    },
                  },
                },
              },
              shippingInfo: true,
              payment: true,
              shipment: {
                include: {
                  trackingEvents: {
                    orderBy: { timestamp: "desc" },
                  },
                },
              },
            },
          });

          if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
          }

          res.status(200).json({ data: mapOrder(order) });
          return;
        }

        const orders = await prisma.order.findMany({
          where: { shopId: user.shopId, userUid: user.uid },
          orderBy: { timestamp: "desc" },
          include: {
            payment: true,
            shipment: {
              include: {
                trackingEvents: {
                  orderBy: { timestamp: "desc" },
                  take: 10,
                },
              },
            },
          },
        });

        res.status(200).json({ data: orders.map(mapOrder) });
        return;
      }

      case "refund": {
        const order = await prisma.order.findFirst({
          where: {
            uid: parsed.data.orderUid,
            shopId: user.shopId,
            userUid: user.uid,
          },
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

        const refundableStatuses = ["DELIVERED", "SHIPPED", "PROCESSING"];
        if (!refundableStatuses.includes(order.status)) {
          res.status(400).json({
            error: `Cannot request refund for order with status: ${order.status}`,
          });
          return;
        }

        await sendEmailToAdmins(user.shopId, "REFUND_REQUESTED_ADMIN", {
          orderRef: order.orderRef,
          customerName: user.fullName || user.username || "Customer",
          customerEmail: user.email,
          refundReason: parsed.data.reason,
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
          data: {
            uid: order.uid,
            orderRef: order.orderRef,
            success:
              "Refund request submitted successfully. Our team will review it shortly.",
          },
        });
        return;
      }

      case "cancel": {
        const order = await prisma.order.findFirst({
          where: {
            uid: parsed.data.orderUid,
            shopId: user.shopId,
            userUid: user.uid,
          },
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

        const cancelableStatuses = ["PENDING", "VERIFYING_PAYMENT"];
        if (!cancelableStatuses.includes(order.status)) {
          res.status(400).json({
            error: `Cannot cancel order with status: ${order.status}. Only Pending or Verifying Payment orders can be canceled.`,
          });
          return;
        }

        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: { status: "CANCELED" },
        });

        await sendUserEmail(user.shopId, user.email, "ORDER_CANCELED", {
          orderRef: order.orderRef,
          cancellationReason: "Canceled by customer request",
          refundAmount: Number(order.totalAmount),
          currency: order.currency,
          refundETA: "3-5 business days",
        });

        await sendEmailToAdmins(user.shopId, "ORDER_CANCELED_ADMIN", {
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
          data: {
            uid: updatedOrder.uid,
            status: updatedOrder.status,
          },
        });
        return;
      }

      default:
        res.status(400).json({ error: "Unsupported action" });
    }
  } catch (error: any) {
    if (error.message === "INVALID_API_KEY") {
      res.status(401).json({ error: "Invalid API key" });
      return;
    }

    if (error.message === "API_ACCESS_REQUIRED") {
      res.status(403).json({ error: "Active subscription required" });
      return;
    }

    if (error.message === "API_ACCESS_DISABLED") {
      res.status(403).json({ error: "API access is disabled for this shop" });
      return;
    }

    if (error.message === "NO_ACTIVE_PAYMENT_GATEWAY") {
      res
        .status(400)
        .json({ error: "No active payment gateway is configured" });
      return;
    }

    if (error.message === "SHOP_NOT_FOUND") {
      res.status(404).json({ error: "Shop not found" });
      return;
    }

    res.status(500).json({ error: error.message || "API request failed" });
  }
}
