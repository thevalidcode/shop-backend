import { Request, Response } from "express";
import {
  SendboxWebhookSchema,
  ShippoWebhookSchema,
} from "../schemas/shipping.schema";
import { updateShipmentFromTracking } from "../services/shipping.services";

/**
 * Sendbox webhook handler
 */
export async function handleSendboxWebhook(req: Request, res: Response) {
  try {
    // Parse webhook payload
    const bodyParsed = SendboxWebhookSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      console.error(
        "Invalid Sendbox webhook payload:",
        bodyParsed.error.flatten(),
      );
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    const {
      event,
      tracking_number,
      status,
      courier,
      location,
      timestamp,
      description,
    } = bodyParsed.data;

    // Process the webhook
    await updateShipmentFromTracking(tracking_number, {
      status,
      location,
      description,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      rawPayload: req.body,
    });

    res.json({ message: "Webhook processed successfully" });
  } catch (error: any) {
    console.error("Error processing Sendbox webhook:", error);
    // Return 200 to prevent retries for non-critical errors
    if (error.message === "Shipment not found") {
      return res
        .status(200)
        .json({ message: "Shipment not found, ignoring webhook" });
    }
    res.status(500).json({ error: "Failed to process webhook" });
  }
}

/**
 * Shippo webhook handler
 */
export async function handleShippoWebhook(req: Request, res: Response) {
  try {
    // Parse webhook payload
    const bodyParsed = ShippoWebhookSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      console.error(
        "Invalid Shippo webhook payload:",
        bodyParsed.error.flatten(),
      );
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    const { event, data } = bodyParsed.data;

    // Process tracking update events
    if (event === "track_updated" && data) {
      const trackingNumber = data.tracking_number;
      const trackingStatus = data.tracking_status;

      if (!trackingNumber || !trackingStatus) {
        return res.status(400).json({ error: "Missing tracking information" });
      }

      await updateShipmentFromTracking(trackingNumber, {
        status: trackingStatus.status,
        statusCode: trackingStatus.status_details,
        location: trackingStatus.location?.city,
        description: trackingStatus.status_details,
        timestamp: new Date(),
        rawPayload: req.body,
      });
    }

    res.json({ message: "Webhook processed successfully" });
  } catch (error: any) {
    console.error("Error processing Shippo webhook:", error);
    // Return 200 to prevent retries for non-critical errors
    if (error.message === "Shipment not found") {
      return res
        .status(200)
        .json({ message: "Shipment not found, ignoring webhook" });
    }
    res.status(500).json({ error: "Failed to process webhook" });
  }
}
