import crypto from "crypto";
import axios, { AxiosError } from "axios";
import {
  ShippingProvider,
  CreateShipmentParams,
  ShipmentResult,
  TrackingInfo,
  ConnectionTestResult,
  GetRatesParams,
  ShippingRate,
} from "../services/shipping.services";

/**
 * Sendbox Provider Implementation
 *
 * API Documentation: https://docs.sendbox.co
 * Base URLs:
 * - Staging: https://sandbox.staging.sendbox.co
 * - Production: https://live.sendbox.co
 *
 * Authentication: Bearer token in Authorization header
 */
export class SendboxProvider implements ShippingProvider {
  private baseUrl: string;
  private axiosInstance: any;

  constructor(
    private apiKey: string,
    private testMode: boolean,
  ) {
    this.baseUrl = testMode
      ? "https://sandbox.staging.sendbox.co"
      : "https://live.sendbox.co";

    // Create axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: this.apiKey,
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 seconds
    });
  }

  /**
   * Create a new shipment with Sendbox
   *
   * Endpoint: POST /shipping/shipments
   *
   * @param params Shipment parameters
   * @returns Shipment result with tracking info and full response data
   */
  async createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
    try {
      const requestBody = {
        origin: {
          name: params.fromAddress.name,
          phone: params.fromAddress.phone || "",
          email: params.fromAddress.email || "",
          street: params.fromAddress.street,
          city: params.fromAddress.city,
          state: params.fromAddress.state,
          country: params.fromAddress.country,
          post_code: params.fromAddress.postalCode || "",
        },
        destination: {
          name: params.toAddress.name,
          phone: params.toAddress.phone || "",
          email: params.toAddress.email || "",
          street: params.toAddress.street,
          city: params.toAddress.city,
          state: params.toAddress.state,
          country: params.toAddress.country,
          post_code: params.toAddress.postalCode || "",
        },
        weight: params.weight || 1.0,
        items: params.items.map((item) => ({
          name: item.name,
          description: item.name,
          quantity: item.quantity,
          value: item.value || 0,
          weight: (params.weight || 1.0) / params.items.length,
        })),
        incoming_option: "pickup", // or "dropoff"
        pickup_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next day
        total_value: params.items.reduce(
          (sum, item) => sum + (item.value || 0) * item.quantity,
          0,
        ),
        package_type: "general",
        channel_code: "api",
        service_code: "standard", // standard, nation-wide, international
        region: params.fromAddress.country || "NG",
      };

      const response = await this.axiosInstance.post(
        "/shipping/shipments",
        requestBody,
      );
      const data = response.data;

      // Map Sendbox response to ShipmentResult with generic fields
      return {
        externalShipmentId: data.id?.toString() || data.pk?.toString(),
        trackingNumber: data.code || data.tracking_code,
        trackingUrl:
          data.tracking_url || `https://sendbox.co/track/${data.code}`,
        labelUrl: data.package_label_image || undefined,
        courierName:
          data.selected_courier?.name || data.courier?.name || "Sendbox",
        courierCode: data.selected_courier?.code || params.courierCode,
        estimatedDelivery: data.package_delivery_eta
          ? new Date(data.package_delivery_eta)
          : undefined,
        shippingCost: data.fee || data.package_delivery_fee,
        currency: data.currency || "NGN",

        // Generic fee breakdown
        baseFee: data.base_fee,
        taxAmount: data.vat,
        insuranceFee: data.insurance_fee,

        // Store Sendbox-specific data in metadata
        metadata: {
          packageType: data.package_type?.code || data.package_type_code,
          serviceCode: data.service_code,
          incomingOption:
            data.incoming_option?.code || data.incoming_option_code,
          pickupDate: data.pickup_date,
          deliveryPriority:
            data.delivery_priority?.code || data.delivery_priority_code,
          totalValue: data.total_value,
          billableWeight: data.billable_weight,
          currentLocation: data.current_location,
          originCity: data.origin_city,
          destinationCity: data.destination_city,
          statusCode: data.status_code,
          status: data.status?.name || data.current_status?.name,
        },

        // Store raw response for debugging/future use
        rawResponse: data,
      };
    } catch (error: any) {
      console.error("Sendbox createShipment error:", error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorData: any = axiosError.response?.data || {};
        throw new Error(
          `Sendbox API error (${axiosError.response?.status || "UNKNOWN"}): ${
            errorData.message || errorData.description || axiosError.message
          }`,
        );
      }

      throw new Error(`Failed to create Sendbox shipment: ${error.message}`);
    }
  }

  /**
   * Get shipping rates from Sendbox
   *
   * Endpoint: POST /shipping/rates
   *
   * @param params Rate request parameters
   * @returns Array of available shipping rates
   */
  async getRates(params: GetRatesParams): Promise<ShippingRate[]> {
    try {
      const requestBody = {
        origin: {
          name: params.fromAddress.name,
          phone: params.fromAddress.phone || "",
          email: params.fromAddress.email || "",
          street: params.fromAddress.street,
          city: params.fromAddress.city,
          state: params.fromAddress.state,
          country: params.fromAddress.country,
          post_code: params.fromAddress.postalCode || "",
        },
        destination: {
          name: params.toAddress.name,
          phone: params.toAddress.phone || "",
          email: params.toAddress.email || "",
          street: params.toAddress.street,
          city: params.toAddress.city,
          state: params.toAddress.state,
          country: params.toAddress.country,
          post_code: params.toAddress.postalCode || "",
        },
        weight: params.weight || 1.0,
        items: params.items.map((item) => ({
          name: item.name,
          description: item.name,
          quantity: item.quantity,
          value: item.value || 0,
          weight: (params.weight || 1.0) / params.items.length,
        })),
        total_value: params.items.reduce(
          (sum, item) => sum + (item.value || 0) * item.quantity,
          0,
        ),
        package_type: "general",
      };

      const response = await this.axiosInstance.post(
        "/shipping/rates",
        requestBody,
      );
      const data = response.data;

      // Sendbox returns either an array of rates or a single rate object
      const ratesArray = Array.isArray(data) ? data : [data];

      const rates: ShippingRate[] = ratesArray.map((rate: any) => ({
        courierName: rate.courier?.name || rate.courier_name || "Sendbox",
        courierCode: rate.courier?.code || rate.courier_code,
        serviceName: rate.service?.name || rate.service_name || "Standard",
        serviceCode: rate.service?.code || rate.service_code || "standard",
        cost: rate.fee || rate.delivery_fee || 0,
        currency: rate.currency || "NGN",
        estimatedDays: rate.estimated_days,
        estimatedDelivery: rate.estimated_delivery_date
          ? new Date(rate.estimated_delivery_date)
          : undefined,

        // Fee breakdown
        baseFee: rate.base_fee,
        taxAmount: rate.vat,
        insuranceFee: rate.insurance_fee,

        // Provider-specific data
        metadata: {
          serviceCode: rate.service_code,
          packageType: rate.package_type,
          deliveryPriority: rate.delivery_priority,
          zone: rate.zone,
        },
        rateId: rate.id?.toString() || rate.rate_id,
      }));

      return rates;
    } catch (error: any) {
      console.error("Sendbox getRates error:", error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorData: any = axiosError.response?.data || {};
        throw new Error(
          `Sendbox API error (${axiosError.response?.status || "UNKNOWN"}): ${
            errorData.message || errorData.description || axiosError.message
          }`,
        );
      }

      throw new Error(`Failed to get Sendbox rates: ${error.message}`);
    }
  }

  /**
   * Get tracking information for a shipment
   *
   * Endpoint: GET /shipping/tracking?code={trackingNumber}
   *
   * Status codes from Sendbox:
   * - drafted: On hold (not paid)
   * - pending: Awaiting pickup
   * - pickup_started: Pickup in progress
   * - pickup_completed: Picked up
   * - in_delivery: Out for delivery
   * - in_transit: In transit
   * - delivered: Delivered
   *
   * @param trackingNumber Tracking number
   * @returns Tracking information with full event history
   */
  async getTrackingInfo(trackingNumber: string): Promise<TrackingInfo> {
    try {
      const response = await this.axiosInstance.get(`/shipping/tracking`, {
        params: { code: trackingNumber },
      });
      const data = response.data;

      // Map Sendbox status to our internal status
      const statusMapping: Record<string, string> = {
        drafted: "pending",
        pending: "pending",
        pickup_started: "in_transit",
        pickup_completed: "in_transit",
        in_delivery: "out_for_delivery",
        in_transit: "in_transit",
        delivered: "delivered",
      };

      const status = statusMapping[data.status_code] || "pending";

      // Build tracking events from status history if available
      const events: TrackingInfo["events"] = [];

      if (data.tracking_events && Array.isArray(data.tracking_events)) {
        events.push(
          ...data.tracking_events.map((event: any) => ({
            status: statusMapping[event.status_code] || event.status_code,
            location: event.location || data.current_location || "",
            description: event.description || event.message || "",
            timestamp: new Date(event.timestamp || event.date_created),
            courierStatus: event.status_code,
            rawPayload: event,
          })),
        );
      } else {
        // If no detailed events, create one from current status
        events.push({
          status,
          location: data.current_location || data.origin_city || "",
          description:
            data.current_status?.name ||
            data.status?.name ||
            "Shipment status updated",
          timestamp: new Date(
            data.last_updated || data.date_created || Date.now(),
          ),
          courierStatus: data.status_code,
          rawPayload: data,
        });
      }

      return {
        status,
        location: data.current_location || data.destination_city || "",
        timestamp: new Date(
          data.last_updated || data.date_created || Date.now(),
        ),
        events,

        // Store Sendbox-specific tracking data in metadata
        metadata: {
          currentLocation: data.current_location,
          originCity: data.origin_city,
          destinationCity: data.destination_city,
          courierName: data.courier?.name || data.selected_courier?.name,
          statusCode: data.status_code,
        },
        rawResponse: data,
      };
    } catch (error: any) {
      console.error("Sendbox getTrackingInfo error:", error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorData: any = axiosError.response?.data || {};
        throw new Error(
          `Sendbox API error (${axiosError.response?.status || "UNKNOWN"}): ${
            errorData.message || errorData.description || axiosError.message
          }`,
        );
      }

      throw new Error(`Failed to get Sendbox tracking info: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature from Sendbox
   *
   * Sendbox webhooks send tracking updates to the callback_url
   * For security, verify the webhook payload authenticity
   *
   * Note: Sendbox documentation doesn't specify signature verification method.
   * This is a placeholder implementation using HMAC-SHA256.
   * Update based on actual Sendbox webhook security requirements.
   *
   * @param payload Webhook payload
   * @param signature Signature from webhook header
   * @param secret Webhook secret
   * @returns True if signature is valid
   */
  verifyWebhookSignature(
    payload: any,
    signature: string,
    secret: string,
  ): boolean {
    try {
      // Create HMAC using SHA256
      const hmac = crypto.createHmac("sha256", secret);
      const payloadString =
        typeof payload === "string" ? payload : JSON.stringify(payload);
      hmac.update(payloadString);
      const calculatedSignature = hmac.digest("hex");

      // Timing-safe comparison to prevent timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(calculatedSignature),
      );
    } catch (error) {
      console.error("Sendbox webhook signature verification error:", error);
      return false;
    }
  }

  /**
   * Test API connection to Sendbox
   *
   * Endpoint: GET /shipping/shipments (list endpoint to verify auth)
   *
   * @param apiKey API key to test
   * @param testMode Whether to use test mode
   * @returns Connection test result
   */
  async testConnection(
    apiKey: string,
    testMode: boolean,
  ): Promise<ConnectionTestResult> {
    try {
      const baseUrl = testMode
        ? "https://sandbox.staging.sendbox.co"
        : "https://live.sendbox.co";

      // Create temporary axios instance for testing
      const testInstance = axios.create({
        baseURL: baseUrl,
        headers: {
          Authorization: apiKey,
        },
        timeout: 10000,
      });

      // Test connection by calling the shipments list endpoint
      await testInstance.get("/shipping/shipments");

      // Connection successful
      return {
        success: true,
        message: "Sendbox connection successful",
        details: {
          mode: testMode ? "sandbox" : "production",
          baseUrl,
        },
      };
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorData: any = axiosError.response?.data || {};

        if (
          axiosError.response?.status === 401 ||
          axiosError.response?.status === 403
        ) {
          return {
            success: false,
            message: "Invalid API key or insufficient permissions",
            details: {
              status: axiosError.response?.status,
              error:
                errorData.description ||
                errorData.message ||
                "Authentication failed",
            },
          };
        }

        return {
          success: false,
          message: `Connection failed: ${errorData.message || axiosError.message}`,
          details: { status: axiosError.response?.status },
        };
      }

      return {
        success: false,
        message: `Connection failed: ${error.message}`,
        details: { error: error.message },
      };
    }
  }
}
