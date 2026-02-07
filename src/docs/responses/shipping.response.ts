import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

// Shipping Account Response (Admin view)
export const ShippingAccountResponseSchema = z.object({
  uid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
  shopScopedId: z.number().openapi({ example: 1 }),
  platform: z.enum(["SENDBOX", "SHIPPO"]).openapi({ example: "SENDBOX" }),
  testMode: z.boolean().openapi({ example: false }),
  isActive: z.boolean().openapi({ example: true }),
  isPreferred: z.boolean().openapi({ example: true }),
  lastTestedAt: z.string().nullable().openapi({ example: "2026-02-05T10:00:00.000Z" }),
  lastTestStatus: z.string().nullable().openapi({ example: "success" }),
  createdAt: z.string().openapi({ example: "2026-02-05T10:00:00.000Z" }),
  updatedAt: z.string().openapi({ example: "2026-02-05T10:00:00.000Z" }),
});

// Order info in Shipment Response
const OrderInfoInShipmentSchema = z.object({
  orderRef: z.string().openapi({ example: "ORD-2026-001" }),
  uid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440001" }),
  status: z.enum(["PENDING", "VERIFYING_PAYMENT", "PROCESSING", "SHIPPED", "IN_TRANSIT", "DELIVERED", "FAILED_DELIVERY", "CANCELED", "REFUNDED"]).openapi({ example: "IN_TRANSIT" }),
});

// Shipment Response (Admin view)
export const ShipmentAdminResponseSchema = z.object({
  uid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440002" }),
  shopScopedId: z.number().openapi({ example: 42 }),
  orderUid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440001" }),
  platform: z.enum(["SENDBOX", "SHIPPO"]).openapi({ example: "SENDBOX" }),
  externalShipmentId: z.string().nullable().openapi({ example: "SB-1234567890" }),
  courierName: z.string().nullable().openapi({ example: "DHL" }),
  courierCode: z.string().nullable().openapi({ example: "DHL" }),
  trackingNumber: z.string().nullable().openapi({ example: "TRACK1234567890" }),
  trackingUrl: z.string().nullable().openapi({ example: "https://sendbox.co/track/TRACK1234567890" }),
  labelUrl: z.string().nullable().openapi({ example: "https://sendbox.co/labels/label123.pdf" }),
  status: z.enum(["PENDING", "LABEL_CREATED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RETURNED", "CANCELED"]).openapi({ example: "IN_TRANSIT" }),
  estimatedDeliveryDate: z.string().nullable().openapi({ example: "2026-02-12T00:00:00.000Z" }),
  actualDeliveryDate: z.string().nullable().openapi({ example: null }),
  weight: z.number().nullable().openapi({ example: 2.5 }),
  weightUnit: z.string().nullable().openapi({ example: "kg" }),
  shippingCost: z.number().nullable().openapi({ example: 15.99 }),
  currency: z.string().nullable().openapi({ example: "USD" }),
  createdAt: z.string().openapi({ example: "2026-02-05T10:00:00.000Z" }),
  updatedAt: z.string().openapi({ example: "2026-02-05T14:30:00.000Z" }),
  order: OrderInfoInShipmentSchema.optional(),
});

// Shipment Response (Public/User view)
export const ShipmentPublicResponseSchema = z.object({
  uid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440002" }),
  shopScopedId: z.number().openapi({ example: 42 }),
  trackingNumber: z.string().nullable().openapi({ example: "TRACK1234567890" }),
  trackingUrl: z.string().nullable().openapi({ example: "https://sendbox.co/track/TRACK1234567890" }),
  courierName: z.string().nullable().openapi({ example: "DHL" }),
  status: z.enum(["PENDING", "LABEL_CREATED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RETURNED", "CANCELED"]).openapi({ example: "IN_TRANSIT" }),
  estimatedDeliveryDate: z.string().nullable().openapi({ example: "2026-02-12T00:00:00.000Z" }),
  actualDeliveryDate: z.string().nullable().openapi({ example: null }),
  createdAt: z.string().openapi({ example: "2026-02-05T10:00:00.000Z" }),
  updatedAt: z.string().openapi({ example: "2026-02-05T14:30:00.000Z" }),
});

