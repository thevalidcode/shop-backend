import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { ShippingPlatform, ShipmentStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

const shippingPlatformEnum = z.nativeEnum(ShippingPlatform);
const shipmentStatusEnum = z.nativeEnum(ShipmentStatus);

/**
 * Schema for connecting a shipping account
 */
export const ConnectShippingAccountSchema = z.object({
  platform: shippingPlatformEnum,
  apiKey: z.string().min(10, "API key must be at least 10 characters"),
  testMode: z.boolean().optional().default(true),
  isPreferred: z.boolean().optional().default(false),
  webhookSecret: z.string().optional(),
});

/**
 * Schema for updating shipping account
 */
export const UpdateShippingAccountSchema = z.object({
  isActive: z.boolean().optional(),
  isPreferred: z.boolean().optional(),
  testMode: z.boolean().optional(),
  apiKey: z.string().min(10).optional(),
  webhookSecret: z.string().optional(),
});

/**
 * Schema for shipping account UID parameter
 */
export const ShippingAccountUidSchema = z.object({
  accountUid: z.string().uuid("Invalid shipping account ID"),
});

/**
 * Alias for account UID parameter (for consistency with other routes)
 */
export const AccountUidSchema = z.object({
  accountUid: z.string().uuid("Invalid shipping account ID"),
});

/**
 * Schema for order UID parameter
 */
export const OrderUidParamSchema = z.object({
  orderUid: z.string().uuid("Invalid order ID"),
});

/**
 * Schema for testing shipping connection
 */
export const TestConnectionSchema = z.object({
  platform: shippingPlatformEnum,
  apiKey: z.string().min(10),
  testMode: z.boolean().optional().default(true),
});

/**
 * Schema for creating a shipment
 */
export const CreateShipmentSchema = z.object({
  orderUid: z.string().uuid("Invalid order ID"),
  weight: z.number().positive().optional(),
  weightUnit: z.enum(["KG", "LB", "G", "OZ"]).optional().default("KG"),
  courierCode: z.string().optional(),
  platformOverride: shippingPlatformEnum.optional(),
});

/**
 * Schema for shipment UID parameter
 */
export const ShipmentUidSchema = z.object({
  shipmentUid: z.string().uuid("Invalid shipment ID"),
});

/**
 * Schema for tracking number parameter
 */
export const TrackingNumberSchema = z.object({
  trackingNumber: z.string().min(5, "Invalid tracking number"),
});

/**
 * Schema for Sendbox webhook payload
 */
export const SendboxWebhookSchema = z.object({
  event: z.string(),
  tracking_number: z.string(),
  status: z.string(),
  courier: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  timestamp: z.string().optional(),
  shipment_id: z.string().optional(),
});

/**
 * Schema for Shippo webhook payload
 */
export const ShippoWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    tracking_number: z.string(),
    tracking_status: z.object({
      status: z.string(),
      status_details: z.string().optional(),
      location: z
        .object({
          city: z.string().optional(),
          state: z.string().optional(),
          country: z.string().optional(),
        })
        .optional(),
    }),
    carrier: z.string().optional(),
    eta: z.string().optional(),
  }),
});

/**
 * Schema for webhook signature verification
 */
export const WebhookSignatureSchema = z.object({
  signature: z.string(),
  timestamp: z.string().optional(),
});

/**
 * Schema for manual tracking update (admin)
 */
export const ManualTrackingUpdateSchema = z.object({
  status: shipmentStatusEnum,
  location: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  estimatedDeliveryDate: z.coerce.date().optional(),
});

/**
 * Schema for bulk shipment creation
 */
export const BulkCreateShipmentsSchema = z.object({
  orderUids: z.array(z.string().uuid()).min(1).max(100),
  weight: z.number().positive().optional(),
  weightUnit: z.enum(["KG", "LB", "G", "OZ"]).optional(),
  platformOverride: shippingPlatformEnum.optional(),
});

/**
 * Schema for shipment query filters
 */
export const ShipmentFiltersSchema = z.object({
  status: shipmentStatusEnum.optional(),
  platform: shippingPlatformEnum.optional(),
  trackingNumber: z.string().optional(),
  orderUid: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

/**
 * Public shipment schema (for users)
 */
export const ShipmentPublicSchema = z
  .object({
    uid: z.string(),
    orderUid: z.string(),
    platform: shippingPlatformEnum,
    courierName: z.string().nullable(),
    trackingNumber: z.string().nullable(),
    trackingUrl: z.string().nullable(),
    status: shipmentStatusEnum,
    estimatedDeliveryDate: z.string().datetime().nullable(),
    actualDeliveryDate: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict()
  .openapi("Shipment");

/**
 * Admin shipment schema (includes more details)
 */
export const ShipmentAdminSchema = ShipmentPublicSchema.extend({
  externalShipmentId: z.string().nullable(),
  courierCode: z.string().nullable(),
  labelUrl: z.string().nullable(),
  weight: z.number().nullable(),
  weightUnit: z.string().nullable(),
  shippingCost: z.number().nullable(),
  currency: z.string().nullable(),
  lastSyncedAt: z.string().datetime().nullable(),
}).openapi("ShipmentAdmin");

/**
 * Tracking event schema
 */
export const TrackingEventSchema = z
  .object({
    uid: z.string(),
    status: z.string(),
    statusCode: z.string().nullable(),
    location: z.string().nullable(),
    description: z.string().nullable(),
    timestamp: z.string().datetime(),
    createdAt: z.string().datetime(),
  })
  .strict()
  .openapi("TrackingEvent");

/**
 * Shipping account public schema
 */
export const ShippingAccountPublicSchema = z
  .object({
    uid: z.string(),
    platform: shippingPlatformEnum,
    isActive: z.boolean(),
    isPreferred: z.boolean(),
    testMode: z.boolean(),
    lastTestedAt: z.string().datetime().nullable(),
    lastTestStatus: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict()
  .openapi("ShippingAccount");


 export const querySchema = z.object({
    cartUid: z.string().uuid(),
    billingInfoUid: z.string().uuid(),
    platform: z.nativeEnum(ShippingPlatform).optional(),
  });