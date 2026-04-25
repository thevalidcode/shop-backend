import axios from "axios";
import https from "https";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/db.config";
import { decryptKey } from "../utils/encrypt";
import { Prisma } from "../../prisma/generated";
import type { OrderStatus, ShipmentStatus } from "../../prisma/generated";

const agent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

function normalizeApiUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/^https?:\/\//, "");
  return trimmed.replace(/\/$/, "");
}

function toSourceShopUid(apiUrl: string): string {
  const normalized = normalizeApiUrl(apiUrl);

  // Remove "api." if present
  const noApi = normalized.replace(/^api\./, "");

  // Extract only the domain (before first "/")
  const domain = noApi.split("/")[0];

  return domain;
}

function parseDateValue(value: unknown): Date | null {
  if (!value) return null;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function mapExternalStatusToOrderStatus(
  status: unknown,
  fallback: OrderStatus,
): OrderStatus {
  if (!status) return fallback;

  const value = String(status).toLowerCase().trim();

  if (value === "pending" || value === "awaiting_payment") return "PENDING";
  if (
    value === "processing" ||
    value === "in progress" ||
    value === "inprogress"
  ) {
    return "PROCESSING";
  }
  if (value === "shipped") return "SHIPPED";
  if (
    value === "in_transit" ||
    value === "in transit" ||
    value === "out_for_delivery" ||
    value === "out for delivery"
  ) {
    return "IN_TRANSIT";
  }
  if (value === "delivered" || value === "completed") return "DELIVERED";
  if (
    value === "failed" ||
    value === "failed_delivery" ||
    value === "undelivered"
  ) {
    return "FAILED_DELIVERY";
  }
  if (value === "canceled" || value === "cancelled") return "CANCELED";
  if (value === "refunded") return "REFUNDED";

  return fallback;
}

function mapOrderStatusToShipmentStatus(
  status: OrderStatus,
): ShipmentStatus | null {
  switch (status) {
    case "SHIPPED":
      return "LABEL_CREATED";
    case "IN_TRANSIT":
      return "IN_TRANSIT";
    case "DELIVERED":
      return "DELIVERED";
    case "FAILED_DELIVERY":
      return "FAILED";
    case "CANCELED":
      return "CANCELED";
    default:
      return null;
  }
}

type SyncEvent = {
  status: string;
  statusCode?: string;
  location?: string;
  description?: string;
  courierStatus?: string;
  timestamp: Date;
  rawPayload?: unknown;
};

type SupplierOrderSnapshot = {
  status: OrderStatus;
  trackingNumber: string | null;
  trackingUrl: string | null;
  estimatedDelivery: Date | null;
  deliveredAt: Date | null;
  courierName: string | null;
  courierCode: string | null;
  events: SyncEvent[];
  rawPayload: unknown;
};

async function getSupplierSnapshotFromInternalSource(
  supplierApiUrl: string,
  supplierOrderUid: string,
): Promise<SupplierOrderSnapshot> {
  const sourceShopUid = toSourceShopUid(supplierApiUrl);
  const sourceShop = await prisma.shop.findFirst({
    where: { uid: sourceShopUid },
    select: { shopId: true },
  });

  if (!sourceShop) {
    throw new Error("SOURCE_STORE_NOT_FOUND");
  }

  const sourceOrder = await prisma.order.findFirst({
    where: {
      uid: supplierOrderUid,
      shopId: sourceShop.shopId,
    },
    include: {
      shipment: {
        include: {
          trackingEvents: {
            orderBy: { timestamp: "asc" },
          },
        },
      },
    },
  });

  if (!sourceOrder) {
    throw new Error("SOURCE_ORDER_NOT_FOUND");
  }

  return {
    status: sourceOrder.status,
    trackingNumber:
      sourceOrder.trackingNumber ||
      sourceOrder.shipment?.trackingNumber ||
      null,
    trackingUrl: sourceOrder.shipment?.trackingUrl || null,
    estimatedDelivery:
      sourceOrder.estimatedDelivery ||
      sourceOrder.shipment?.estimatedDeliveryDate ||
      null,
    deliveredAt:
      sourceOrder.deliveredAt ||
      sourceOrder.shipment?.actualDeliveryDate ||
      null,
    courierName: sourceOrder.shipment?.courierName || null,
    courierCode: sourceOrder.shipment?.courierCode || null,
    events:
      sourceOrder.shipment?.trackingEvents.map((event) => ({
        status: event.status,
        statusCode: event.statusCode || undefined,
        location: event.location || undefined,
        description: event.description || undefined,
        courierStatus: event.courierStatus || undefined,
        timestamp: event.timestamp,
        rawPayload: event.rawPayload,
      })) || [],
    rawPayload: sourceOrder,
  };
}

async function getSupplierSnapshotFromExternalSource(
  supplierApiUrl: string,
  supplierApiKey: unknown,
  supplierOrderUid: string,
  currentStatus: OrderStatus,
): Promise<SupplierOrderSnapshot> {
  if (!supplierApiKey || typeof supplierApiKey !== "object") {
    throw new Error("SUPPLIER_API_KEY_REQUIRED");
  }

  const apiKeyData = supplierApiKey as { encrypted_key: string; iv: string };
  const decryptedKey = decryptKey(apiKeyData.encrypted_key, apiKeyData.iv);

  const { data } = await axios.post(
    `https://${normalizeApiUrl(supplierApiUrl)}`,
    {
      action: "status",
      key: decryptedKey,
      order: supplierOrderUid,
    },
    { httpsAgent: agent },
  );

  const payload = (data?.data ?? data) as Record<string, unknown>;

  const fallbackNow = new Date();
  const eventsPayload = Array.isArray(payload.events)
    ? payload.events
    : Array.isArray(payload.trackingEvents)
      ? payload.trackingEvents
      : [];

  const events: SyncEvent[] = eventsPayload
    .map((rawEvent) => {
      const event = rawEvent as Record<string, unknown>;
      const timestamp =
        parseDateValue(event.timestamp ?? event.time ?? event.createdAt) ||
        fallbackNow;

      return {
        status: String(event.status ?? event.state ?? "IN_TRANSIT"),
        statusCode: event.statusCode ? String(event.statusCode) : undefined,
        location: event.location ? String(event.location) : undefined,
        description: event.description ? String(event.description) : undefined,
        courierStatus: event.courierStatus
          ? String(event.courierStatus)
          : undefined,
        timestamp,
        rawPayload: event,
      };
    })
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const mappedStatus = mapExternalStatusToOrderStatus(
    payload.status,
    currentStatus,
  );

  return {
    status: mappedStatus,
    trackingNumber: payload.trackingNumber
      ? String(payload.trackingNumber)
      : payload.tracking_number
        ? String(payload.tracking_number)
        : null,
    trackingUrl: payload.trackingUrl
      ? String(payload.trackingUrl)
      : payload.tracking_url
        ? String(payload.tracking_url)
        : null,
    estimatedDelivery: parseDateValue(
      payload.estimatedDelivery ?? payload.estimated_delivery,
    ),
    deliveredAt: parseDateValue(payload.deliveredAt ?? payload.delivered_at),
    courierName: payload.courierName
      ? String(payload.courierName)
      : payload.courier
        ? String(payload.courier)
        : null,
    courierCode: payload.courierCode
      ? String(payload.courierCode)
      : payload.courier_code
        ? String(payload.courier_code)
        : null,
    events,
    rawPayload: payload,
  };
}

async function syncShipmentDataFromSnapshot(input: {
  shopId: number;
  orderUid: string;
  orderStatus: OrderStatus;
  snapshot: SupplierOrderSnapshot;
}) {
  const shipment = await prisma.shipment.findFirst({
    where: { shopId: input.shopId, orderUid: input.orderUid },
    select: {
      id: true,
      uid: true,
      status: true,
      trackingNumber: true,
    },
  });

  if (!shipment) {
    return;
  }

  const mappedShipmentStatus = mapOrderStatusToShipmentStatus(
    input.orderStatus,
  );
  const shouldUpdateDeliveryDate =
    mappedShipmentStatus === "DELIVERED" && input.snapshot.deliveredAt;

  await prisma.shipment.update({
    where: { id: shipment.id },
    data: {
      ...(mappedShipmentStatus ? { status: mappedShipmentStatus } : {}),
      ...(input.snapshot.trackingNumber
        ? { trackingNumber: input.snapshot.trackingNumber }
        : {}),
      ...(input.snapshot.trackingUrl
        ? { trackingUrl: input.snapshot.trackingUrl }
        : {}),
      ...(input.snapshot.estimatedDelivery
        ? { estimatedDeliveryDate: input.snapshot.estimatedDelivery }
        : {}),
      ...(shouldUpdateDeliveryDate
        ? { actualDeliveryDate: input.snapshot.deliveredAt }
        : {}),
      ...(input.snapshot.courierName
        ? { courierName: input.snapshot.courierName }
        : {}),
      ...(input.snapshot.courierCode
        ? { courierCode: input.snapshot.courierCode }
        : {}),
      rawResponse: input.snapshot.rawPayload as Prisma.InputJsonValue,
      lastSyncedAt: new Date(),
    },
  });

  for (const event of input.snapshot.events) {
    const existingEvent = await prisma.trackingEvent.findFirst({
      where: {
        shipmentUid: shipment.uid,
        shopId: input.shopId,
        status: event.status,
        timestamp: event.timestamp,
      },
      select: { id: true },
    });

    if (existingEvent) {
      continue;
    }

    const counter = await prisma.shopCounter.update({
      where: { shopId: input.shopId },
      data: { trackingEventCounter: { increment: 1 } },
      select: { trackingEventCounter: true },
    });

    await prisma.trackingEvent.create({
      data: {
        uid: uuidv4(),
        shopScopedId: counter.trackingEventCounter,
        shipmentUid: shipment.uid,
        shopId: input.shopId,
        status: event.status,
        statusCode: event.statusCode,
        location: event.location,
        description: event.description,
        courierStatus: event.courierStatus,
        timestamp: event.timestamp,
        rawPayload: (event.rawPayload ||
          Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    });
  }
}

export async function refreshSupplierOrderStatus(
  shopId: number,
  orderUid: string,
) {
  const order = await prisma.order.findFirst({
    where: { uid: orderUid, shopId },
    include: {
      items: {
        include: {
          product: {
            select: { supplierUid: true },
          },
        },
      },
    },
  });

  if (!order || !order.supplierOrderUid || !order.syncWithSupplier) {
    return null;
  }

  const supplierUids = Array.from(
    new Set(
      order.items
        .map((item) => item.product.supplierUid)
        .filter((supplierUid): supplierUid is string => Boolean(supplierUid)),
    ),
  );

  if (!supplierUids.length) {
    throw new Error("SUPPLIER_NOT_FOUND");
  }

  const supplier = await prisma.supplier.findFirst({
    where: {
      uid: supplierUids[0],
      shopId,
    },
    select: {
      uid: true,
      isInternal: true,
      apiUrl: true,
      apiKey: true,
    },
  });

  if (!supplier) {
    throw new Error("SUPPLIER_NOT_FOUND");
  }

  const snapshot = supplier.isInternal
    ? await getSupplierSnapshotFromInternalSource(
        supplier.apiUrl,
        order.supplierOrderUid,
      )
    : await getSupplierSnapshotFromExternalSource(
        supplier.apiUrl,
        supplier.apiKey,
        order.supplierOrderUid,
        order.status,
      );

  const nextStatus = snapshot.status;
  const nextDeliveredAt =
    nextStatus === "DELIVERED"
      ? snapshot.deliveredAt || order.deliveredAt || new Date()
      : null;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: nextStatus,
      ...(snapshot.trackingNumber
        ? { trackingNumber: snapshot.trackingNumber }
        : {}),
      ...(snapshot.estimatedDelivery
        ? { estimatedDelivery: snapshot.estimatedDelivery }
        : {}),
      ...(nextDeliveredAt ? { deliveredAt: nextDeliveredAt } : {}),
    },
  });

  await syncShipmentDataFromSnapshot({
    shopId,
    orderUid: order.uid,
    orderStatus: nextStatus,
    snapshot,
  });

  return {
    uid: order.uid,
    supplierUid: supplier.uid,
    supplierisInternal: supplier.isInternal,
    supplierOrderUid: order.supplierOrderUid,
    status: nextStatus,
    trackingNumber: snapshot.trackingNumber,
    syncedAt: new Date().toISOString(),
  };
}

export async function updateExistingSupplierOrders(): Promise<void> {
  const orders = await prisma.order.findMany({
    where: {
      supplierOrderUid: { not: null },
      syncWithSupplier: true,
      status: { notIn: ["CANCELED", "REFUNDED"] },
    },
    select: {
      uid: true,
      shopId: true,
    },
  });

  for (const order of orders) {
    try {
      await refreshSupplierOrderStatus(order.shopId, order.uid);
    } catch (error) {
      console.error("Error syncing supplier order status:", error);
    }
  }
}

export async function syncAllSupplierOrders(): Promise<void> {
  await updateExistingSupplierOrders();
}
