import {
  DEFAULT_EMAIL_COLORS,
  Layout,
  TemplateResult,
} from "../components/EmailLayout";
import type { StoreSettings } from "./interface";

/**
 * Support Ticket Template Variable Types
 */
export interface TicketCreatedVars {
  userName: string;
  ticketId: string;
  subject: string;
  message: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  ticketUrl: string;
}

export interface TicketUpdatedVars {
  userName: string;
  ticketId: string;
  subject: string;
  updateMessage: string;
  updatedBy: string;
  updateDate: string;
  ticketUrl: string;
}

export interface TicketResolvedVars {
  userName: string;
  ticketId: string;
  subject: string;
  resolutionMessage?: string;
  resolvedBy: string;
  resolutionDate: string;
  ticketUrl: string;
  feedbackUrl?: string;
}

export interface NewTicketNotificationVars {
  userName: string;
  userEmail: string;
  ticketId: string;
  subject: string;
  message: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  adminDashboardUrl: string;
}

/**
 * Ticket Created Email Template (User)
 * Sent when user creates a support ticket
 */
export const ticketCreated = (
  vars: TicketCreatedVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const priorityColors: Record<string, string> = {
    LOW: "#10B981",
    MEDIUM: "#F59E0B",
    HIGH: "#EF4444",
    URGENT: "#DC2626",
  };

  const priorityColor = vars.priority
    ? priorityColors[vars.priority]
    : "#6B7280";

  const bodyContent = `
    <!-- Created badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#3B82F6; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">🎫 Ticket Created</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Support Ticket Received
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      Hi <strong>${vars.userName}</strong>, thank you for contacting us. We've received your support request and our team will respond as soon as possible.
    </p>
    
    <!-- Ticket Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding-bottom:16px; border-bottom:1px solid ${c.border};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
                      <p style="margin:0; font-size:12px; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Ticket ID</p>
                      <p style="margin:4px 0 0; font-size:18px; font-weight:700; color:${c.foreground}; font-family:monospace;">#${vars.ticketId}</p>
                    </td>
                    ${
                      vars.priority
                        ? `
                    <td style="text-align:right;">
                      <p style="margin:0; font-size:12px; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Priority</p>
                      <p style="margin:4px 0 0; display:inline-block; padding:4px 12px; background-color:${priorityColor}; border-radius:12px;">
                        <span style="font-size:12px; font-weight:600; color:#FFFFFF;">${vars.priority}</span>
                      </p>
                    </td>
                    `
                        : ""
                    }
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 0;">
                <p style="margin:0 0 8px; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Subject</p>
                <p style="margin:0; font-size:16px; font-weight:600; line-height:24px; color:${c.foreground};">${vars.subject}</p>
              </td>
            </tr>
            <tr style="border-top:1px solid ${c.border};">
              <td style="padding:16px 0 0;">
                <p style="margin:0 0 8px; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Your Message</p>
                <p style="margin:0; font-size:14px; line-height:22px; color:${c.foreground}; white-space:pre-wrap;">${vars.message}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${c.primary};">
          <a href="${vars.ticketUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            View Ticket
          </a>
        </td>
      </tr>
    </table>
    
    <!-- Info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; line-height:20px; color:${c.foreground};">
            What Happens Next?
          </p>
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            Our support team will review your ticket and respond within 24-48 hours. You'll receive an email notification when there's an update to your ticket.
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Support Ticket #${vars.ticketId} Created`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};

/**
 * Ticket Updated Email Template (User)
 * Sent when support ticket is updated
 */
export const ticketUpdated = (
  vars: TicketUpdatedVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const bodyContent = `
    <!-- Updated badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#8B5CF6; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">🔄 Ticket Updated</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Update on Your Ticket
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      Hi <strong>${vars.userName}</strong>, there's a new update on your support ticket <strong>#${vars.ticketId}</strong>.
    </p>
    
    <!-- Ticket Info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 4px; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Subject</p>
          <p style="margin:0; font-size:14px; font-weight:600; color:${c.foreground};">${vars.subject}</p>
        </td>
      </tr>
    </table>
    
    <!-- Update Message -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 12px; font-size:14px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Latest Update</p>
          <p style="margin:0 0 16px; font-size:14px; line-height:22px; color:${c.foreground}; white-space:pre-wrap;">${vars.updateMessage}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding-top:12px; border-top:1px solid ${c.border};">
            <tr>
              <td style="font-size:13px; color:${c.mutedForeground};">
                <strong style="color:${c.foreground};">${vars.updatedBy}</strong> • ${vars.updateDate}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${c.primary};">
          <a href="${vars.ticketUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            View Full Conversation
          </a>
        </td>
      </tr>
    </table>
    
    <!-- Info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            <strong style="display:block; margin-bottom:4px; color:${c.foreground};">Need to Reply?</strong>
            Click the button above to view the full conversation and respond to our support team.
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Ticket #${vars.ticketId} Updated - ${vars.subject}`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};

/**
 * Ticket Resolved Email Template (User)
 * Sent when support ticket is resolved
 */
