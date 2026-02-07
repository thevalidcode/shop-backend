import { prisma } from "../config/db.config";
import { decryptKey } from "../utils/encrypt";
import { ShippingPlatform, ShipmentStatus } from "../../prisma/generated";
import { sendUserEmail } from "../emails";
import { SendboxProvider } from "../providers/sendbox.provider";
import { ShippoProvider } from "../providers/shippo.provider";

/**
 * Interface for shipping provider
 */
export interface ShippingProvider {
  createShipment(params: CreateShipmentParams): Promise<ShipmentResult>;
  getTrackingInfo(trackingNumber: string): Promise<TrackingInfo>;
  getRates(params: GetRatesParams): Promise<ShippingRate[]>;
  verifyWebhookSignature(
    payload: any,
    signature: string,
    secret: string,
  ): boolean;
  testConnection(
    apiKey: string,
    testMode: boolean,
  ): Promise<ConnectionTestResult>;
}

export interface CreateShipmentParams {
  orderId: number;
  orderUid: string;
  weight?: number;
  weightUnit?: string;
  courierCode?: string;
  fromAddress: Address;
  toAddress: Address;
  items: ShipmentItem[];
}

export interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface ShipmentItem {
  name: string;
  quantity: number;
  value?: number;
}

export interface ShipmentResult {
  externalShipmentId: string;
  trackingNumber: string;
  trackingUrl?: string;
  labelUrl?: string;
  courierName: string;
  courierCode?: string;
  estimatedDelivery?: Date;
  shippingCost?: number;
  currency?: string;

  // Generic fee breakdown
  baseFee?: number;
  taxAmount?: number;
  insuranceFee?: number;

  // Provider-specific data (stored as JSON)
  metadata?: any;
  rawResponse?: any;
}

export interface TrackingInfo {
  status: string;
  location?: string;
  timestamp: Date;
  events: TrackingEventInfo[];

  // Additional tracking data
  metadata?: any;
  rawResponse?: any;
}

export interface TrackingEventInfo {
  status: string;
  location?: string;
  description?: string;
  timestamp: Date;
  courierStatus?: string;
  rawPayload?: any;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: any;
}

export interface GetRatesParams {
  fromAddress: Address;
  toAddress: Address;
  weight?: number;
  weightUnit?: string;
  items: ShipmentItem[];
}

export interface ShippingRate {
  courierName: string;
  courierCode?: string;
  serviceName: string;
  serviceCode?: string;
  cost: number;
  currency: string;
  estimatedDays?: number;
  estimatedDelivery?: Date;

  // Fee breakdown
  baseFee?: number;
  taxAmount?: number;
  insuranceFee?: number;

  // Provider-specific data
  metadata?: any;
  rateId?: string;
}

/**
 * Get active shipping account for shop (preferred or fallback)
 */
