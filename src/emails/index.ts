import nodemailer from "nodemailer";
import { prisma } from "../config/db";
import { getTemplate } from "./templates";
import { v4 as uuidv4 } from "uuid";
import { getNextShopModelId } from "../utils/nextId";

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

async function loadGeneralSettings(shop_id: number) {
  return prisma.general.findFirst({
    where: { shopId: shop_id },
  });
}

async function loadAdminEmails(shop_id: number): Promise<string[]> {
  const records = await prisma.adminEmail.findMany({
    where: { shopId: shop_id },
    select: { emails: true },
  });
  return records.map((r) => r.emails).flat();
}

async function buildEmailTemplate(
  type: string,
  data: Record<string, any>,
  logo_url: string,
  shop_id: number
): Promise<{ subject: string; html: string }> {
  const template = await prisma.emailTemplate.findFirst({
    where: {
      shopId: shop_id,
      type,
    },
  });

  const variables = { logo: logo_url || "", ...data };
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
  shop_id,
}: {
  from: string;
  to: string;
  subject: string;
  html: string;
  shop_id: number;
}): Promise<boolean> {
  const newId = await getNextShopModelId("emailLog", shop_id);
  try {
    const result = await transporter.sendMail({ from, to, subject, html });
    await prisma.emailLog.create({
      data: {
        id: newId,
        sender: from,
        receiver: to,
        subject,
        html,
        status: "success",
        timestamp: new Date(),
        messageId: result.messageId,
        response: result.response,
        shopId: shop_id,
        uid: uuidv4(),
      },
    });

    return true;
  } catch (err: any) {
    await prisma.emailLog.create({
      data: {
        id: newId,
        sender: from,
        receiver: to,
        subject,
        html,
        status: "error",
        timestamp: new Date(),
        response: err.message,
        shopId: shop_id,
        uid: uuidv4(),
      },
    });
    return false;
  }
}

export async function sendEmail(
  from = '"Valid Panel" <contact@validpanel.com>',
  type: string,
  data: Record<string, any>,
  shop_id: number
): Promise<void> {
  try {
    if (type === "new_order" && data.price <= 0) return;

    const [general, recipients] = await Promise.all([
      loadGeneralSettings(shop_id),
      loadAdminEmails(shop_id),
    ]);

    const { subject, html } = await buildEmailTemplate(
      type,
      data,
      general?.logoUrl || "",
      shop_id
    );

    await Promise.all(
      recipients.map((to) =>
        dispatchEmail({ from, to, subject, html, shop_id })
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
  shop_id: number
): Promise<void> {
  try {
    const general = await loadGeneralSettings(shop_id);
    const { subject, html } = await buildEmailTemplate(
      type,
      data,
      general?.logoUrl || "",
      shop_id
    );
    await dispatchEmail({ from, to, subject, html, shop_id });
  } catch (err: any) {
    console.error({ error: err.message });
  }
}