export const ticketResolved = (
  vars: TicketResolvedVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const bodyContent = `
    <!-- Resolved badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#10B981; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">✓ Resolved</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Your Ticket Has Been Resolved
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      Hi <strong>${vars.userName}</strong>, we're pleased to let you know that your support ticket <strong>#${vars.ticketId}</strong> has been resolved.
    </p>
    
    <!-- Ticket Info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td colspan="2" style="padding-bottom:16px; border-bottom:1px solid ${c.border};">
                <p style="margin:0; font-size:14px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Ticket Summary</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Ticket ID</td>
              <td style="padding:12px 0; font-size:14px; font-weight:600; color:${c.foreground}; font-family:monospace; text-align:right;">#${vars.ticketId}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Subject</td>
              <td style="padding:12px 0; font-size:14px; color:${c.foreground}; text-align:right;">${vars.subject}</td>
            </tr>
            <tr style="border-top:1px solid ${c.border};">
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Resolved By</td>
              <td style="padding:12px 0; font-size:14px; color:${c.foreground}; text-align:right;">${vars.resolvedBy}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Resolution Date</td>
              <td style="padding:12px 0; font-size:14px; color:${c.foreground}; text-align:right;">${vars.resolutionDate}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    ${
      vars.resolutionMessage
        ? `
    <!-- Resolution Message -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; line-height:20px; color:${c.foreground};">
            Resolution Details:
          </p>
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground}; white-space:pre-wrap;">
            ${vars.resolutionMessage}
          </p>
        </td>
      </tr>
    </table>
    `
        : ""
    }
    
    ${
      vars.feedbackUrl
        ? `
    <!-- Feedback CTA -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px; text-align:center;">
          <p style="margin:0 0 16px; font-size:18px; font-weight:600; line-height:26px; color:${c.foreground};">
            How Did We Do?
          </p>
          <p style="margin:0 0 20px; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            Your feedback helps us improve our support service. Please take a moment to rate your experience.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
            <tr>
              <td align="center" style="border-radius:6px; background-color:${c.primary};">
                <a href="${vars.feedbackUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                  Leave Feedback
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `
        : ""
    }
    
    <!-- Info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${c.muted}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            <strong style="display:block; margin-bottom:4px; color:${c.foreground};">Still Need Help?</strong>
            If your issue isn't fully resolved or you have additional questions, feel free to <a href="${vars.ticketUrl}" style="color:${c.primary}; text-decoration:none; font-weight:600;">reopen this ticket</a> or create a new one.
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Ticket #${vars.ticketId} Resolved - ${vars.subject}`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};

/**
 * New Ticket Notification Email Template (Admin)
 * Sent to admins when a new support ticket is created
 */
export const newTicketNotification = (
  vars: NewTicketNotificationVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const priorityColors: Record<string, string> = {
    LOW: "#10B981",
    MEDIUM: "#F59E0B",
    HIGH: "#EF4444",
    URGENT: "#DC2626",
  };

  const priorityColor = vars.priority
    ? priorityColors[vars.priority]
    : "#6B7280";

  const bodyContent = `
    <!-- New Ticket badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#3B82F6; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">🔔 New Ticket</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      New Support Ticket
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      A new support ticket has been created by <strong>${vars.userName}</strong> that requires attention.
    </p>
    
    <!-- Ticket Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding-bottom:16px; border-bottom:1px solid ${c.border};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
                      <p style="margin:0; font-size:12px; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Ticket ID</p>
                      <p style="margin:4px 0 0; font-size:18px; font-weight:700; color:${c.foreground}; font-family:monospace;">#${vars.ticketId}</p>
                    </td>
                    ${
                      vars.priority
                        ? `
                    <td style="text-align:right;">
                      <p style="margin:0; font-size:12px; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Priority</p>
                      <p style="margin:4px 0 0; display:inline-block; padding:4px 12px; background-color:${priorityColor}; border-radius:12px;">
                        <span style="font-size:12px; font-weight:600; color:#FFFFFF;">${vars.priority}</span>
                      </p>
                    </td>
                    `
                        : ""
                    }
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 0;">
                <p style="margin:0 0 4px; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Customer</p>
                <p style="margin:0 0 2px; font-size:14px; color:${c.foreground};">${vars.userName}</p>
                <p style="margin:0; font-size:14px; color:${c.primary};">${vars.userEmail}</p>
              </td>
            </tr>
            <tr style="border-top:1px solid ${c.border};">
              <td style="padding:16px 0;">
                <p style="margin:0 0 8px; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Subject</p>
                <p style="margin:0; font-size:16px; font-weight:600; line-height:24px; color:${c.foreground};">${vars.subject}</p>
              </td>
            </tr>
            <tr style="border-top:1px solid ${c.border};">
              <td style="padding:16px 0 0;">
                <p style="margin:0 0 8px; font-size:12px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Message</p>
                <p style="margin:0; font-size:14px; line-height:22px; color:${c.foreground}; white-space:pre-wrap;">${vars.message}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${c.primary};">
          <a href="${vars.adminDashboardUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            Respond to Ticket
          </a>
        </td>
      </tr>
    </table>
    
    <!-- Info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            <strong style="display:block; margin-bottom:4px; color:${c.foreground};">Reminder</strong>
            Timely responses improve customer satisfaction. Please respond within 24-48 hours.
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `New Support Ticket #${vars.ticketId} - ${vars.subject}`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};
