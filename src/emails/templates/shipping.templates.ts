import {
  Layout,
  TemplateResult,
  DEFAULT_EMAIL_COLORS,
} from "../components/EmailLayout";
import { StoreSettings } from "./interface";

export interface ShipmentCreatedVars {
  orderRef: string;
  trackingNumber: string;
  trackingUrl?: string;
  courierName: string;
  estimatedDelivery?: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  shippingAddress: string;
  orderUrl: string;
}

export interface OrderInTransitVars {
  orderRef: string;
  trackingNumber: string;
  trackingUrl?: string;
  courierName: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  orderUrl: string;
}

export interface OrderDeliveredShippingVars {
  orderRef: string;
  trackingNumber: string;
  deliveryDate: string;
  deliveryLocation?: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  orderUrl: string;
  reviewUrl?: string;
}

export interface FailedDeliveryVars {
  orderRef: string;
  trackingNumber: string;
  failureReason: string;
  courierName: string;
  nextAttemptDate?: string;
  supportUrl: string;
}

/**
 * Shipment Created Email Template (User)
 * Sent when a shipping label is created and tracking begins
 */
export const shipmentCreated = (
  vars: ShipmentCreatedVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const itemsHtml = vars.items
    .map(
      (item) => `
    <li style="padding:4px 0; font-size:14px; color:${c.mutedForeground};">${item.name} (×${item.quantity})</li>
  `,
    )
    .join("");

  const trackingButton = vars.trackingUrl
    ? `
    <a href="${vars.trackingUrl}" style="display:inline-block; background:${c.primary}; color:${c.primaryForeground}; padding:14px 32px; text-decoration:none; border-radius:6px; font-weight:600; margin:24px 0; font-size:16px;">
      Track Your Package
    </a>
  `
    : "";

  const estimatedDeliveryHtml = vars.estimatedDelivery
    ? `
    <div style="margin:24px 0; padding:16px; background:${c.muted}; border-radius:8px; border-left:4px solid ${c.primary};">
      <p style="margin:0; font-size:14px; color:${c.mutedForeground};">
        <strong style="color:${c.foreground};">Estimated Delivery:</strong> ${vars.estimatedDelivery}
      </p>
    </div>
  `
    : "";

  const result = Layout({
    subject: `📦 Your Order ${vars.orderRef} Has Shipped!`,
    children: `
    <h1 style="color:${c.foreground}; font-size:28px; font-weight:bold; margin:0 0 16px 0;">
      Your Order Has Shipped! 📦
    </h1>
    
    <p style="font-size:16px; line-height:1.6; color:${c.foreground}; margin:0 0 24px 0;">
      Great news! Your order <strong>${vars.orderRef}</strong> is on its way.
    </p>

    <div style="background:${c.card}; border:1px solid ${c.border}; border-radius:8px; padding:24px; margin:24px 0;">
      <h2 style="font-size:18px; font-weight:600; color:${c.foreground}; margin:0 0 16px 0;">
        Shipping Details
      </h2>
      
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0; font-size:14px; color:${c.mutedForeground}; width:40%;">Tracking Number:</td>
          <td style="padding:8px 0; font-size:14px; font-weight:600; color:${c.foreground};">${vars.trackingNumber}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; font-size:14px; color:${c.mutedForeground};">Courier:</td>
          <td style="padding:8px 0; font-size:14px; font-weight:600; color:${c.foreground};">${vars.courierName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; font-size:14px; color:${c.mutedForeground}; vertical-align:top;">Shipping To:</td>
          <td style="padding:8px 0; font-size:14px; color:${c.foreground};">${vars.shippingAddress.replace(/\n/g, "<br>")}</td>
        </tr>
      </table>
    </div>

    ${estimatedDeliveryHtml}

    <div style="margin:24px 0;">
      <h3 style="font-size:16px; font-weight:600; color:${c.foreground}; margin:0 0 12px 0;">Items in this shipment:</h3>
      <ul style="list-style:none; padding:0; margin:0;">
        ${itemsHtml}
      </ul>
    </div>

    <div style="text-align:center; margin:32px 0;">
      ${trackingButton}
    </div>

    <div style="margin:32px 0; padding:20px; background:${c.muted}; border-radius:8px;">
      <p style="font-size:14px; line-height:1.6; color:${c.mutedForeground}; margin:0;">
        <strong style="color:${c.foreground};">💡 Tip:</strong> Save your tracking number to monitor your package status. You can also track directly from your order page.
      </p>
    </div>

    <div style="text-align:center; margin:32px 0;">
      <a href="${vars.orderUrl}" style="color:${c.primary}; text-decoration:none; font-size:14px; font-weight:500;">
        View Order Details →
      </a>
    </div>
  `,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: shopSettings.designColors,
  });

  return result;
};

/**
 * Order In Transit Email Template (User)
 * Sent when package is confirmed to be in transit
 */