// Tracking Event Response
export const TrackingEventResponseSchema = z.object({
  uid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440003" }),
  status: z.string().openapi({ example: "in_transit" }),
  location: z.string().nullable().openapi({ example: "Chicago, IL" }),
  description: z.string().nullable().openapi({ example: "Package arrived at sorting facility" }),
  timestamp: z.string().openapi({ example: "2026-02-05T14:30:00.000Z" }),
  createdAt: z.string().openapi({ example: "2026-02-05T14:31:00.000Z" }),
});

// Connect Account Response
export const ConnectAccountResponseSchema = z.object({
  message: z.string().openapi({ example: "Shipping account connected successfully" }),
  account: z.object({
    uid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    platform: z.enum(["SENDBOX", "SHIPPO"]).openapi({ example: "SENDBOX" }),
    testMode: z.boolean().openapi({ example: false }),
    isActive: z.boolean().openapi({ example: true }),
    isPreferred: z.boolean().openapi({ example: true }),
    createdAt: z.string().openapi({ example: "2026-02-05T10:00:00.000Z" }),
  }),
});

// Get Accounts Response
export const GetAccountsResponseSchema = z.object({
  accounts: z.array(ShippingAccountResponseSchema),
});

// Update Account Response
export const UpdateAccountResponseSchema = z.object({
  message: z.string().openapi({ example: "Shipping account updated successfully" }),
  account: ShippingAccountResponseSchema,
});

// Disconnect Account Response
export const DisconnectAccountResponseSchema = z.object({
  message: z.string().openapi({ example: "Shipping account disconnected successfully" }),
});

// Create Shipment Response
export const CreateShipmentResponseSchema = z.object({
  message: z.string().openapi({ example: "Shipment created successfully" }),
  shipment: z.object({
    uid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440002" }),
    orderUid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440001" }),
    trackingNumber: z.string().nullable().openapi({ example: "TRACK1234567890" }),
    trackingUrl: z.string().nullable().openapi({ example: "https://sendbox.co/track/TRACK1234567890" }),
    courierName: z.string().nullable().openapi({ example: "DHL" }),
    status: z.enum(["PENDING", "LABEL_CREATED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RETURNED", "CANCELED"]).openapi({ example: "LABEL_CREATED" }),
    estimatedDeliveryDate: z.string().nullable().openapi({ example: "2026-02-12T00:00:00.000Z" }),
    labelUrl: z.string().nullable().openapi({ example: "https://sendbox.co/labels/label123.pdf" }),
  }),
});

// Bulk Create Shipments Response
export const BulkCreateShipmentsResponseSchema = z.object({
  message: z.string().openapi({ example: "Created 2 shipments, 1 failed" }),
  results: z.array(z.object({
    orderUid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440001" }),
    success: z.literal(true),
    shipmentUid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440002" }),
    trackingNumber: z.string().nullable().openapi({ example: "TRACK1234567890" }),
  })),
  errors: z.array(z.object({
    orderUid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440003" }),
    success: z.literal(false),
    error: z.string().openapi({ example: "Shipment already exists for this order" }),
  })),
});

// Get Shipments Response (with pagination)
export const GetShipmentsResponseSchema = z.object({
  shipments: z.array(ShipmentAdminResponseSchema),
  pagination: z.object({
    page: z.number().openapi({ example: 1 }),
    limit: z.number().openapi({ example: 20 }),
    total: z.number().openapi({ example: 45 }),
    totalPages: z.number().openapi({ example: 3 }),
  }),
});

// Get Shipment Response (single)
export const GetShipmentResponseSchema = z.object({
  shipment: ShipmentPublicResponseSchema,
});

// Get Tracking Events Response
export const GetTrackingEventsResponseSchema = z.object({
  events: z.array(TrackingEventResponseSchema),
});

// Webhook Response
export const WebhookResponseSchema = z.object({
  message: z.string().openapi({ example: "Webhook processed successfully" }),
});

// Error Responses
export const ShippingErrorResponseSchema = z.object({
  error: z.string().openapi({
    example: "Shipping account not found",
  }),
});

export const ShippingValidationErrorResponseSchema = z.object({
  error: z.object({
    formErrors: z.array(z.string()),
    fieldErrors: z.record(z.array(z.string())),
  }),
});