export async function getActiveShippingAccount(
  shopId: number,
  platformOverride?: ShippingPlatform,
) {
  // If platform specified, use that
  if (platformOverride) {
    const account = await prisma.shippingAccount.findFirst({
      where: { shopId, platform: platformOverride, isActive: true },
    });
    return account;
  }

  // Try preferred account first
  let account = await prisma.shippingAccount.findFirst({
    where: { shopId, isActive: true, isPreferred: true },
  });

  // Fallback to any active account
  if (!account) {
    account = await prisma.shippingAccount.findFirst({
      where: { shopId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  return account;
}

/**
 * Get shipping provider instance
 */
export function getShippingProvider(
  platform: ShippingPlatform,
  apiKey: string,
  testMode: boolean,
): ShippingProvider {
  switch (platform) {
    case "SENDBOX":
      return new SendboxProvider(apiKey, testMode);
    case "SHIPPO":
      return new ShippoProvider(apiKey, testMode);
    default:
      throw new Error(`Unsupported shipping platform: ${platform}`);
  }
}

/**
 * Create shipment for an order
 */
export async function createShipmentForOrder(
  shopId: number,
  orderUid: string,
  options: {
    weight?: number;
    weightUnit?: string;
    courierCode?: string;
    platformOverride?: ShippingPlatform;
  } = {},
) {
  // Get order with all details
  const order = await prisma.order.findFirst({
    where: { uid: orderUid, shopId },
    include: {
      user: true,
      billingInfo: true,
      items: {
        include: {
          product: true,
        },
      },
      shop: {
        include: {
          Setting: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Validate shop address is configured
  const shopSettings = order.shop.Setting?.[0];
  if (
    !shopSettings?.shopStreet ||
    !shopSettings?.shopCity ||
    !shopSettings?.shopState ||
    !shopSettings?.shopPostalCode ||
    !shopSettings?.shopPhone ||
    !shopSettings?.shopCountry
  ) {
    throw new Error(
      "Shop address is not configured. Please update shop settings with complete address before creating shipments.",
    );
  }

  // Check if shipment already exists
  const existingShipment = await prisma.shipment.findFirst({
    where: { orderUid },
  });

  if (existingShipment) {
    throw new Error("Shipment already exists for this order");
  }

  // Get active shipping account
  const shippingAccount = await getActiveShippingAccount(
    shopId,
    options.platformOverride,
  );

  if (!shippingAccount) {
    throw new Error("No active shipping account configured");
  }

  // Decrypt API key
  const apiKey = decryptKey(
    shippingAccount.encryptedApiKey,
    shippingAccount.iv,
  );

  // Get provider
  const provider = getShippingProvider(
    shippingAccount.platform,
    apiKey,
    shippingAccount.testMode,
  );

  // Prepare addresses
  const toAddress: Address = {
    name: order.billingInfo.fullName,
    street: order.billingInfo.address,
    city: order.billingInfo.city,
    state: order.billingInfo.state,
    postalCode: order.billingInfo.postalCode,
    country: order.billingInfo.country,
    phone: order.billingInfo.phone,
    email: order.billingInfo.email,
  };

  // Use shop address from settings as origin address
  const fromAddress: Address = {
    name: order.shop.name,
    street: shopSettings.shopStreet!,
    city: shopSettings.shopCity!,
    state: shopSettings.shopState!,
    postalCode: shopSettings.shopPostalCode!,
    country: shopSettings.shopCountry!,
    phone: shopSettings.shopPhone || undefined,
  };

  // Prepare items
  const items: ShipmentItem[] = order.items.map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
    value: Number(item.priceAtTimeOfPurchase),
  }));

  // Create shipment via provider
  const result = await provider.createShipment({
    orderId: order.id,
    orderUid: order.uid,
    weight: options.weight,
    weightUnit: options.weightUnit || "kg",
    courierCode: options.courierCode,
    fromAddress,
    toAddress,
    items,
  });

  // Get counter and increment
  const counter = await prisma.shopCounter.update({
    where: { shopId },
    data: { shipmentCounter: { increment: 1 } },
  });

  // Save shipment to database with all available data
  const shipment = await prisma.shipment.create({
    data: {
      shopScopedId: counter.shipmentCounter,
      orderUid: order.uid,
      shopId,
      shippingAccountUid: shippingAccount.uid,
      platform: shippingAccount.platform,
      externalShipmentId: result.externalShipmentId,
      courierName: result.courierName,
      courierCode: result.courierCode,
      trackingNumber: result.trackingNumber,
      trackingUrl: result.trackingUrl,
      labelUrl: result.labelUrl,
      status: "LABEL_CREATED",
      estimatedDeliveryDate: result.estimatedDelivery,
      weight: options.weight,
      weightUnit: options.weightUnit || "kg",
      shippingCost: result.shippingCost,
      currency: result.currency || order.currency,

      // Generic fee breakdown
      baseFee: result.baseFee,
      taxAmount: result.taxAmount,
      insuranceFee: result.insuranceFee,

      // Provider-specific data stored as JSON
      metadata: result.metadata,
      rawResponse: result.rawResponse,

      lastSyncedAt: new Date(),
    },
  });

  // Update order status to SHIPPED
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "SHIPPED" },
  });

  // Send shipment created email
  await sendUserEmail(shopId, order.user.email, "SHIPMENT_CREATED", {
    orderRef: order.orderRef,
    trackingNumber: result.trackingNumber,
    trackingUrl: result.trackingUrl,
    courierName: result.courierName,
    estimatedDelivery: result.estimatedDelivery?.toLocaleDateString(),
    items: order.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
    })),
    shippingAddress: `${order.billingInfo.address}\n${order.billingInfo.city}, ${order.billingInfo.state} ${order.billingInfo.postalCode}\n${order.billingInfo.country}`,
    orderUrl: `/orders/${order.uid}`,
    logo: "",
    shopName: order.shop.name,
    shopUrl: "",
  });

  return shipment;
}

/**
 * Get shipping rates for a cart
 */
