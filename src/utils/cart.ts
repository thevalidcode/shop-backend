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
 * Handles multi-currency by converting all to USD if products have different currencies.
 * @param cart - The cart object with items and each item including product and quantity
 * @returns Object with amount (Decimal) and currency (string)
 */
export async function calculateCartTotal(cart: {
  items: Array<{ quantity: number; product?: { price?: any; currency?: string } }>;
}): Promise<{ amount: Decimal; currency: string }> {
  if (!cart.items || cart.items.length === 0) {
    return { amount: new Decimal(0), currency: "USD" };
  }

  // Check if all products have the same currency
  const currencies = new Set(
    cart.items.map((item) => item.product?.currency || "USD")
  );

  // If all same currency, calculate total in that currency
  if (currencies.size === 1) {
    const currency = cart.items[0]?.product?.currency || "USD";
    let totalAmount = new Decimal(0);
    
    for (const item of cart.items) {
      const price = item.product?.price
        ? new Decimal(item.product.price)
        : new Decimal(0);
      totalAmount = totalAmount.plus(price.times(item.quantity));
    }
    
    return { amount: totalAmount, currency };
  }

  // Multiple currencies - convert all to USD
  let totalAmount = new Decimal(0);
  
  for (const item of cart.items) {
    const productCurrency = item.product?.currency || "USD";
    const productPrice = item.product?.price
      ? new Decimal(item.product.price)
      : new Decimal(0);
    
    let priceInUSD = productPrice;
    if (productCurrency !== "USD") {
      const converted = await convertCurrency(
        productPrice.toNumber(),
        productCurrency,
        "USD"
      );
      priceInUSD = new Decimal(converted);
    }
    
    totalAmount = totalAmount.plus(priceInUSD.times(item.quantity));
  }
  
  return { amount: totalAmount, currency: "USD" };
}

// Internal helper for order placement, accepts tx
async function _placeOrderFromCartTx(
  tx: PrismaTransactionalClient,
  billingInfoUid: string,
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

  // Validate billing info belongs to user
  const billingInfo = await tx.billingInfo.findFirst({
    where: {
      uid: billingInfoUid,
      userUid: user.uid,
      shopId: user.shopId,
    },
  });

  if (!billingInfo) {
    throw new Error("Billing information not found");
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
        cartCurrency
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

  // Create order
  const newOrder = await tx.order.create({
    data: {
      shopScopedId: counter.orderCounter,
      orderRef,
      currency: cartCurrency,
      userUid: user.uid!,
      shopId: user.shopId!,
      paymentUid: payment.uid,
      billingInfoUid,
      totalAmount: totalAmount,
      status: verifyingPayment ? "VERIFYING_PAYMENT" : "PENDING",
      notes,
      shippingCost: shippingInCartCurrency.toNumber() > 0 ? shippingInCartCurrency : null,
      shippingCurrency: shippingInCartCurrency.toNumber() > 0 ? cartCurrency : null,
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
    shippingInCartCurrency
  };
}

export const placeOrderFromCartTx = async (
  billingInfoUid: string,
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
        billingInfoUid,
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
          billingInfoUid,
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

    const { order, lowStockProducts, subtotal, cartCurrency, shippingInCartCurrency } = result;

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
            billingInfo: true,
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
            shippingAddress: orderWithDetails.billingInfo
              ? `${orderWithDetails.billingInfo.address}, ${orderWithDetails.billingInfo.city}, ${orderWithDetails.billingInfo.state} ${orderWithDetails.billingInfo.postalCode}`
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
          for (const product of (order as any).lowStockProducts) {
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
  billingInfoUid: string,
  paymentUid: string,
  verifyingPayment: boolean,
  notes?: string | null,
  user?: Partial<User>,
  shippingCost?: number,
  shippingCurrency?: string,
  selectedShippingRate?: any,
): Promise<{ success?: string; order?: any; error?: string }> => {
  return placeOrderFromCartTx(
    billingInfoUid,
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
