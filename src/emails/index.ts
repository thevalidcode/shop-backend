import nodemailer from "nodemailer";
import { prisma } from "../config/db.config";
import { EmailTemplateVars, getTemplate } from "./templates";
import {
  extractColorsFromSchema,
  DesignColors,
} from "./components/EmailLayout";
import { parse as parseDomain } from "tldts";

interface DispatchEmailParams {
  from: string;
  to: string;
  subject: string;
  html: string;
  shopId: number;
}

interface StoreSettings {
  logoUrl: string;
  shopName: string;
  shopUrl: string;
  domain: string;
  faviconUrl: string;
  adminEmail: string;
  designColors?: DesignColors;
  features: {
    store_email_notifications: boolean;
    store_custom_emails: boolean;
  };
}

// ----------------------------
// Transporter Setup
// ----------------------------
const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: "unix",
  path: "/usr/sbin/sendmail",
});

// ----------------------------
// Utility: Interpolation
// ----------------------------
function interpolate(template: string, variables: Record<string, any>): string {
  return template.replace(
    /\{\{(.*?)\}\}/g,
    (_, key) => variables[key.trim()] ?? ""
  );
}

// ----------------------------
// Load Store-Specific Settings
// ----------------------------
async function loadStoreSettings(shopId: number): Promise<StoreSettings> {
  const setting = await prisma.setting.findUnique({
    where: { shopId },
    include: { shop: true },
  });

  const admin = await prisma.admin.findUnique({
    where: { shopId },
  });

  if (!setting || !admin) {
    throw new Error(`Settings or admin not found for this shop`);
  }

  const shopUrl = setting.shop.ssl
    ? `https://${setting.shop.uid}`
    : `http://${setting.shop.uid}`;

  const parsed = parseDomain(setting.shop.uid);
  const domain = parsed.domain || setting.shop.uid;

  // Extract features from shop
  const features = (setting.shop.features as any) || {};
  const shopEmailNotifications = features.store_email_notifications ?? false;
  const shopCustomEmails = features.store_custom_emails ?? false;

  // Check if email notifications are enabled for this shop
  if (!shopEmailNotifications) {
    throw new Error(`Email notifications are disabled for this shop`);
  }

  // Fetch design styles for the shop
  const designStyle = await prisma.designStyle.findFirst({
    where: { shopId },
  });

  // Extract colors from design schema if available
  let designColors: DesignColors | undefined;
  if (designStyle && designStyle.schema) {
    try {
      designColors = extractColorsFromSchema(designStyle.schema);
    } catch (error) {
      console.error(`Failed to extract colors for this shop`, error);
      // designColors will remain undefined, templates will use defaults
    }
  }

  return {
    logoUrl: setting.logoUrl || "",
    shopName: setting.shopName || "My Store",
    shopUrl,
    domain,
    faviconUrl: setting.faviconUrl || "",
    designColors,
    adminEmail: admin.email,
    features: {
      store_email_notifications: shopEmailNotifications,
      store_custom_emails: shopCustomEmails,
    },
  };
}

// ----------------------------
// Build Email Template
// ----------------------------
export async function buildEmailTemplate(
  type: keyof EmailTemplateVars,
  data: Record<string, any>,
  shopSettings: StoreSettings,
  shopId: number
): Promise<{ subject: string; html: string }> {
  const template = await prisma.emailTemplate.findFirst({
    where: { type, shopId },
  });

  const variables = {
    logo: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    domain: shopSettings.domain,
    ...data,
  };

  const htmlFromDb = template ? interpolate(template.content, variables) : "";
  const fallback = getTemplate(type, variables, shopSettings);
  const newSubject = template?.subject || fallback.subject;

  return {
    subject: newSubject,
    html: htmlFromDb || fallback.html,
  };
}

// ----------------------------
// Dispatch Email & Log
// ----------------------------
// Check if we're in production before sending emails
function shouldSendEmail(): boolean {
  return process.env.NODE_ENV === 'production';
}

