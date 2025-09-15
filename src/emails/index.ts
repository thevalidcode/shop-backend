import nodemailer from "nodemailer";
import { prisma } from "../config/db.config";
import { getTemplate } from "./templates";
import { v4 as uuidv4 } from "uuid";

const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: "unix",
  path: "/usr/sbin/sendmail",
});

function interpolate(template: string, variables: Record<string, any>): string {
  return template.replace(
    /\{\{(.*?)\}\}/g,
    (_, key) => variables[key.trim()] ?? ""
  );
}

async function loadGeneralSettings(shopId: number) {
  return prisma.setting.findFirst({
    where: { shopId },
  });
}

async function loadAdminEmails(shopId: number): Promise<string[]> {
  const records = await prisma.adminEmail.findMany({
    where: { shopId },
    select: { emails: true },
  });
  return records.map((r) => r.emails).flat();
}

async function buildEmailTemplate(
  type: string,
  data: Record<string, any>,
  logoUrl: string,
  shopId: number
): Promise<{ subject: string; html: string }> {
  const template = await prisma.emailTemplate.findFirst({
    where: {
      shopId,
      type,
    },
  });

  const variables = { logo: logoUrl || "", ...data };
  const htmlFromDb = interpolate(template?.content || "", variables);
  const fallbackHtml = getTemplate(type as any, variables);

  const subject =
    type
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim() + " Notification";

  return {
    subject,
    html: htmlFromDb || fallbackHtml,
  };
}

async function dispatchEmail({
  from,
  to,
  subject,
  html,
  shopId,
}: {
  from: string;
  to: string;
  subject: string;
  html: string;
  shopId: number;
}): Promise<boolean> {
  try {
    const result = await transporter.sendMail({ from, to, subject, html });

    // Use a transaction to atomically get the next ID and create the log
    await prisma.$transaction(async (tx) => {
      const counter = await tx.shopCounter.update({
        where: { shopId },
        data: { emailLogCounter: { increment: 1 } },
      });

      await tx.emailLog.create({
        data: {
          shopScopedId: counter.emailLogCounter,
          sender: from,
          receiver: to,
          subject,
          html,
          status: "success",
          timestamp: new Date(),
          messageId: result.messageId,
          response: result.response,
          shopId,
          uid: uuidv4(),
        },
      });
    });

    return true;
  } catch (err: any) {
    // Logging the error should also be atomic
    await prisma.$transaction(async (tx) => {
        const counter = await tx.shopCounter.update({
            where: { shopId },
            data: { emailLogCounter: { increment: 1 } },
        });

        await tx.emailLog.create({
            data: {
                shopScopedId: counter.emailLogCounter,
                sender: from,
                receiver: to,
                subject,
                html,
                status: "error",
                timestamp: new Date(),
                response: err.message,
                shopId,
                uid: uuidv4(),
            },
        });
    });
    return false;
  }
}

export async function sendEmail(
  from = '"Valid Panel" <contact@validpanel.com>',
  type: string,
  data: Record<string, any>,
  shopId: number
): Promise<void> {
  try {
    if (type === "newOrder" && data.price <= 0) return;

    const [general, recipients] = await Promise.all([
      loadGeneralSettings(shopId),
      loadAdminEmails(shopId),
    ]);

    const { subject, html } = await buildEmailTemplate(
      type,
      data,
      general?.logoUrl || "",
      shopId
    );

    await Promise.all(
      recipients.map((to) =>
        dispatchEmail({ from, to, subject, html, shopId })
      )
    );
  } catch (err: any) {
    console.error({ error: err.message });
  }
}

export async function sendUserEmail(
  from = '"Shop" <notifications@validpanel.com>',
  to: string,
  type: string,
  data: Record<string, any>,
  shopId: number
): Promise<void> {
  try {
    const general = await loadGeneralSettings(shopId);
    const { subject, html } = await buildEmailTemplate(
      type,
      data,
      general?.logoUrl || "",
      shopId
    );
    await dispatchEmail({ from, to, subject, html, shopId });
  } catch (err: any) {
    console.error({ error: err.message });
  }
}