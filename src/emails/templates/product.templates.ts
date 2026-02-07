import {
  Layout,
  TemplateResult,
  DesignColors,
} from "../components/EmailLayout";
import { DEFAULT_EMAIL_COLORS } from "../constants/defaultColors";
import { StoreSettings } from "./interface";

export interface LowStockAlertVars {
  productName: string;
  productSku: string;
  currentStock: number;
  productUrl: string;
  adminDashboardUrl: string;
}

export interface OutOfStockAlertVars {
  productName: string;
  productSku: string;
  productUrl: string;
  adminDashboardUrl: string;
}

/**
 * Low Stock Alert Email Template (Admin)
 * Sent to admins when a product's stock falls below the restock threshold
 */
export const lowStockAlert = (
  vars: LowStockAlertVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const body = `
    <!--[if mso]>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:0;">
    <![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:0 auto;">
      <tr>
        <td style="padding:40px 24px; background-color:${c.card};">
          <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            Low Stock Alert
          </h1>
          <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            The following product is running low on stock and needs to be restocked soon:
          </p>

          <!-- Product Details Card -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; background-color:${c.background}; border:1px solid ${c.border}; border-radius:8px;">
            <tr>
              <td style="padding:20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:8px 0;">
                      <span style="font-size:14px; font-weight:600; color:${c.mutedForeground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">Product Name:</span>
                      <br>
                      <span style="font-size:16px; font-weight:600; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">${vars.productName}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;">
                      <span style="font-size:14px; font-weight:600; color:${c.mutedForeground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">SKU:</span>
                      <br>
                      <span style="font-size:16px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">${vars.productSku || "N/A"}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;">
                      <span style="font-size:14px; font-weight:600; color:${c.mutedForeground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">Current Stock:</span>
                      <br>
                      <span style="font-size:20px; font-weight:700; color:#ef4444; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">${vars.currentStock} units</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            Please restock this product as soon as possible to avoid running out of inventory and losing potential sales.
          </p>

          <!-- Action Buttons -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
            <tr>
              <td style="padding-right:12px;">
                <!--[if mso]>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${vars.adminDashboardUrl}" style="height:44px;v-text-anchor:middle;width:180px;" arcsize="10%" strokecolor="${c.primary}" fillcolor="${c.primary}">
                  <w:anchorlock/>
                  <center style="color:${c.primaryForeground};font-family:sans-serif;font-size:16px;font-weight:600;">Manage Product</center>
                </v:roundrect>
                <![endif]-->
                <a href="${vars.adminDashboardUrl}" style="background-color:${c.primary}; border:2px solid ${c.primary}; border-radius:6px; color:${c.primaryForeground}; display:inline-block; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size:16px; font-weight:600; line-height:44px; text-align:center; text-decoration:none; width:180px; -webkit-text-size-adjust:none; mso-hide:all;">
                  Manage Product
                </a>
              </td>
              <td>
                <!--[if mso]>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${vars.productUrl}" style="height:44px;v-text-anchor:middle;width:180px;" arcsize="10%" strokecolor="${c.border}" fillcolor="${c.card}">
                  <w:anchorlock/>
                  <center style="color:${c.foreground};font-family:sans-serif;font-size:16px;font-weight:600;">View Product</center>
                </v:roundrect>
                <![endif]-->
                <a href="${vars.productUrl}" style="background-color:${c.card}; border:2px solid ${c.border}; border-radius:6px; color:${c.foreground}; display:inline-block; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size:16px; font-weight:600; line-height:44px; text-align:center; text-decoration:none; width:180px; -webkit-text-size-adjust:none; mso-hide:all;">
                  View Product
                </a>
              </td>
            </tr>
          </table>

          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            This is an automated notification from your inventory management system.
          </p>
        </td>
      </tr>
    </table>
    <!--[if mso]>
        </td>
      </tr>
    </table>
    <![endif]-->
  `;

  return Layout({
    subject: `Low Stock Alert: ${vars.productName}`,
    children: body,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: shopSettings.designColors,
  });
};

/**
 * Out of Stock Alert Email Template (Admin)
 * Sent to admins when a product goes out of stock
 */
export const outOfStockAlert = (
  vars: OutOfStockAlertVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const body = `
    <!--[if mso]>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:0;">
    <![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:0 auto;">
      <tr>
        <td style="padding:40px 24px; background-color:${c.card};">
          <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            Product Out of Stock
          </h1>
          <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            The following product is now out of stock:
          </p>

          <!-- Product Details Card -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; background-color:${c.background}; border:1px solid ${c.border}; border-radius:8px;">
            <tr>
              <td style="padding:20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:8px 0;">
                      <span style="font-size:14px; font-weight:600; color:${c.mutedForeground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">Product Name:</span>
                      <br>
                      <span style="font-size:16px; font-weight:600; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">${vars.productName}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;">
                      <span style="font-size:14px; font-weight:600; color:${c.mutedForeground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">SKU:</span>
                      <br>
                      <span style="font-size:16px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">${vars.productSku || "N/A"}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;">
                      <span style="font-size:14px; font-weight:600; color:${c.mutedForeground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">Stock Status:</span>
                      <br>
                      <span style="font-size:20px; font-weight:700; color:#dc2626; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">OUT OF STOCK</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            This product is no longer available for purchase. Please restock immediately to resume sales.
          </p>

          <!-- Action Button -->
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${vars.adminDashboardUrl}" style="height:44px;v-text-anchor:middle;width:200px;" arcsize="10%" strokecolor="${c.primary}" fillcolor="${c.primary}">
            <w:anchorlock/>
            <center style="color:${c.primaryForeground};font-family:sans-serif;font-size:16px;font-weight:600;">Restock Product</center>
          </v:roundrect>
          <![endif]-->
          <a href="${vars.adminDashboardUrl}" style="background-color:${c.primary}; border:2px solid ${c.primary}; border-radius:6px; color:${c.primaryForeground}; display:inline-block; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size:16px; font-weight:600; line-height:44px; text-align:center; text-decoration:none; width:200px; -webkit-text-size-adjust:none; mso-hide:all; margin:0 0 24px;">
            Restock Product
          </a>

          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            This is an automated notification from your inventory management system.
          </p>
        </td>
      </tr>
    </table>
    <!--[if mso]>
        </td>
      </tr>
    </table>
    <![endif]-->
  `;

  return Layout({
    subject: `Out of Stock: ${vars.productName}`,
    children: body,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: shopSettings.designColors,
  });
};