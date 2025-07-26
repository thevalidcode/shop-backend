"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendUserEmail = sendUserEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const crud_1 = require("../crud");
const templates_1 = require("./templates");
const transporter = nodemailer_1.default.createTransport({
    sendmail: true,
    newline: "unix",
    path: "/usr/sbin/sendmail",
});
function interpolate(template, variables) {
    return template.replace(/\{\{(.*?)\}\}/g, (_, key) => variables[key.trim()] ?? "");
}
async function loadGeneralSettings(shop_id) {
    const general = await (0, crud_1.getDocs)("general", shop_id);
    return general[0];
}
async function loadAdminEmails(shop_id) {
    const docs = await (0, crud_1.getDocs)("admin_emails", shop_id);
    return docs.map((doc) => doc.emails);
}
async function buildEmailTemplate(type, data, logo_url, shop_id) {
    const template = await (0, crud_1.getDocs)("email_templates", shop_id, {
        find: { type },
    });
    const variables = { logo: logo_url || "", ...data };
    const htmlFromDb = interpolate(template?.content || "", variables);
    const fallbackHtml = (0, templates_1.getTemplate)(type, variables);
    const subject = type
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase())
        .trim() + " Notification";
    return {
        subject,
        html: htmlFromDb || fallbackHtml,
    };
}
async function dispatchEmail({ from, to, subject, html, shop_id, }) {
    try {
        const result = await transporter.sendMail({ from, to, subject, html });
        await (0, crud_1.addShopDoc)("email_logs", {
            sender: from,
            receiver: to,
            subject,
            html,
            status: "success",
            timestamp: new Date(),
            message_id: result.messageId,
            response: result.response,
        }, shop_id);
        return true;
    }
    catch (err) {
        await (0, crud_1.addShopDoc)("email_logs", {
            sender: from,
            receiver: to,
            subject,
            html,
            status: "error",
            timestamp: new Date(),
            response: err.message,
        }, shop_id);
        return false;
    }
}
async function sendEmail(from = '"Valid Panel" <contact@validpanel.com>', type, data, shop_id) {
    try {
        if (type === "new_order" && data.price <= 0)
            return;
        const [logo, recipients] = await Promise.all([
            loadGeneralSettings(shop_id).then((g) => g.logo_url),
            loadAdminEmails(shop_id),
        ]);
        const { subject, html } = await buildEmailTemplate(type, data, logo, shop_id);
        await Promise.all(recipients.map((to) => dispatchEmail({ from, to, subject, html, shop_id })));
    }
    catch (err) {
        console.error({ error: err.message });
    }
}
async function sendUserEmail(from = '"Shop" <notifications@validpanel.com>', to, type, data, shop_id) {
    try {
        const logo = (await loadGeneralSettings(shop_id)).logo_url;
        const { subject, html } = await buildEmailTemplate(type, data, logo, shop_id);
        await dispatchEmail({ from, to, subject, html, shop_id });
    }
    catch (err) {
        console.error({ error: err.message });
    }
}