export const orderInTransit = (
  vars: OrderInTransitVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const locationHtml = vars.currentLocation
    ? `
    <div style="margin:24px 0; padding:16px; background:${c.muted}; border-radius:8px;">
      <p style="margin:0; font-size:14px; color:${c.mutedForeground};">
        <strong style="color:${c.foreground};">Current Location:</strong> ${vars.currentLocation}
      </p>
    </div>
  `
    : "";

  const estimatedHtml = vars.estimatedDelivery
    ? `
    <p style="font-size:16px; line-height:1.6; color:${c.foreground}; margin:16px 0;">
      Your package is expected to arrive by <strong>${vars.estimatedDelivery}</strong>.
    </p>
  `
    : "";

  const result = Layout({
    subject: `🚚 Your Order ${vars.orderRef} Is On The Way!`,
    children: `
    <h1 style="color:${c.foreground}; font-size:28px; font-weight:bold; margin:0 0 16px 0;">
      Your Package Is On The Way! 🚚
    </h1>
    
    <p style="font-size:16px; line-height:1.6; color:${c.foreground}; margin:0 0 24px 0;">
      Your order <strong>${vars.orderRef}</strong> is currently in transit with ${vars.courierName}.
    </p>

    ${estimatedHtml}
    ${locationHtml}

    <div style="background:${c.card}; border:1px solid ${c.border}; border-radius:8px; padding:24px; margin:24px 0; text-align:center;">
      <p style="font-size:14px; color:${c.mutedForeground}; margin:0 0 8px 0;">Tracking Number</p>
      <p style="font-size:20px; font-weight:700; color:${c.primary}; margin:0; letter-spacing:1px;">${vars.trackingNumber}</p>
    </div>

    ${
      vars.trackingUrl
        ? `
    <div style="text-align:center; margin:32px 0;">
      <a href="${vars.trackingUrl}" style="display:inline-block; background:${c.primary}; color:${c.primaryForeground}; padding:14px 32px; text-decoration:none; border-radius:6px; font-weight:600; font-size:16px;">
        Track Your Package
      </a>
    </div>
    `
        : ""
    }

    <div style="margin:32px 0; padding:20px; background:${c.muted}; border-radius:8px; text-align:center;">
      <p style="font-size:14px; line-height:1.6; color:${c.mutedForeground}; margin:0;">
        📍 Make sure someone is available to receive your package on the delivery date.
      </p>
    </div>

    <div style="text-align:center; margin:32px 0;">
      <a href="${vars.orderUrl}" style="color:${c.primary}; text-decoration:none; font-size:14px; font-weight:500;">
        View Order Details →
      </a>
    </div>
  `,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: shopSettings.designColors,
  });

  return result;
};

/**
 * Order Delivered (via Shipping) Email Template (User)
 * Sent when courier confirms delivery
 */
export const orderDeliveredShipping = (
  vars: OrderDeliveredShippingVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const itemsHtml = vars.items
    .map(
      (item) => `
    <li style="padding:4px 0; font-size:14px; color:${c.mutedForeground};">${item.name} (×${item.quantity})</li>
  `,
    )
    .join("");

  const locationHtml = vars.deliveryLocation
    ? `
    <p style="font-size:14px; color:${c.mutedForeground}; margin:8px 0 0 0;">
      Delivered to: ${vars.deliveryLocation}
    </p>
  `
    : "";

  const result = Layout({
    subject: `✅ Your Order ${vars.orderRef} Has Been Delivered!`,
    children: `
    <div style="text-align:center; margin:0 0 24px 0;">
      <div style="display:inline-block; background:${c.primary}; color:${c.primaryForeground}; width:64px; height:64px; border-radius:50%; line-height:64px; font-size:32px; margin:0 0 16px 0;">
        ✓
      </div>
    </div>

    <h1 style="color:${c.foreground}; font-size:28px; font-weight:bold; margin:0 0 16px 0; text-align:center;">
      Your Order Has Been Delivered! 🎉
    </h1>
    
    <p style="font-size:16px; line-height:1.6; color:${c.foreground}; margin:0 0 24px 0; text-align:center;">
      Your order <strong>${vars.orderRef}</strong> was delivered on ${vars.deliveryDate}.
    </p>

    ${locationHtml}

    <div style="background:${c.card}; border:1px solid ${c.border}; border-radius:8px; padding:24px; margin:32px 0;">
      <h2 style="font-size:18px; font-weight:600; color:${c.foreground}; margin:0 0 16px 0;">
        Delivered Items
      </h2>
      <ul style="list-style:none; padding:0; margin:0;">
        ${itemsHtml}
      </ul>
    </div>

    <div style="background:${c.muted}; border-radius:8px; padding:24px; margin:32px 0; text-align:center;">
      <p style="font-size:16px; line-height:1.6; color:${c.foreground}; margin:0 0 16px 0;">
        <strong>How was your experience?</strong>
      </p>
      <p style="font-size:14px; line-height:1.6; color:${c.mutedForeground}; margin:0 0 24px 0;">
        We'd love to hear your feedback!
      </p>
      ${
        vars.reviewUrl
          ? `
      <a href="${vars.reviewUrl}" style="display:inline-block; background:${c.primary}; color:${c.primaryForeground}; padding:12px 28px; text-decoration:none; border-radius:6px; font-weight:600; font-size:14px;">
        Leave a Review
      </a>
      `
          : ""
      }
    </div>

    <div style="margin:32px 0; padding:20px; background:${c.card}; border:1px solid ${c.border}; border-radius:8px;">
      <p style="font-size:14px; line-height:1.6; color:${c.mutedForeground}; margin:0;">
        <strong style="color:${c.foreground};">Need Help?</strong><br>
        If you have any issues with your order, please contact our support team. We're here to help!
      </p>
    </div>

    <div style="text-align:center; margin:32px 0;">
      <a href="${vars.orderUrl}" style="color:${c.primary}; text-decoration:none; font-size:14px; font-weight:500;">
        View Order Details →
      </a>
    </div>
  `,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: shopSettings.designColors,
  });

  return result;
};

