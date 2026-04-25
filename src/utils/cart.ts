import { Decimal } from "@prisma/client/runtime/client";
import { User } from "../../prisma/generated";
import { prisma } from "../config/db.config";
import { Prisma } from "../../prisma/generated";
import { sendUserEmail, sendEmailToAdmins } from "../emails";
import convertCurrency from "./ConvertCurrency";

// The type you need
export type PrismaTransactionalClient = Prisma.TransactionClient;

/**
 * Calculates the total price for a cart using Decimal for accuracy.
 * Handles multi-currency by selecting a single cart currency and converting all lines into it.
 * @param cart - The cart object with items and each item including product and quantity
 * @returns Object with amount (Decimal) and currency (string)
 */
export async function calculateCartTotal(cart: {
  items: Array<{
    quantity: number;
    product?: { price?: any; currency?: string };
  }>;
}): Promise<{ amount: Decimal; currency: string }> {
  if (!cart.items || cart.items.length === 0) {
    return { amount: new Decimal(0), currency: "USD" };
  }

  const normalizedCurrencies = cart.items.map((item) =>
    (item.product?.currency || "USD").substring(0, 3).toUpperCase(),
  );
  const currencies = new Set(normalizedCurrencies);
  const selectedCurrency = normalizedCurrencies[0] || "USD";

  // If all same currency, calculate total in that currency
  if (currencies.size === 1) {
    let totalAmount = new Decimal(0);

    for (const item of cart.items) {
      const price = item.product?.price
        ? new Decimal(item.product.price)
        : new Decimal(0);
      totalAmount = totalAmount.plus(price.times(item.quantity));
    }

    return { amount: totalAmount, currency: selectedCurrency };
  }

  // Multiple currencies - convert all to one selected cart currency.
  let totalAmount = new Decimal(0);

  for (const item of cart.items) {
    const productCurrency = (item.product?.currency || "USD")
      .substring(0, 3)
      .toUpperCase();
    const productPrice = item.product?.price
      ? new Decimal(item.product.price)
      : new Decimal(0);

    let convertedPrice = productPrice;
    if (productCurrency !== selectedCurrency) {
      const converted = await convertCurrency(
        productPrice.toNumber(),
        productCurrency,
        selectedCurrency,
      );
      convertedPrice = new Decimal(converted);
    }

    totalAmount = totalAmount.plus(convertedPrice.times(item.quantity));
  }

  return { amount: totalAmount, currency: selectedCurrency };
}