export async function getShippingRatesForCart(
  shopId: number,
  cartUid: string,
  billingInfoUid: string,
  platformOverride?: ShippingPlatform,
) {
  // Get cart with all items
  const cart = await prisma.cart.findFirst({
    where: { uid: cartUid, shopId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: true,
    },
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  if (!cart.items || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Get billing info for delivery address
  const billingInfo = await prisma.billingInfo.findFirst({
    where: { uid: billingInfoUid, shopId },
  });

  if (!billingInfo) {
    throw new Error("Billing information not found");
  }

  // Get shop settings for origin address
  const shop = await prisma.shop.findFirst({
    where: { shopId },
    include: {
      Setting: true,
    },
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  // Validate shop address is configured
  const shopSettings = shop.Setting?.[0];
  if (
    !shopSettings?.shopStreet ||
    !shopSettings?.shopCity ||
    !shopSettings?.shopState ||
    !shopSettings?.shopPostalCode ||
    !shopSettings?.shopCountry
  ) {
    throw new Error(
      "Shop address is not configured. Please update shop settings with complete address before getting shipping rates.",
    );
  }

  // Get active shipping accounts
  let shippingAccounts;
  if (platformOverride) {
    const account = await prisma.shippingAccount.findFirst({
      where: { shopId, platform: platformOverride, isActive: true },
    });
    shippingAccounts = account ? [account] : [];
  } else {
    shippingAccounts = await prisma.shippingAccount.findMany({
      where: { shopId, isActive: true },
      orderBy: { isPreferred: "desc" },
    });
  }

  if (!shippingAccounts || shippingAccounts.length === 0) {
    throw new Error("No active shipping accounts found");
  }

  // Prepare addresses
  const toAddress: Address = {
    name: billingInfo.fullName,
    street: billingInfo.address,
    city: billingInfo.city,
    state: billingInfo.state,
    postalCode: billingInfo.postalCode,
    country: billingInfo.country,
    phone: billingInfo.phone,
    email: billingInfo.email,
  };

  // Use shop address from settings as origin address
  const fromAddress: Address = {
    name: shop.name,
    street: shopSettings.shopStreet!,
    city: shopSettings.shopCity!,
    state: shopSettings.shopState!,
    postalCode: shopSettings.shopPostalCode!,
    country: shopSettings.shopCountry!,
    phone: shopSettings.shopPhone || undefined,
  };

  // Prepare items
  const items: ShipmentItem[] = cart.items.map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
    value: Number(item.product.price),
  }));

  // Calculate total weight (if products have weight, otherwise default)
  const totalWeight = cart.items.reduce((sum, item) => {
    const productWeight = item.product.weight ? Number(item.product.weight) : 1;
    return sum + productWeight * item.quantity;
  }, 0);

  // Get rates from all active shipping accounts
  const allRates: Array<
    ShippingRate & { accountUid: string; platform: ShippingPlatform }
  > = [];

  for (const account of shippingAccounts) {
    try {
      // Decrypt API key
      const apiKey = decryptKey(account.encryptedApiKey, account.iv);

      // Get provider
      const provider = getShippingProvider(
        account.platform,
        apiKey,
        account.testMode,
      );

      // Get rates
      const rates = await provider.getRates({
        fromAddress,
        toAddress,
        weight: totalWeight || 1,
        weightUnit: "kg",
        items,
      });

      // Add account info to each rate
      rates.forEach((rate) => {
        allRates.push({
          ...rate,
          accountUid: account.uid,
          platform: account.platform,
        });
      });
    } catch (error: any) {
      console.error(
        `Failed to get rates from ${account.platform}:`,
        error.message,
      );
      // Continue with other providers even if one fails
    }
  }

  if (allRates.length === 0) {
    throw new Error("No shipping rates available");
  }

  // Sort rates by cost (cheapest first)
  allRates.sort((a, b) => a.cost - b.cost);

  return allRates;
}

/**
 * Update shipment status from tracking event
 */
export async function updateShipmentFromTracking(
  trackingNumber: string,
  eventData: {
    status: string;
    statusCode?: string;
    location?: string;
    description?: string;
    courierStatus?: string;
    timestamp: Date;
    rawPayload?: any;
  },
) {
  const shipment = await prisma.shipment.findFirst({
    where: { trackingNumber },
    include: {
      order: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!shipment) {
    throw new Error("Shipment not found");
  }

  // Map external status to internal status
  const newStatus = mapTrackingStatusToShipmentStatus(eventData.status);

  // Get counter
  const counter = await prisma.shopCounter.update({
    where: { shopId: shipment.shopId },
    data: { trackingEventCounter: { increment: 1 } },
  });

  // Create tracking event
  await prisma.trackingEvent.create({
    data: {
      shopScopedId: counter.trackingEventCounter,
      shipmentUid: shipment.uid,
      shopId: shipment.shopId,
      status: eventData.status,
      statusCode: eventData.statusCode,
      location: eventData.location,
      description: eventData.description,
      courierStatus: eventData.courierStatus,
      timestamp: eventData.timestamp,
      rawPayload: eventData.rawPayload,
    },
  });

  // Update shipment if status changed
  const updateData: any = {
    lastSyncedAt: new Date(),
  };

  if (newStatus && newStatus !== shipment.status) {
    updateData.status = newStatus;

    if (newStatus === "DELIVERED") {
      updateData.actualDeliveryDate = eventData.timestamp;
    }
  }

  await prisma.shipment.update({
    where: { id: shipment.id },
    data: updateData,
  });

  // Update order status based on shipment status
  if (newStatus) {
    const orderStatus = mapShipmentStatusToOrderStatus(newStatus);
    if (orderStatus && orderStatus !== shipment.order.status) {
      await prisma.order.update({
        where: { id: shipment.order.id },
        data: { status: orderStatus },
      });

      // Send appropriate email
      if (orderStatus === "IN_TRANSIT") {
        await sendUserEmail(
          shipment.shopId,
          shipment.order.user.email,
          "ORDER_IN_TRANSIT",
          {
            orderRef: shipment.order.orderRef,
            trackingNumber: shipment.trackingNumber || "",
            trackingUrl: shipment.trackingUrl,
            courierName: shipment.courierName || "Courier",
            currentLocation: eventData.location,
            estimatedDelivery:
              shipment.estimatedDeliveryDate?.toLocaleDateString(),
            orderUrl: `/orders/${shipment.order.uid}`,
            logo: "",
            shopName: "",
            shopUrl: "",
          },
        );
      } else if (orderStatus === "DELIVERED") {
        await sendUserEmail(
          shipment.shopId,
          shipment.order.user.email,
          "ORDER_DELIVERED_SHIPPING",
          {
            orderRef: shipment.order.orderRef,
            trackingNumber: shipment.trackingNumber || "",
            deliveryDate: eventData.timestamp.toLocaleDateString(),
            deliveryLocation: eventData.location,
            items: [],
            orderUrl: `/orders/${shipment.order.uid}`,
            logo: "",
            shopName: "",
            shopUrl: "",
          },
        );
      } else if (orderStatus === "FAILED_DELIVERY") {
        await sendUserEmail(
          shipment.shopId,
          shipment.order.user.email,
          "FAILED_DELIVERY",
          {
            orderRef: shipment.order.orderRef,
            trackingNumber: shipment.trackingNumber || "",
            failureReason: eventData.description || "Delivery attempt failed",
            courierName: shipment.courierName || "Courier",
            supportUrl: "/support",
            logo: "",
            shopName: "",
            shopUrl: "",
          },
        );
      }
    }
  }

  return shipment;
}

/**
 * Map tracking status to shipment status
 */
function mapTrackingStatusToShipmentStatus(
  trackingStatus: string,
): ShipmentStatus | null {
  const statusLower = trackingStatus.toLowerCase();

  if (statusLower.includes("delivered")) return "DELIVERED";
  if (
    statusLower.includes("out_for_delivery") ||
    statusLower.includes("out for delivery")
  )
    return "OUT_FOR_DELIVERY";
  if (statusLower.includes("in_transit") || statusLower.includes("in transit"))
    return "IN_TRANSIT";
  if (statusLower.includes("failed") || statusLower.includes("exception"))
    return "FAILED";
  if (statusLower.includes("returned")) return "RETURNED";
  if (statusLower.includes("canceled") || statusLower.includes("cancelled"))
    return "CANCELED";

  return null;
}

/**
 * Map shipment status to order status
 */
function mapShipmentStatusToOrderStatus(shipmentStatus: ShipmentStatus) {
  switch (shipmentStatus) {
    case "IN_TRANSIT":
      return "IN_TRANSIT";
    case "OUT_FOR_DELIVERY":
      return "IN_TRANSIT";
    case "DELIVERED":
      return "DELIVERED";
    case "FAILED":
      return "FAILED_DELIVERY";
    case "RETURNED":
      return "FAILED_DELIVERY";
    case "CANCELED":
      return "CANCELED";
    default:
      return null;
  }
}