async function dispatchEmail({
  from,
  to,
  subject,
  html,
  shopId,
}: DispatchEmailParams): Promise<boolean> {
  try {
    const result = await transporter.sendMail({ from, to, subject, html });

    // Get the shop counter for this shop
    const counter = await prisma.shopCounter.findUnique({
      where: { shopId },
    });

    if (!counter) {
      throw new Error(`Store counter not found for this shop`);
    }

    // Increment and get new counter value
    const updatedCounter = await prisma.shopCounter.update({
      where: { shopId },
      data: { emailLogCounter: { increment: 1 } },
    });

    await prisma.emailLog.create({
      data: {
        shopScopedId: updatedCounter.emailLogCounter,
        sender: from,
        receiver: to,
        subject,
        html,
        status: "SUCCESS",
        messageId: result.messageId,
        response: result.response,
        shopId,
        timestamp: new Date(),
      },
    });

    return true;
  } catch (err: any) {
    // Try to log error even if counter increment failed
    try {
      const counter = await prisma.shopCounter.findUnique({
        where: { shopId },
      });

      if (counter) {
        const updatedCounter = await prisma.shopCounter.update({
          where: { shopId },
          data: { emailLogCounter: { increment: 1 } },
        });

        await prisma.emailLog.create({
          data: {
            shopScopedId: updatedCounter.emailLogCounter,
            sender: from,
            receiver: to,
            subject,
            html,
            status: "ERROR",
            response: err.message,
            shopId,
            timestamp: new Date(),
          },
        });
      }
    } catch (logErr) {
      console.error(`Failed to log email error:`, logErr);
    }

    console.error(`Failed to send email to ${to}:`, err.message);
    return false;
  }
}

// ----------------------------
// Send Email to Admins
// ----------------------------
export async function sendEmailToAdmins(
  shopId: number,
  type: keyof EmailTemplateVars,
  data: Record<string, any> = {}
): Promise<void> {
  // Only send emails in production environment
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] Would send admin email of type "${type}" to shop ${shopId}`);
    return;
  }

  try {
    const shopSettings = await loadStoreSettings(shopId);
    const { subject, html } = await buildEmailTemplate(
      type,
      data,
      shopSettings,
      shopId
    );

    // Get admin emails for this shop
    const adminEmails = await prisma.adminEmail.findFirst({
      where: { shopId },
    });

    // Determine sender email based on shop_custom_emails feature
    const from = shopSettings.features.store_custom_emails
      ? `"${shopSettings.shopName}" <noreply@${shopSettings.domain}>`
      : `"${shopSettings.shopName}" <social-media-shop@validpanel.com>`;

    const recipients = adminEmails?.emails || [];

    if (recipients.length === 0) {
      console.warn(`No admin emails configured for shop ID: ${shopId}`);
      return;
    }

    // Send to all admin emails
    for (const to of recipients) {
      await dispatchEmail({ from, to, subject, html, shopId });
    }
  } catch (err: any) {
    throw err;
  }
}

// ----------------------------
// Send Email to a User
// ----------------------------
export async function sendUserEmail(
  shopId: number,
  to: string,
  type: keyof EmailTemplateVars,
  data: Record<string, any> = {}
): Promise<void> {
  // Only send emails in production environment
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] Would send email of type "${type}" to ${to} for shop ${shopId}`);
    return;
  }

  try {
    const shopSettings = await loadStoreSettings(shopId);
    const { subject, html } = await buildEmailTemplate(
      type,
      data,
      shopSettings,
      shopId
    );

    // Determine sender email based on shop_custom_emails feature
    const from = shopSettings.features.store_custom_emails
      ? `"${shopSettings.shopName}" <noreply@${shopSettings.domain}>`
      : `"${shopSettings.shopName}" <social-media-shop@validpanel.com>`;

    await dispatchEmail({ from, to, subject, html, shopId });
  } catch (err: any) {
    throw err;
  }
}

// ----------------------------
// Backward Compatible: Send Email
// (Used by providers for admin notifications)
// ----------------------------
export async function sendEmail(
  to: string | undefined,
  type: string,
  data: Record<string, any>,
  shopId: number
): Promise<void> {
  // If no recipient specified, send to admins
  if (!to) {
    await sendEmailToAdmins(shopId, type as keyof EmailTemplateVars, data);
  } else {
    await sendUserEmail(shopId, to, type as keyof EmailTemplateVars, data);
  }
}