/**
 * Failed Delivery Email Template (User)
 * Sent when delivery attempt fails
 */
export const failedDelivery = (
  vars: FailedDeliveryVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const nextAttemptHtml = vars.nextAttemptDate
    ? `
    <div style="margin:24px 0; padding:16px; background:${c.muted}; border-radius:8px; border-left:4px solid ${c.accent};">
      <p style="margin:0; font-size:14px; color:${c.mutedForeground};">
        <strong style="color:${c.foreground};">Next Delivery Attempt:</strong> ${vars.nextAttemptDate}
      </p>
    </div>
  `
    : "";

  const html = Layout({
    subject: `Delivery Attempt Failed - Order ${vars.orderRef}`,
    children: `
    <div style="text-align:center; margin:0 0 24px 0;">
      <div style="display:inline-block; background:${c.accent}; color:${c.accentForeground}; width:64px; height:64px; border-radius:50%; line-height:64px; font-size:32px; margin:0 0 16px 0;">
        ⚠
      </div>
    </div>

    <h1 style="color:${c.foreground}; font-size:28px; font-weight:bold; margin:0 0 16px 0; text-align:center;">
      Delivery Attempt Failed
    </h1>
    
    <p style="font-size:16px; line-height:1.6; color:${c.foreground}; margin:0 0 24px 0; text-align:center;">
      We were unable to deliver your order <strong>${vars.orderRef}</strong>.
    </p>

    <div style="background:${c.card}; border:1px solid ${c.border}; border-radius:8px; padding:24px; margin:24px 0;">
      <h2 style="font-size:18px; font-weight:600; color:${c.foreground}; margin:0 0 16px 0;">
        Delivery Details
      </h2>
      
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0; font-size:14px; color:${c.mutedForeground}; width:40%;">Tracking Number:</td>
          <td style="padding:8px 0; font-size:14px; font-weight:600; color:${c.foreground};">${vars.trackingNumber}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; font-size:14px; color:${c.mutedForeground};">Courier:</td>
          <td style="padding:8px 0; font-size:14px; font-weight:600; color:${c.foreground};">${vars.courierName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; font-size:14px; color:${c.mutedForeground}; vertical-align:top;">Reason:</td>
          <td style="padding:8px 0; font-size:14px; color:${c.accent}; font-weight:500;">${vars.failureReason}</td>
        </tr>
      </table>
    </div>

    ${nextAttemptHtml}

    <div style="margin:32px 0; padding:24px; background:${c.muted}; border-radius:8px;">
      <h3 style="font-size:16px; font-weight:600; color:${c.foreground}; margin:0 0 12px 0;">
        What Should I Do?
      </h3>
      <ul style="margin:0; padding-left:20px; font-size:14px; line-height:1.8; color:${c.mutedForeground};">
        <li>Make sure someone is available at the delivery address</li>
        <li>Check that your address details are correct</li>
        <li>Contact the courier directly if you need to arrange pickup</li>
        <li>Reach out to our support team if you need assistance</li>
      </ul>
    </div>

    <div style="text-align:center; margin:32px 0;">
      <a href="${vars.supportUrl}" style="display:inline-block; background:${c.primary}; color:${c.primaryForeground}; padding:14px 32px; text-decoration:none; border-radius:6px; font-weight:600; font-size:16px;">
        Contact Support
      </a>
    </div>

    <div style="margin:32px 0; padding:20px; background:${c.card}; border:1px solid ${c.border}; border-radius:8px;">
      <p style="font-size:14px; line-height:1.6; color:${c.mutedForeground}; margin:0; text-align:center;">
        We're here to help resolve this quickly. Our support team is standing by.
      </p>
    </div>
  `,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: shopSettings.designColors,
  });

  return html;
};
