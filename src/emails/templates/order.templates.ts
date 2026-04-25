import {
  Layout,
  TemplateResult,
  DEFAULT_EMAIL_COLORS,
} from "../components/EmailLayout";
import { StoreSettings } from "./interface";

export interface OrderConfirmedVars {
  orderRef: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  shippingName: string;
  shippingAddress: string;
  orderUrl: string;
}

export interface OrderShippedVars {
  orderRef: string;
  trackingNumber: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  orderUrl: string;
}

export interface OrderDeliveredVars {
  orderRef: string;
  deliveryDate: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  orderUrl: string;
}

export interface OrderCanceledVars {
  orderRef: string;
  cancellationReason?: string;
  refundAmount: number;
  currency: string;
  refundETA?: string;
}

export interface OrderRefundedVars {
  orderRef: string;
  refundAmount: number;
  currency: string;
  refundMethod: string;
  refundDate: string;
}

export interface NewOrderNotificationVars {
  orderRef: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  adminDashboardUrl: string;
}

export interface OrderCanceledAdminVars {
  orderRef: string;
  customerName: string;
  customerEmail: string;
  canceledAt: string;
  refundAmount: number;
  currency: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  adminDashboardUrl: string;
}

export interface RefundRequestedAdminVars {
  orderRef: string;
  customerName: string;
  customerEmail: string;
  refundReason: string;
  requestedAt: string;
  refundAmount: number;
  currency: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  adminDashboardUrl: string;
}

/**
 * Order Confirmed Email Template (User)
 * Sent when user successfully places an order
 */
