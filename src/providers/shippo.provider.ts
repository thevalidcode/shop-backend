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
 * Shippo Provider Implementation
 *
 * API Documentation: https://goshippo.com/docs
 * Base URL: https://api.goshippo.com
 * API Version: 2018-02-08
 *
 * Authentication: ShippoToken in Authorization header
 */
export class ShippoProvider implements ShippingProvider {
  private baseUrl: string;
  private axiosInstance: any;

  constructor(
    private apiKey: string,
    private testMode: boolean,
  ) {
    // Shippo uses the same base URL for test and production
    // Test mode is controlled by the API key type (shippo_test_ vs shippo_live_)
    this.baseUrl = "https://api.goshippo.com";

    // Create axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `ShippoToken ${this.apiKey}`,
        "Content-Type": "application/json",
        "Shippo-API-Version": "2018-02-08",
      },
      timeout: 30000, // 30 seconds
    });
  }

  /**
   * Create a new shipment with Shippo
   *
   * Shippo requires a multi-step process:
   * 1. Create address objects (from and to)
   * 2. Create parcel object
   * 3. Create shipment (generates rates)
   * 4. Select rate and create transaction (purchases label)
   *
   * @param params Shipment parameters
   * @returns Shipment result with tracking info and full response data
   */
  async createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
    try {
      // Step 1: Create "from" address
      const fromAddressResponse = await this.axiosInstance.post("/addresses", {
        name: params.fromAddress.name,
        street1: params.fromAddress.street,
        city: params.fromAddress.city,
        state: params.fromAddress.state,
        zip: params.fromAddress.postalCode,
        country: params.fromAddress.country,
        phone: params.fromAddress.phone || "",
        email: params.fromAddress.email || "",
      });
      const fromAddress = fromAddressResponse.data;

      // Step 2: Create "to" address
      const toAddressResponse = await this.axiosInstance.post("/addresses", {
        name: params.toAddress.name,
        street1: params.toAddress.street,
        city: params.toAddress.city,
        state: params.toAddress.state,
        zip: params.toAddress.postalCode,
        country: params.toAddress.country,
        phone: params.toAddress.phone || "",
        email: params.toAddress.email || "",
      });
      const toAddress = toAddressResponse.data;

      // Step 3: Create parcel
      const parcelResponse = await this.axiosInstance.post("/parcels", {
        length: "5",
        width: "5",
        height: "5",
        distance_unit: "in",
        weight: params.weight || 1,
        mass_unit: params.weightUnit === "kg" ? "kg" : "lb",
      });
      const parcel = parcelResponse.data;

      // Step 4: Create shipment with addresses and parcel
      const shipmentResponse = await this.axiosInstance.post("/shipments", {
        address_from: fromAddress.object_id,
        address_to: toAddress.object_id,
        parcels: [parcel.object_id],
        async: false, // Wait for rates to be generated
      });
      const shipment = shipmentResponse.data;

      // Step 5: Select rate (use specified courier or cheapest rate)
      let selectedRate;
      if (params.courierCode) {
        selectedRate = shipment.rates?.find(
          (r: any) =>
            r.provider.toLowerCase() === params.courierCode?.toLowerCase(),
        );
      }

      // Fallback to cheapest rate if no specific courier or courier not found
      if (!selectedRate && shipment.rates && shipment.rates.length > 0) {
        selectedRate = shipment.rates.reduce((cheapest: any, current: any) =>
          parseFloat(current.amount) < parseFloat(cheapest.amount)
            ? current
            : cheapest,
        );
      }

      if (!selectedRate) {
        throw new Error("No shipping rates available for this shipment");
      }

      // Step 6: Create transaction (purchase label)
      const transactionResponse = await this.axiosInstance.post(
        "/transactions",
        {
          rate: selectedRate.object_id,
          label_file_type: "PDF",
          async: false, // Wait for label generation
        },
      );
      const transaction = transactionResponse.data;

      // Map Shippo response to ShipmentResult with generic fields
      // Store tracking number with carrier prefix for easier tracking lookups
      const carrierCode = selectedRate.provider.toLowerCase();
      const trackingWithCarrier = `${carrierCode}:${transaction.tracking_number}`;

      return {
        externalShipmentId: shipment.object_id,
        trackingNumber: trackingWithCarrier, // Format: "carrier:tracking" (e.g., "fedex:123456")
        trackingUrl: transaction.tracking_url_provider,
        labelUrl: transaction.label_url,
        courierName: selectedRate.provider_image_75 || selectedRate.provider,
        courierCode: selectedRate.provider,
        estimatedDelivery: selectedRate.estimated_days
          ? new Date(
              Date.now() + selectedRate.estimated_days * 24 * 60 * 60 * 1000,
            )
          : undefined,
        shippingCost: parseFloat(selectedRate.amount),
        currency: selectedRate.currency,

        // Generic fee breakdown
        baseFee: parseFloat(selectedRate.amount),
        taxAmount: undefined, // Shippo includes tax in total amount
        insuranceFee: selectedRate.insurance_amount
          ? parseFloat(selectedRate.insurance_amount)
          : undefined,

        // Store Shippo-specific data in metadata
        metadata: {
          rateId: selectedRate.object_id,
          transactionId: transaction.object_id,
          servicelevel: selectedRate.servicelevel,
          estimatedDays: selectedRate.estimated_days,
          durationTerms: selectedRate.duration_terms,
          carrierAccount: selectedRate.carrier_account,
          zone: selectedRate.zone,
          messages: transaction.messages,
          status: transaction.status,
          addressFrom: fromAddress.object_id,
          addressTo: toAddress.object_id,
          parcel: parcel.object_id,
          carrierCode: carrierCode, // Normalized carrier code
          rawTrackingNumber: transaction.tracking_number, // Original tracking without prefix
        },

        // Store raw response for debugging/future use
        rawResponse: {
          shipment,
          transaction,
          selectedRate,
        },
      };
    } catch (error: any) {
      console.error("Shippo createShipment error:", error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorData: any = axiosError.response?.data || {};
        throw new Error(
          `Shippo API error (${axiosError.response?.status || "UNKNOWN"}): ${
            errorData.detail || errorData.message || axiosError.message
          }`,
        );
      }

      throw new Error(`Failed to create Shippo shipment: ${error.message}`);
    }
  }

  /**
   * Get shipping rates from Shippo
   *
   * Endpoint: POST /shipments
   *
   * Creates a shipment object to get available rates without purchasing a label
   *
   * @param params Rate request parameters
   * @returns Array of available shipping rates
   */
  async getRates(params: GetRatesParams): Promise<ShippingRate[]> {
    try {
      // Step 1: Create "from" address
      const fromAddressResponse = await this.axiosInstance.post("/addresses", {
        name: params.fromAddress.name,
        street1: params.fromAddress.street,
        city: params.fromAddress.city,
        state: params.fromAddress.state,
        zip: params.fromAddress.postalCode,
        country: params.fromAddress.country,
        phone: params.fromAddress.phone || "",
        email: params.fromAddress.email || "",
      });
      const fromAddress = fromAddressResponse.data;

      // Step 2: Create "to" address
      const toAddressResponse = await this.axiosInstance.post("/addresses", {
        name: params.toAddress.name,
        street1: params.toAddress.street,
        city: params.toAddress.city,
        state: params.toAddress.state,
        zip: params.toAddress.postalCode,
        country: params.toAddress.country,
        phone: params.toAddress.phone || "",
        email: params.toAddress.email || "",
      });
      const toAddress = toAddressResponse.data;

      // Step 3: Create parcel
      const parcelResponse = await this.axiosInstance.post("/parcels", {
        length: "5",
        width: "5",
        height: "5",
        distance_unit: "in",
        weight: params.weight || 1,
        mass_unit: params.weightUnit === "kg" ? "kg" : "lb",
      });
      const parcel = parcelResponse.data;

      // Step 4: Create shipment with addresses and parcel (async=false to get rates immediately)
      const shipmentResponse = await this.axiosInstance.post("/shipments", {
        address_from: fromAddress.object_id,
        address_to: toAddress.object_id,
        parcels: [parcel.object_id],
        async: false,
      });
      const shipment = shipmentResponse.data;

      // Step 5: Map rates to ShippingRate format
      if (!shipment.rates || shipment.rates.length === 0) {
        throw new Error("No rates available for this shipment");
      }

      const rates: ShippingRate[] = shipment.rates.map((rate: any) => ({
        courierName: rate.provider_image_75 || rate.provider,
        courierCode: rate.provider,
        serviceName: rate.servicelevel?.name || rate.servicelevel || "Standard",
        serviceCode: rate.servicelevel?.token || rate.servicelevel,
        cost: parseFloat(rate.amount),
        currency: rate.currency,
        estimatedDays: rate.estimated_days,
        estimatedDelivery: rate.estimated_days
          ? new Date(Date.now() + rate.estimated_days * 24 * 60 * 60 * 1000)
          : undefined,

        // Fee breakdown
        baseFee: parseFloat(rate.amount),
        taxAmount: undefined,
        insuranceFee: rate.insurance_amount
          ? parseFloat(rate.insurance_amount)
          : undefined,

        // Provider-specific data
        metadata: {
          servicelevel: rate.servicelevel,
          durationTerms: rate.duration_terms,
          carrierAccount: rate.carrier_account,
          zone: rate.zone,
          attributes: rate.attributes,
          messages: rate.messages,
        },
        rateId: rate.object_id,
      }));

      // Sort by cost (cheapest first)
      rates.sort((a, b) => a.cost - b.cost);

      return rates;
    } catch (error: any) {
      console.error("Shippo getRates error:", error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorData: any = axiosError.response?.data || {};
        throw new Error(
          `Shippo API error (${axiosError.response?.status || "UNKNOWN"}): ${
            errorData.detail || errorData.message || axiosError.message
          }`,
        );
      }

      throw new Error(`Failed to get Shippo rates: ${error.message}`);
    }
  }

  /**
   * Get tracking information for a shipment
   *
   * Endpoint: GET /tracks/{Carrier}/{TrackingNumber}
   *
   * Note: Shippo requires the carrier name for tracking
   * If carrier is not stored in metadata, will try common carriers
   *
   * @param trackingNumber Tracking number (can include carrier as prefix: "carrier:tracking")
   * @returns Tracking information with full event history
   */
  async getTrackingInfo(trackingNumber: string): Promise<TrackingInfo> {
    try {
      // Check if carrier is prefixed (e.g., "fedex:1234567890")
      let carrier: string | undefined;
      let actualTrackingNumber = trackingNumber;

      if (trackingNumber.includes(":")) {
        const parts = trackingNumber.split(":");
        carrier = parts[0];
        actualTrackingNumber = parts[1];
      }

      // If carrier not provided, try common carriers
      const carriersToTry = carrier
        ? [carrier]
        : ["fedex", "usps", "ups", "dhl"];

      let trackingData: any = null;
      let lastError: any = null;

      for (const carrierName of carriersToTry) {
        try {
          const response = await this.axiosInstance.get(
            `/tracks/${carrierName}/${actualTrackingNumber}`,
          );
          trackingData = response.data;
          break; // Success, exit loop
        } catch (error: any) {
          lastError = error;
          if (carrier) {
            // If specific carrier was requested and failed, throw error
            throw error;
          }
          // Otherwise, try next carrier
          continue;
        }
      }

      if (!trackingData) {
        throw (
          lastError || new Error("Unable to track package with any carrier")
        );
      }

      // Map Shippo tracking status to our internal status
      const statusMapping: Record<string, string> = {
        UNKNOWN: "pending",
        PRE_TRANSIT: "pending",
        TRANSIT: "in_transit",
        DELIVERED: "delivered",
        RETURNED: "returned",
        FAILURE: "failed",
      };

      const status = trackingData.tracking_status?.status
        ? statusMapping[trackingData.tracking_status.status] || "in_transit"
        : "pending";

      // Build tracking events from history
      const events =
        trackingData.tracking_history?.map((event: any) => ({
          status: statusMapping[event.status] || event.status,
          location: event.location?.city
            ? `${event.location.city}, ${event.location.state || event.location.country}`
            : undefined,
          description: event.status_details || event.status,
          timestamp: new Date(event.status_date),
          courierStatus: event.status,
          rawPayload: event,
        })) || [];

      return {
        status,
        location: trackingData.tracking_status?.location?.city
          ? `${trackingData.tracking_status.location.city}, ${trackingData.tracking_status.location.state || trackingData.tracking_status.location.country}`
          : undefined,
        timestamp: new Date(
          trackingData.tracking_status?.status_date || Date.now(),
        ),
        events,

        // Store Shippo-specific tracking data in metadata
        metadata: {
          carrier: trackingData.carrier,
          trackingNumber: trackingData.tracking_number,
          addressFrom: trackingData.address_from,
          addressTo: trackingData.address_to,
          eta: trackingData.eta,
          originalEta: trackingData.original_eta,
          servicelevel: trackingData.servicelevel,
          messages: trackingData.messages,
        },
        rawResponse: trackingData,
      };
    } catch (error: any) {
      console.error("Shippo getTrackingInfo error:", error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorData: any = axiosError.response?.data || {};
        throw new Error(
          `Shippo API error (${axiosError.response?.status || "UNKNOWN"}): ${
            errorData.detail || errorData.message || axiosError.message
          }`,
        );
      }

      throw new Error(`Failed to get Shippo tracking info: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature from Shippo
   *
   * Shippo webhooks send tracking updates and other events
   * Signature verification uses HMAC-SHA256
   *
   * @param payload Webhook payload (as string)
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
      console.error("Shippo webhook signature verification error:", error);
      return false;
    }
  }

  /**
   * Test API connection to Shippo
   *
   * Endpoint: GET /addresses (list endpoint to verify auth)
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
      // Create temporary axios instance for testing
      const testInstance = axios.create({
        baseURL: this.baseUrl,
        headers: {
          Authorization: `ShippoToken ${apiKey}`,
          "Shippo-API-Version": "2018-02-08",
        },
        timeout: 10000,
      });

      // Test connection by calling the addresses list endpoint with limit
      await testInstance.get("/addresses", {
        params: { results: 1 },
      });

      // Detect mode from API key prefix
      const detectedMode = apiKey.startsWith("shippo_test_") ? "test" : "live";

      // Connection successful
      return {
        success: true,
        message: "Shippo connection successful",
        details: {
          mode: detectedMode,
          apiVersion: "2018-02-08",
          baseUrl: this.baseUrl,
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
                errorData.detail ||
                errorData.message ||
                "Authentication failed",
            },
          };
        }

        return {
          success: false,
          message: `Connection failed: ${errorData.detail || errorData.message || axiosError.message}`,
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