// Internal helper for order placement, accepts tx
async function _placeOrderFromCartTx(
  tx: PrismaTransactionalClient,
  shippingInfoUid: string,
  paymentUid: string,
  verifyingPayment: boolean,
  notes?: string | null,
  user?: Partial<User>,
  shippingCost?: number,
  shippingCurrency?: string,
  selectedShippingRate?: any,
): Promise<any> {
  if (!user?.uid || !user?.shopId) {
    throw new Error("User information incomplete");
  }
  // Get cart with items and products
  const cart = await tx.cart.findUnique({
    where: { userUid_shopId: { userUid: user.uid!, shopId: user.shopId! } },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const payment = await tx.payment.findUnique({
    where: { uid: paymentUid, status: "PENDING" },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  if (!payment) {
    throw new Error("No pending payment found to create this order.");
  }

  // Validate shipping info belongs to user
  const shippingInfo = await tx.shippingInfo.findFirst({
    where: {
      uid: shippingInfoUid,
      userUid: user.uid,
      shopId: user.shopId,
    },
  });

  if (!shippingInfo) {
    throw new Error("Shipping information not found");
  }

  // Validate stock for all items
  for (const item of cart.items) {
    if (item.product.trackInventory && item.product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${item.product.name}. Only ${item.product.stock} available.`,
      );
    }
  }

  // Calculate totals
  const cartTotal = await calculateCartTotal(cart);
  const subtotal = cartTotal.amount;
  const cartCurrency = cartTotal.currency;

  const tax = 0; // Can be calculated based on shop settings

  // Convert shipping cost to cart currency if needed
  let shippingInCartCurrency = new Decimal(0);
  if (shippingCost && shippingCurrency) {
    if (shippingCurrency !== cartCurrency) {
      const converted = await convertCurrency(
        shippingCost,
        shippingCurrency,
        cartCurrency,
      );
      shippingInCartCurrency = new Decimal(converted);
    } else {
      shippingInCartCurrency = new Decimal(shippingCost);
    }
  } else if (shippingCost) {
    // If no shipping currency provided, assume it matches cart currency
    shippingInCartCurrency = new Decimal(shippingCost);
  }

  const totalAmount = subtotal.plus(tax).plus(shippingInCartCurrency);

  // Generate order reference
  const counter = await tx.shopCounter.update({
    where: { shopId: user.shopId },
    data: {
      orderCounter: { increment: 1 },
      transactionCounter: { increment: 1 },
    },
  });

  const orderRef = `ORD-${user.shopId}-${counter.orderCounter}`;

  const supplierLinkedItems = cart.items.filter(
    (item) => item.product.supplierUid && item.product.syncWithSupplier,
  );
  const hasSingleSupplierOrder =
    supplierLinkedItems.length > 0 &&
    new Set(supplierLinkedItems.map((item) => item.product.supplierUid))
      .size === 1;

  const supplierUid = hasSingleSupplierOrder
    ? (supplierLinkedItems[0]?.product.supplierUid ?? null)
    : null;
  const supplierCurrency = hasSingleSupplierOrder
    ? (supplierLinkedItems[0]?.product.supplierCurrency ?? null)
    : null;

  const supplierSubtotal = hasSingleSupplierOrder
    ? supplierLinkedItems.reduce((sum, item) => {
        const supplierPrice = item.product.supplierPrice
          ? new Decimal(item.product.supplierPrice)
          : new Decimal(0);
        return sum.plus(supplierPrice.times(item.quantity));
      }, new Decimal(0))
    : null;

  // Create order
  const newOrder = await tx.order.create({
    data: {
      shopScopedId: counter.orderCounter,
      orderRef,
      currency: cartCurrency,
      userUid: user.uid!,
      shopId: user.shopId!,
      paymentUid: payment.uid,
      shippingInfoUid,
      totalAmount: totalAmount,
      status: verifyingPayment ? "VERIFYING_PAYMENT" : "PENDING",
      notes,
      supplierUid,
      supplierPrice: supplierSubtotal,
      supplierCurrency,
      syncWithSupplier: Boolean(hasSingleSupplierOrder),
      shippingCost:
        shippingInCartCurrency.toNumber() > 0 ? shippingInCartCurrency : null,
      shippingCurrency:
        shippingInCartCurrency.toNumber() > 0 ? cartCurrency : null,
      selectedShippingRate: selectedShippingRate || null,
    },
    include: { shop: true },
  });

  // Create order items and reduce stock
  const lowStockProducts: any[] = [];

  for (const item of cart.items) {
    await tx.orderItem.create({
      data: {
        orderId: newOrder.id,
        productUid: item.product.uid,
        quantity: item.quantity,
        priceAtTimeOfPurchase: item.product.price,
      },
    });

    // Reduce product stock if tracking inventory
    if (item.product.trackInventory) {
      const updatedProduct = await tx.product.update({
        where: { id: item.product.id },
        data: {
          stock: { decrement: item.quantity },
          totalSales: { increment: item.quantity },
        },
      });

      // Check for low stock after decrement
      if (updatedProduct.stock <= 10 && updatedProduct.stock >= 0) {
        lowStockProducts.push({
          ...updatedProduct,
          shopId: user.shopId,
        });
      }
    }
  }

  await tx.transaction.create({
    data: {
      type: "ORDER_PAYMENT",
      amount: totalAmount,
      description: `Order payment for order ${orderRef}`,
      userUid: user.uid!,
      status: verifyingPayment ? "PENDING" : "SUCCESS",
      shopScopedId: counter.transactionCounter,
      shopId: user.shopId!,
    },
  });

  // Clear cart items
  await tx.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return {
    order: newOrder,
    lowStockProducts,
    subtotal,
    cartCurrency,
    shippingInCartCurrency,
  };
}

export const placeOrderFromCartTx = async (
  shippingInfoUid: string,
  paymentUid: string,
  verifyingPayment: boolean,
  notes?: string | null,
  user?: Partial<User>,
  tx?: PrismaTransactionalClient,
  shippingCost?: number,
  shippingCurrency?: string,
  selectedShippingRate?: any,
): Promise<{ success?: string; order?: any; error?: string }> => {
  if (!user?.uid || !user?.shopId) {
    throw new Error("User information incomplete");
  }
  try {
    let result;
    if (tx) {
      result = await _placeOrderFromCartTx(
        tx,
        shippingInfoUid,
        paymentUid,
        verifyingPayment,
        notes,
        user,
        shippingCost,
        shippingCurrency,
        selectedShippingRate,
      );
    } else {
      result = await prisma.$transaction(async (trx) => {
        return await _placeOrderFromCartTx(
          trx,
          shippingInfoUid,
          paymentUid,
          verifyingPayment,
          notes,
          user,
          shippingCost,
          shippingCurrency,
          selectedShippingRate,
        );
      });
    }

    const {
      order,
      lowStockProducts,
      subtotal,
      cartCurrency,
      shippingInCartCurrency,
    } = result;

    // Send order confirmation email to user
    if (user.email && user.shopId) {
      try {
        const orderWithDetails = await prisma.order.findUnique({
          where: { id: order.id },
          include: {
            items: {
              include: {
                product: { select: { name: true, price: true } },
              },
            },
            shippingInfo: true,
            shop: true,
          },
        });

        const shopUrl = `https://${order.shop.uid}`;
        if (orderWithDetails) {
          const orderItems = orderWithDetails.items.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: Number(item.priceAtTimeOfPurchase).toFixed(2),
          }));

          await sendUserEmail(user.shopId, user.email, "ORDER_CONFIRMED", {
            customerName: user.fullName || user.username || "Customer",
            orderNumber: order.orderRef,
            orderDate: new Date().toLocaleDateString(),
            orderItems,
            subtotal: Number(subtotal).toFixed(2),
            tax: 0,
            shipping: Number(shippingInCartCurrency).toFixed(2),
            totalAmount: Number(order.totalAmount).toFixed(2),
            currency: cartCurrency,
            shippingAddress: orderWithDetails.shippingInfo
              ? `${orderWithDetails.shippingInfo.address}, ${orderWithDetails.shippingInfo.city}, ${orderWithDetails.shippingInfo.state} ${orderWithDetails.shippingInfo.postalCode}`
              : "N/A",
            trackingUrl: `${shopUrl}/orders/${order.uid}`,
          });

          // Also send notification to admins
          await sendEmailToAdmins(user.shopId, "NEW_ORDER_NOTIFICATION", {
            orderNumber: order.orderRef,
            customerName: user.fullName || user.username || "Customer",
            orderDate: new Date().toLocaleDateString(),
            orderItems,
            totalAmount: Number(order.totalAmount).toFixed(2),
            currency: cartCurrency,
            orderDetailsUrl: `${shopUrl}/admin/orders/${order.uid}`,
          });
        }
      } catch (emailError) {
        console.error("Failed to send order confirmation emails:", emailError);
      }

      if (lowStockProducts?.length > 0) {
        try {
          const shopUrl = `https://${order.shop.uid}`;
          for (const product of lowStockProducts) {
            if (product.stock === 0) {
              await sendEmailToAdmins(user.shopId, "OUT_OF_STOCK_ALERT", {
                productName: product.name,
                productSku: product.sku || "",
                productUrl: `${shopUrl}/client/products?slug=${product.slug}`,
                adminDashboardUrl: `${shopUrl}/admin/products`,
              });
            } else if (product.stock > 0 && product.stock <= 10) {
              await sendEmailToAdmins(user.shopId, "LOW_STOCK_ALERT", {
                productName: product.name,
                productSku: product.sku || "",
                currentStock: product.stock,
                productUrl: `${shopUrl}/client/products?slug=${product.slug}`,
                adminDashboardUrl: `${shopUrl}/admin/products`,
              });
            }
          }
        } catch (stockEmailError) {
          console.error("Failed to send stock alert emails:", stockEmailError);
        }
      }
    }

    return {
      success: "Order placed successfully",
      order: {
        id: order.id,
        uid: order.uid,
        orderRef: order.orderRef,
        totalAmount: Number(order.totalAmount),
        status: order.status,
      },
    };
  } catch (error: any) {
    console.error("Place order error:", error);
    if (
      error.message.includes("empty") ||
      error.message.includes("stock") ||
      error.message.includes("not found")
    ) {
      return { error: error.message };
    } else {
      return { error: "Failed to place order." };
    }
  }
};

export const placeOrderFromCart = async (
  shippingInfoUid: string,
  paymentUid: string,
  verifyingPayment: boolean,
  notes?: string | null,
  user?: Partial<User>,
  shippingCost?: number,
  shippingCurrency?: string,
  selectedShippingRate?: any,
): Promise<{ success?: string; order?: any; error?: string }> => {
  return placeOrderFromCartTx(
    shippingInfoUid,
    paymentUid,
    verifyingPayment,
    notes,
    user,
    undefined,
    shippingCost,
    shippingCurrency,
    selectedShippingRate,
  );
};
