import { Layout, TemplateResult } from "../components/EmailLayout";
import { DEFAULT_EMAIL_COLORS } from "../constants/defaultColors";
import { StoreSettings } from "./interface";

export interface ReviewApprovedVars {
  userName: string;
  productName: string;
  productUrl: string;
  rating: number;
  reviewComment?: string;
}

export interface ReviewRejectedVars {
  userName: string;
  productName: string;
  rating: number;
  rejectionReason?: string;
}

export interface NewReviewNotificationVars {
  userName: string;
  productName: string;
  productUrl: string;
  rating: number;
  reviewComment?: string;
  reviewTitle?: string;
  isVerified: boolean;
  adminDashboardUrl: string;
}

/**
 * Review Approved Email Template (User)
 * Sent when admin approves a user's product review
 */
export const reviewApproved = (
  vars: ReviewApprovedVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const stars = "★".repeat(vars.rating) + "☆".repeat(5 - vars.rating);

  const bodyContent = `
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Your Review Has Been Approved! 🎉
    </h1>
    
    <p style="margin:0 0 16px; font-size:16px; line-height:24px; color:${c.foreground};">
      Hi ${vars.userName},
    </p>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      Great news! Your review for <strong>${vars.productName}</strong> has been approved and is now live on our store.
    </p>
    
    <!-- Review Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <div style="margin-bottom:12px; font-size:24px; color:${c.primary}; line-height:1;">
            ${stars}
          </div>
          <p style="margin:0 0 8px; font-size:18px; font-weight:600; line-height:26px; color:${c.foreground};">
            ${vars.productName}
          </p>
          ${
            vars.reviewComment
              ? `
          <p style="margin:0; font-size:15px; line-height:22px; color:${c.mutedForeground}; font-style:italic;">
            "${vars.reviewComment}"
          </p>
          `
              : ""
          }
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${c.primary};">
          <a href="${vars.productUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            View Your Review
          </a>
        </td>
      </tr>
    </table>
    
    <!-- Thank you message -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 8px; font-size:16px; font-weight:600; line-height:24px; color:${c.foreground};">
            Thank You for Your Feedback! 💙
          </p>
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            Your review helps other customers make informed decisions. We truly appreciate you taking the time to share your experience with ${vars.productName}.
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Your Review for ${vars.productName} is Live!`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};

/**
 * Review Rejected Email Template (User)
 * Sent when admin rejects a user's product review
 */
export const reviewRejected = (
  vars: ReviewRejectedVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const bodyContent = `
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Review Update
    </h1>
    
    <p style="margin:0 0 16px; font-size:16px; line-height:24px; color:${c.foreground};">
      Hi ${vars.userName},
    </p>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      Thank you for taking the time to review <strong>${vars.productName}</strong>. After careful consideration, we're unable to approve your review at this time.
    </p>
    
    ${
      vars.rejectionReason
        ? `
    <!-- Reason Box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border-left:4px solid ${c.primary};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; line-height:20px; color:${c.foreground};">
            Reason:
          </p>
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            ${vars.rejectionReason}
          </p>
        </td>
      </tr>
    </table>
    `
        : ""
    }
    
    <!-- Guidelines -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 12px; font-size:16px; font-weight:600; line-height:24px; color:${c.foreground};">
            Review Guidelines
          </p>
          <ul style="margin:0; padding-left:20px; font-size:14px; line-height:22px; color:${c.mutedForeground};">
            <li style="margin-bottom:6px;">Reviews must be based on your genuine experience</li>
            <li style="margin-bottom:6px;">Keep language appropriate and respectful</li>
            <li style="margin-bottom:6px;">Focus on product features and your experience</li>
            <li>Avoid promotional content or spam</li>
          </ul>
        </td>
      </tr>
    </table>
    
    <p style="margin:0 0 16px; font-size:15px; line-height:22px; color:${c.foreground};">
      We appreciate your understanding. Feel free to submit a new review that follows our guidelines, and we'd be happy to consider it.
    </p>
    
    <!-- Contact Support -->
    <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
      Have questions? <a href="${shopSettings.shopUrl}/contact" style="color:${c.primary}; text-decoration:none; font-weight:600;">Contact our support team</a>
    </p>
  `;

  return Layout({
    subject: `Update on Your Review for ${vars.productName}`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};

/**
 * New Review Notification Email Template (Admin)
 * Sent to admins when a user submits a new review
 */
export const newReviewNotification = (
  vars: NewReviewNotificationVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const stars = "★".repeat(vars.rating) + "☆".repeat(5 - vars.rating);

  const bodyContent = `
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      New Product Review Submitted
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      A customer has submitted a new review that requires your approval.
    </p>
    
    <!-- Review Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <div style="margin-bottom:16px;">
            <div style="margin-bottom:8px; font-size:24px; color:${c.primary}; line-height:1;">
              ${stars}
            </div>
            ${
              vars.isVerified
                ? `
            <span style="display:inline-block; padding:4px 12px; background-color:${c.primary}; color:${c.primaryForeground}; font-size:12px; font-weight:600; border-radius:12px; text-transform:uppercase; letter-spacing:0.5px;">
              Verified Purchase
            </span>
            `
                : ""
            }
          </div>
          
          <p style="margin:0 0 8px; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            <strong style="color:${c.foreground};">Customer:</strong> ${vars.userName}
          </p>
          <p style="margin:0 0 12px; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            <strong style="color:${c.foreground};">Product:</strong> ${vars.productName}
          </p>
          
          ${
            vars.reviewTitle
              ? `
          <p style="margin:0 0 8px; font-size:16px; font-weight:600; line-height:24px; color:${c.foreground};">
            "${vars.reviewTitle}"
          </p>
          `
              : ""
          }
          
          ${
            vars.reviewComment
              ? `
          <p style="margin:0; font-size:15px; line-height:22px; color:${c.mutedForeground}; font-style:italic;">
            "${vars.reviewComment}"
          </p>
          `
              : ""
          }
        </td>
      </tr>
    </table>
    
    <!-- Action Buttons -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="border-radius:6px; background-color:${c.primary}; padding-right:12px;">
                <a href="${vars.adminDashboardUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                  Review in Dashboard
                </a>
              </td>
              <td align="center" style="border-radius:6px; background-color:transparent; border:2px solid ${c.border};">
                <a href="${vars.productUrl}" target="_blank" style="display:inline-block; padding:12px 30px; font-size:16px; font-weight:600; line-height:20px; color:${c.foreground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                  View Product
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
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            <strong style="display:block; margin-bottom:4px; color:${c.foreground};">Quick Tip</strong>
            Reviews help build trust with your customers. Respond promptly to maintain engagement and show you value feedback.
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `New ${vars.rating}-Star Review for ${vars.productName}`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};
