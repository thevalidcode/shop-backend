import {
  DEFAULT_EMAIL_COLORS,
  Layout,
  TemplateResult,
} from "../components/EmailLayout";
import type { StoreSettings } from "./interface";

/**
 * Payment Template Variable Types
 */
export interface PaymentSuccessfulVars {
  userName: string;
  orderRef: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentDate: string;
  transactionId: string;
  orderUrl: string;
}

export interface PaymentFailedVars {
  userName: string;
  orderRef?: string;
  amount: number;
  currency: string;
  failureReason: string;
  retryUrl?: string;
  supportUrl: string;
}

export interface RefundProcessedVars {
  userName: string;
  orderRef: string;
  refundAmount: number;
  currency: string;
  refundReason?: string;
  refundMethod: string;
  refundDate: string;
  estimatedArrival: string;
}

/**
 * Payment Successful Email Template (User)
 * Sent when payment is successfully processed
 */
export const paymentSuccessful = (
  vars: PaymentSuccessfulVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const bodyContent = `
    <!-- Success badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#10B981; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">✓ Payment Successful</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Payment Confirmed!
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      Hi <strong>${vars.userName}</strong>, thank you for your payment! Your transaction has been successfully processed.
    </p>
    
    <!-- Payment Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td colspan="2" style="padding-bottom:16px; border-bottom:1px solid ${c.border};">
                <p style="margin:0; font-size:14px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Payment Summary</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 0; font-size:14px; color:${c.mutedForeground};">Amount Paid</td>
              <td style="padding:16px 0; font-size:24px; font-weight:700; color:${c.primary}; text-align:right;">${vars.currency}${vars.amount.toFixed(2)}</td>
            </tr>
            <tr style="border-top:1px solid ${c.border};">
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Order Number</td>
              <td style="padding:12px 0; font-size:14px; font-weight:600; color:${c.foreground}; text-align:right;">${vars.orderRef}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Payment Method</td>
              <td style="padding:12px 0; font-size:14px; color:${c.foreground}; text-align:right;">${vars.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Transaction ID</td>
              <td style="padding:12px 0; font-size:14px; color:${c.foreground}; font-family:monospace; text-align:right;">${vars.transactionId}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Payment Date</td>
              <td style="padding:12px 0; font-size:14px; color:${c.foreground}; text-align:right;">${vars.paymentDate}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${c.primary};">
          <a href="${vars.orderUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            View Order Details
          </a>
        </td>
      </tr>
    </table>
    
    <!-- Info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            <strong style="display:block; margin-bottom:4px; color:${c.foreground};">What's Next?</strong>
            We're now processing your order. You'll receive a shipping confirmation email once your order is dispatched.
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Payment Confirmed - Order ${vars.orderRef}`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};

/**
 * Payment Failed Email Template (User)
 * Sent when payment fails
 */
export const paymentFailed = (
  vars: PaymentFailedVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const bodyContent = `
    <!-- Failed badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#EF4444; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">✕ Payment Failed</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Payment Unsuccessful
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      Hi <strong>${vars.userName}</strong>, we were unable to process your payment${vars.orderRef ? ` for order <strong>${vars.orderRef}</strong>` : ""}.
    </p>
    
    <!-- Failure Reason -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border-left:4px solid #EF4444;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; line-height:20px; color:${c.foreground};">
            Reason for Failure:
          </p>
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            ${vars.failureReason}
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Payment Amount -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Attempted Amount</p>
          <p style="margin:0; font-size:24px; font-weight:700; color:${c.foreground};">${vars.currency}${vars.amount.toFixed(2)}</p>
        </td>
      </tr>
    </table>
    
    ${
      vars.retryUrl
        ? `
    <!-- Retry CTA -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${c.primary};">
          <a href="${vars.retryUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            Retry Payment
          </a>
        </td>
      </tr>
    </table>
    `
        : ""
    }
    
    <!-- Troubleshooting Tips -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 12px; font-size:16px; font-weight:600; line-height:24px; color:${c.foreground};">
            Troubleshooting Tips
          </p>
          <ul style="margin:0; padding-left:20px; font-size:14px; line-height:24px; color:${c.mutedForeground};">
            <li>Check that you have sufficient funds available</li>
            <li>Verify your card details are correct and up to date</li>
            <li>Contact your bank to ensure the transaction isn't blocked</li>
            <li>Try using a different payment method</li>
          </ul>
        </td>
      </tr>
    </table>
    
    <!-- Support -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${c.muted}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            Still having trouble? Our support team is ready to help. <a href="${vars.supportUrl}" style="color:${c.primary}; text-decoration:none; font-weight:600;">Contact us</a> for assistance.
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Payment Failed${vars.orderRef ? ` - Order ${vars.orderRef}` : ""}`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};

/**
 * Refund Processed Email Template (User)
 * Sent when refund has been processed
 */
export const refundProcessed = (
  vars: RefundProcessedVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const bodyContent = `
    <!-- Refund badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#3B82F6; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">💰 Refund Issued</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Refund Processed
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      Hi <strong>${vars.userName}</strong>, your refund for order <strong>${vars.orderRef}</strong> has been processed successfully.
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
              <td style="padding:16px 0; font-size:24px; font-weight:700; color:${c.primary}; text-align:right;">${vars.currency}${vars.refundAmount.toFixed(2)}</td>
            </tr>
            <tr style="border-top:1px solid ${c.border};">
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Order Number</td>
              <td style="padding:12px 0; font-size:14px; font-weight:600; color:${c.foreground}; text-align:right;">${vars.orderRef}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Refund Method</td>
              <td style="padding:12px 0; font-size:14px; color:${c.foreground}; text-align:right;">${vars.refundMethod}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Processed On</td>
              <td style="padding:12px 0; font-size:14px; color:${c.foreground}; text-align:right;">${vars.refundDate}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Expected Arrival</td>
              <td style="padding:12px 0; font-size:14px; color:${c.foreground}; text-align:right;">${vars.estimatedArrival}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    ${
      vars.refundReason
        ? `
    <!-- Refund Reason -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; line-height:20px; color:${c.foreground};">
            Refund Reason:
          </p>
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            ${vars.refundReason}
          </p>
        </td>
      </tr>
    </table>
    `
        : ""
    }
    
    <!-- Important Info -->
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
    subject: `Refund Processed - Order ${vars.orderRef}`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};