export const orderConfirmed = (
  vars: OrderConfirmedVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const itemsHtml = vars.items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px 0; font-size:14px; color:${c.foreground};">${item.name}</td>
      <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground}; text-align:center;">×${item.quantity}</td>
      <td style="padding:12px 0; font-size:14px; font-weight:600; color:${c.foreground}; text-align:right;">${vars.currency}${item.price.toFixed(2)}</td>
    </tr>
  `,
    )
    .join("");

  const bodyContent = `
    <!-- Success badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#10B981; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">✓ Order Confirmed</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Thank You for Your Order!
    </h1>
    
    <p style="margin:0 0 8px; font-size:16px; line-height:24px; color:${c.foreground};">
      Hi ${vars.shippingName},
    </p>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      We've received your order and it's being prepared for shipment. Here's a summary of your purchase:
    </p>
    
    <!-- Order Header -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px 8px 0 0; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
                <p style="margin:0; font-size:12px; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Order Number</p>
                <p style="margin:4px 0 0; font-size:18px; font-weight:700; color:${c.foreground};">${vars.orderRef}</p>
              </td>
              <td style="text-align:right;">
                <p style="margin:0; font-size:12px; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Order Date</p>
                <p style="margin:4px 0 0; font-size:14px; color:${c.foreground};">${vars.orderDate}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Order Items -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:0 0 8px 8px; background-color:${c.card}; border:1px solid ${c.border}; border-top:none;">
      <tr>
        <td style="padding:0 20px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr style="border-bottom:1px solid ${c.border};">
              <th style="padding:12px 0; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-align:left; text-transform:uppercase; letter-spacing:0.5px;">Item</th>
              <th style="padding:12px 0; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-align:center; text-transform:uppercase; letter-spacing:0.5px;">Qty</th>
              <th style="padding:12px 0; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-align:right; text-transform:uppercase; letter-spacing:0.5px;">Price</th>
            </tr>
            ${itemsHtml}
            <tr style="border-top:1px solid ${c.border};">
              <td colspan="2" style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Subtotal</td>
              <td style="padding:12px 0; font-size:14px; color:${c.foreground}; text-align:right;">${vars.currency}${vars.subtotal.toFixed(2)}</td>
            </tr>
            ${
              vars.shipping > 0
                ? `
            <tr>
              <td colspan="2" style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Shipping</td>
              <td style="padding:12px 0; font-size:14px; color:${c.foreground}; text-align:right;">${vars.currency}${vars.shipping.toFixed(2)}</td>
            </tr>
            `
                : ""
            }
            ${
              vars.tax > 0
                ? `
            <tr>
              <td colspan="2" style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Tax</td>
              <td style="padding:12px 0; font-size:14px; color:${c.foreground}; text-align:right;">${vars.currency}${vars.tax.toFixed(2)}</td>
            </tr>
            `
                : ""
            }
            <tr style="border-top:2px solid ${c.border};">
              <td colspan="2" style="padding:16px 0 0; font-size:16px; font-weight:600; color:${c.foreground};">Total</td>
              <td style="padding:16px 0 0; font-size:20px; font-weight:700; color:${c.primary}; text-align:right;">${vars.currency}${vars.total.toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Shipping Address -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Shipping Address</p>
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.foreground}; white-space:pre-line;">${vars.shippingAddress}</p>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${c.primary};">
          <a href="${vars.orderUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            Track Your Order
          </a>
        </td>
      </tr>
    </table>
    
    <!-- Info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; line-height:20px; color:${c.foreground};">What's Next?</p>
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            You'll receive a shipping confirmation email with tracking information once your order ships. Need help? Contact our support team anytime.
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Order Confirmed - ${vars.orderRef}`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};

/**
 * Order Shipped Email Template (User)
 * Sent when order has been shipped
 */
export const orderShipped = (
  vars: OrderShippedVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const itemsList = vars.items
    .map(
      (item) =>
        `<li style="margin-bottom:4px;">${item.quantity}× ${item.name}</li>`,
    )
    .join("");

  const bodyContent = `
    <!-- Shipping badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#3B82F6; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">📦 Shipped</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Your Order is On Its Way!
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      Great news! Your order <strong>${vars.orderRef}</strong> has been shipped and is heading your way.
    </p>
    
    <!-- Tracking Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:2px solid ${c.primary};">
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 12px; font-size:14px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Tracking Number</p>
          <p style="margin:0 0 16px; font-size:20px; font-weight:700; color:${c.foreground}; font-family:monospace; letter-spacing:1px;">${vars.trackingNumber}</p>
          ${
            vars.estimatedDelivery
              ? `
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            <strong style="color:${c.foreground};">Estimated Delivery:</strong> ${vars.estimatedDelivery}
          </p>
          `
              : ""
          }
        </td>
      </tr>
    </table>
    
    <!-- Items Shipped -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Items Shipped</p>
          <ul style="margin:0; padding-left:20px; font-size:14px; line-height:22px; color:${c.foreground};">
            ${itemsList}
          </ul>
        </td>
      </tr>
    </table>
    
    <!-- CTA Buttons -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              ${
                vars.trackingUrl
                  ? `
              <td align="center" style="border-radius:6px; background-color:${c.primary}; padding-right:12px;">
                <a href="${vars.trackingUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                  Track Package
                </a>
              </td>
              `
                  : ""
              }
              <td align="center" style="border-radius:6px; background-color:transparent; border:2px solid ${c.border};">
                <a href="${vars.orderUrl}" target="_blank" style="display:inline-block; padding:12px 30px; font-size:16px; font-weight:600; line-height:20px; color:${c.foreground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                  View Order
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; line-height:20px; color:${c.foreground};">Delivery Tips</p>
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            Keep an eye on your tracking updates. You'll receive a notification once your package is delivered. If you have any concerns, our support team is here to help!
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Order ${vars.orderRef} Has Shipped!`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};

/**
 * Order Delivered Email Template (User)
 * Sent when order has been delivered
 */
export const orderDelivered = (
  vars: OrderDeliveredVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const itemsList = vars.items
    .map(
      (item) =>
        `<li style="margin-bottom:4px;">${item.quantity}× ${item.name}</li>`,
    )
    .join("");

  const bodyContent = `
    <!-- Delivered badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#10B981; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">✓ Delivered</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Your Order Has Been Delivered!
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      We hope you're excited! Your order <strong>${vars.orderRef}</strong> was delivered on <strong>${vars.deliveryDate}</strong>.
    </p>
    
    <!-- Delivered Items -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 8px; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Delivered Items</p>
          <ul style="margin:0; padding-left:20px; font-size:14px; line-height:22px; color:${c.foreground};">
            ${itemsList}
          </ul>
        </td>
      </tr>
    </table>
    
    <!-- Review CTA -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px; text-align:center;">
          <p style="margin:0 0 16px; font-size:18px; font-weight:600; line-height:26px; color:${c.foreground};">
            How was your experience?
          </p>
          <p style="margin:0 0 20px; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            Your feedback helps us improve and assists other customers in making informed decisions.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
            <tr>
              <td align="center" style="border-radius:6px; background-color:${c.primary};">
                <a href="${vars.orderUrl}#review" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                  Write a Review
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${c.muted}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            <strong style="display:block; margin-bottom:4px; color:${c.foreground};">Need Help?</strong>
            If you have any questions or concerns about your order, our support team is always ready to assist you.
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Order ${vars.orderRef} Delivered Successfully!`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};

/**
 * Order Canceled Email Template (User)
 * Sent when order has been canceled
 */
export const orderCanceled = (
  vars: OrderCanceledVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const bodyContent = `
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Order Canceled
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      Your order <strong>${vars.orderRef}</strong> has been canceled${vars.refundAmount > 0 ? " and a refund has been initiated" : ""}.
    </p>
    
    ${
      vars.cancellationReason
        ? `
    <!-- Reason Box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border-left:4px solid ${c.primary};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; line-height:20px; color:${c.foreground};">
            Cancellation Reason:
          </p>
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            ${vars.cancellationReason}
          </p>
        </td>
      </tr>
    </table>
    `
        : ""
    }
    
    ${
      vars.refundAmount > 0
        ? `
    <!-- Refund Info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 12px; font-size:14px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Refund Details</p>
          <p style="margin:0 0 8px; font-size:24px; font-weight:700; color:${c.primary};">
            ${vars.currency}${vars.refundAmount.toFixed(2)}
          </p>
          ${
            vars.refundETA
              ? `
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            Expected to be processed within ${vars.refundETA}
          </p>
          `
              : ""
          }
        </td>
      </tr>
    </table>
    `
        : ""
    }
    
    <!-- Info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            ${vars.refundAmount > 0 ? `The refund will be credited to your original payment method. If you have any questions about this cancellation or refund, please ` : `If you didn't request this cancellation or have any questions, please `}
            <a href="${shopSettings.shopUrl}/contact" style="color:${c.primary}; text-decoration:none; font-weight:600;">contact our support team</a>.
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Order ${vars.orderRef} Has Been Canceled`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};

/**
 * Order Refunded Email Template (User)
 * Sent when order refund has been processed
 */
export const orderRefunded = (
  vars: OrderRefundedVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const bodyContent = `
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Refund Processed
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      Your refund for order <strong>${vars.orderRef}</strong> has been processed successfully.
    </p>
    
    <!-- Refund Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td colspan="2" style="padding-bottom:16px; border-bottom:1px solid ${c.border};">
                <p style="margin:0; font-size:14px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Refund Summary</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 0; font-size:14px; color:${c.mutedForeground};">Refund Amount</td>
              <td style="padding:16px 0; font-size:20px; font-weight:700; color:${c.primary}; text-align:right;">${vars.currency}${vars.refundAmount.toFixed(2)}</td>
            </tr>
            <tr style="border-top:1px solid ${c.border};">
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Refund Method</td>
              <td style="padding:12px 0; font-size:14px; font-weight:600; color:${c.foreground}; text-align:right;">${vars.refundMethod}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Processed On</td>
              <td style="padding:12px 0; font-size:14px; color:${c.foreground}; text-align:right;">${vars.refundDate}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Info Box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; line-height:20px; color:${c.foreground};">
            Processing Time
          </p>
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            The refund has been sent to your original payment method. Depending on your bank or card issuer, it may take 3-10 business days to appear in your account. If you don't see it after this time, please <a href="${shopSettings.shopUrl}/contact" style="color:${c.primary}; text-decoration:none; font-weight:600;">contact us</a>.
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Refund Processed for Order ${vars.orderRef}`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};

/**
 * New Order Notification Email Template (Admin)
 * Sent to admins when a new order is placed
 */
export const newOrderNotification = (
  vars: NewOrderNotificationVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const itemsHtml = vars.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 0; font-size:14px; color:${c.foreground};">${item.name}</td>
      <td style="padding:8px 0; font-size:14px; color:${c.mutedForeground}; text-align:center;">×${item.quantity}</td>
      <td style="padding:8px 0; font-size:14px; font-weight:600; color:${c.foreground}; text-align:right;">${vars.currency}${item.price.toFixed(2)}</td>
    </tr>
  `,
    )
    .join("");

  const bodyContent = `
    <!-- New Order badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#10B981; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">🔔 New Order</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      New Order Received
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      You have a new order from <strong>${vars.customerName}</strong> that requires your attention.
    </p>
    
    <!-- Order Summary Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td colspan="3" style="padding-bottom:16px; border-bottom:1px solid ${c.border};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
                      <p style="margin:0; font-size:12px; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Order Number</p>
                      <p style="margin:4px 0 0; font-size:18px; font-weight:700; color:${c.foreground};">${vars.orderRef}</p>
                    </td>
                    <td style="text-align:right;">
                      <p style="margin:0; font-size:12px; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Total</p>
                      <p style="margin:4px 0 0; font-size:20px; font-weight:700; color:${c.primary};">${vars.currency}${vars.total.toFixed(2)}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td colspan="3" style="padding:16px 0;">
                <p style="margin:0 0 4px; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Customer</p>
                <p style="margin:0 0 2px; font-size:14px; color:${c.foreground};">${vars.customerName}</p>
                <p style="margin:0; font-size:14px; color:${c.primary};">${vars.customerEmail}</p>
              </td>
            </tr>
            <tr>
              <td colspan="3" style="padding:16px 0 12px; border-top:1px solid ${c.border};">
                <p style="margin:0; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Items</p>
              </td>
            </tr>
            ${itemsHtml}
          </table>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${c.primary};">
          <a href="${vars.adminDashboardUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            View in Dashboard
          </a>
        </td>
      </tr>
    </table>
    
    <!-- Info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            <strong style="display:block; margin-bottom:4px; color:${c.foreground};">Quick Tip</strong>
            Process this order promptly to ensure customer satisfaction and maintain your store's reputation.
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `New Order ${vars.orderRef} - ${vars.currency}${vars.total.toFixed(2)}`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};

/**
 * Order Canceled by Customer - Admin Notification
 * Sent to admins when a customer cancels their order
 */
export const orderCanceledAdmin = (
  vars: OrderCanceledAdminVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const itemsList = vars.items
    .map(
      (item) => `
    <li style="margin:4px 0; color:${c.foreground};">${item.name} (×${item.quantity})</li>
  `,
    )
    .join("");

  const bodyContent = `
    <!-- Alert badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#F59E0B; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">⚠️ Order Canceled</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Customer Canceled Order
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      <strong>${vars.customerName}</strong> has canceled their order. A refund needs to be initiated.
    </p>
    
    <!-- Order Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding-bottom:16px; border-bottom:1px solid ${c.border};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
                      <p style="margin:0; font-size:12px; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Order Number</p>
                      <p style="margin:4px 0 0; font-size:18px; font-weight:700; color:${c.foreground};">${vars.orderRef}</p>
                    </td>
                    <td style="text-align:right;">
                      <p style="margin:0; font-size:12px; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Refund Amount</p>
                      <p style="margin:4px 0 0; font-size:20px; font-weight:700; color:#F59E0B;">${vars.currency}${vars.refundAmount.toFixed(2)}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="width:50%; padding-right:12px;">
                      <p style="margin:0 0 4px; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Customer</p>
                      <p style="margin:0 0 2px; font-size:14px; color:${c.foreground};">${vars.customerName}</p>
                      <p style="margin:0; font-size:14px; color:${c.primary};">${vars.customerEmail}</p>
                    </td>
                    <td style="width:50%; text-align:right;">
                      <p style="margin:0 0 4px; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Canceled At</p>
                      <p style="margin:0; font-size:14px; color:${c.foreground};">${vars.canceledAt}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Items Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Canceled Items</p>
          <ul style="margin:0; padding-left:20px; font-size:14px; line-height:22px;">
            ${itemsList}
          </ul>
        </td>
      </tr>
    </table>
    
    <!-- Action Required -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:#FEF3C7; border:2px solid #F59E0B;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; line-height:20px; color:#92400E;">⚠️ Action Required</p>
          <p style="margin:0; font-size:14px; line-height:20px; color:#78350F;">
            Please process the refund of <strong>${vars.currency}${vars.refundAmount.toFixed(2)}</strong> to the customer's original payment method within 24 hours.
          </p>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${c.primary};">
          <a href="${vars.adminDashboardUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            Process Refund in Dashboard
          </a>
        </td>
      </tr>
    </table>
    
    <!-- Info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            <strong style="display:block; margin-bottom:4px; color:${c.foreground};">Refund Guidelines</strong>
            Ensure the refund is processed within the standard timeframe. Customer satisfaction depends on prompt refund processing.
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `🔔 Order ${vars.orderRef} Canceled - Refund Required`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};

/**
 * Refund Requested by Customer - Admin Notification
 * Sent to admins when a customer requests a refund
 */
export const refundRequestedAdmin = (
  vars: RefundRequestedAdminVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const itemsList = vars.items
    .map(
      (item) => `
    <li style="margin:4px 0; color:${c.foreground};">${item.name} (×${item.quantity})</li>
  `,
    )
    .join("");

  const bodyContent = `
    <!-- Alert badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#EF4444; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">🔁 Refund Request</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Customer Requested Refund
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      <strong>${vars.customerName}</strong> has requested a refund for their order. Review the request and take appropriate action.
    </p>
    
    <!-- Order Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding-bottom:16px; border-bottom:1px solid ${c.border};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
                      <p style="margin:0; font-size:12px; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Order Number</p>
                      <p style="margin:4px 0 0; font-size:18px; font-weight:700; color:${c.foreground};">${vars.orderRef}</p>
                    </td>
                    <td style="text-align:right;">
                      <p style="margin:0; font-size:12px; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Refund Amount</p>
                      <p style="margin:4px 0 0; font-size:20px; font-weight:700; color:#EF4444;">${vars.currency}${vars.refundAmount.toFixed(2)}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="width:50%; padding-right:12px;">
                      <p style="margin:0 0 4px; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Customer</p>
                      <p style="margin:0 0 2px; font-size:14px; color:${c.foreground};">${vars.customerName}</p>
                      <p style="margin:0; font-size:14px; color:${c.primary};">${vars.customerEmail}</p>
                    </td>
                    <td style="width:50%; text-align:right;">
                      <p style="margin:0 0 4px; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Requested At</p>
                      <p style="margin:0; font-size:14px; color:${c.foreground};">${vars.requestedAt}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Refund Reason Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Refund Reason</p>
          <p style="margin:0; font-size:14px; line-height:22px; color:${c.foreground};">
            "${vars.refundReason}"
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Items Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Order Items</p>
          <ul style="margin:0; padding-left:20px; font-size:14px; line-height:22px;">
            ${itemsList}
          </ul>
        </td>
      </tr>
    </table>
    
    <!-- Action Required -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:#FEE2E2; border:2px solid #EF4444;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; line-height:20px; color:#991B1B;">⚠️ Action Required</p>
          <p style="margin:0; font-size:14px; line-height:20px; color:#7F1D1D;">
            Review this refund request and approve or deny it in the dashboard. If approved, process the refund of <strong>${vars.currency}${vars.refundAmount.toFixed(2)}</strong> promptly.
          </p>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${c.primary};">
          <a href="${vars.adminDashboardUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            Review Refund Request
          </a>
        </td>
      </tr>
    </table>
    
    <!-- Info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            <strong style="display:block; margin-bottom:4px; color:${c.foreground};">Review Guidelines</strong>
            Assess the customer's reason carefully. Contact the customer if clarification is needed before making a decision on the refund request.
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `🔔 Refund Request for Order ${vars.orderRef}`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};
