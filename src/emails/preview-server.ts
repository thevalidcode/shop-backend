/*
 Simple email preview server.
 Run with: `npx tsx src/emails/preview-server.ts`
 It serves simple pages to preview templates in the browser.
*/

import http from "http";
import { getTemplate } from "./templates";

const port = process.env.PORT ? Number(process.env.PORT) : 3005;

const shopSettings = {
  logoUrl: "https://validpanel.com/logo.png",
  shopName: "Demo Shop",
  shopUrl: "https://demo.example.com",
  // optionally set designColors here to test themeing
};

const templates: { [k: string]: { title: string; render: () => any } } = {
  // User
  "user/welcome": {
    title: "User - Welcome",
    render: () =>
      getTemplate(
        "WELCOME_EMAIL",
        {
          userName: "Jane Doe",
          userEmail: "jane@example.com",
          dashboardUrl: `${shopSettings.shopUrl}/dashboard`,
        },
        shopSettings,
      ),
  },
  "user/forgot-password": {
    title: "User - Forgot Password",
    render: () =>
      getTemplate(
        "FORGOT_PASSWORD",
        { email: "jane@example.com", token: "tok_ABC123" },
        shopSettings,
      ),
  },
  "user/password-changed": {
    title: "User - Password Changed",
    render: () =>
      getTemplate(
        "PASSWORD_CHANGED",
        {
          logo: shopSettings.logoUrl,
          shopName: shopSettings.shopName,
          shopUrl: shopSettings.shopUrl,
        },
        shopSettings,
      ),
  },

  // Orders
  "order/confirmed": {
    title: "Order - Confirmed",
    render: () =>
      getTemplate(
        "ORDER_CONFIRMED",
        {
          orderRef: "ORD-12345",
          orderDate: new Date().toLocaleString(),
          items: [
            { name: "Blue T-Shirt", quantity: 1, price: 19.99 },
            { name: "Sticker Pack", quantity: 2, price: 4.5 },
          ],
          subtotal: 28.99,
          tax: 2.32,
          shipping: 3.5,
          total: 34.81,
          currency: "$",
          billingName: "Jane Doe",
          billingAddress: "123 Main St, City, Country",
          orderUrl: `${shopSettings.shopUrl}/orders/ORD-12345`,
        },
        shopSettings,
      ),
  },
  "order/shipped": {
    title: "Order - Shipped",
    render: () =>
      getTemplate(
        "ORDER_SHIPPED",
        {
          orderRef: "ORD-12345",
          trackingNumber: "TRK-987654",
          trackingUrl: "https://tracking.example.com/TRK-987654",
          estimatedDelivery: new Date(
            Date.now() + 4 * 24 * 3600 * 1000,
          ).toLocaleDateString(),
          items: [{ name: "Blue T-Shirt", quantity: 1 }],
          orderUrl: `${shopSettings.shopUrl}/orders/ORD-12345`,
        },
        shopSettings,
      ),
  },

  // Payments
  "payment/success": {
    title: "Payment - Successful",
    render: () =>
      getTemplate(
        "PAYMENT_SUCCESSFUL",
        {
          userName: "Jane Doe",
          orderRef: "ORD-12345",
          amount: 34.81,
          currency: "$",
          paymentMethod: "Stripe",
          paymentDate: new Date().toLocaleString(),
          transactionId: "TXN-0001",
          orderUrl: `${shopSettings.shopUrl}/orders/ORD-12345`,
        },
        shopSettings,
      ),
  },
  "payment/failure": {
    title: "Payment - Failed",
    render: () =>
      getTemplate(
        "PAYMENT_FAILED",
        {
          userName: "Jane Doe",
          orderRef: "ORD-12345",
          amount: 34.81,
          currency: "$",
          failureReason: "Card declined",
          retryUrl: `${shopSettings.shopUrl}/checkout/ORD-12345`,
          supportUrl: `${shopSettings.shopUrl}/contact`,
        },
        shopSettings,
      ),
  },

  // Support
  "support/ticket-created": {
    title: "Support - Ticket Created",
    render: () =>
      getTemplate(
        "TICKET_CREATED",
        {
          userName: "Jane Doe",
          ticketId: "TCKT-200",
          subject: "Issue with my order",
          message: "My package hasn't arrived yet.",
          priority: "MEDIUM",
          ticketUrl: `${shopSettings.shopUrl}/support/TCKT-200`,
        },
        shopSettings,
      ),
  },
  "admin/new-ticket": {
    title: "Admin - New Ticket Notification",
    render: () =>
      getTemplate(
        "NEW_TICKET_NOTIFICATION",
        {
          userName: "Jane Doe",
          userEmail: "jane@example.com",
          ticketId: "TCKT-200",
          subject: "Issue with my order",
          message: "My package hasn't arrived yet.",
          priority: "MEDIUM",
          adminDashboardUrl: `${shopSettings.shopUrl}/admin/support`,
        },
        shopSettings,
      ),
  },

  // Reviews
  "review/approved": {
    title: "Review - Approved",
    render: () =>
      getTemplate(
        "REVIEW_APPROVED",
        {
          userName: "Jane Doe",
          productName: "Blue T-Shirt",
          productUrl: `${shopSettings.shopUrl}/products/blue-tshirt`,
          rating: 5,
          reviewComment: "Love it — great fit and fabric!",
        },
        shopSettings,
      ),
  },
  "review/new-notification": {
    title: "Admin - New Review Notification",
    render: () =>
      getTemplate(
        "NEW_REVIEW_NOTIFICATION",
        {
          userName: "Jane Doe",
          productName: "Blue T-Shirt",
          productUrl: `${shopSettings.shopUrl}/products/blue-tshirt`,
          rating: 4,
          reviewComment: "Nice shirt, slightly large.",
          reviewTitle: "Good quality",
          isVerified: true,
          adminDashboardUrl: `${shopSettings.shopUrl}/admin/reviews`,
        },
        shopSettings,
      ),
  },

  // Shipping
  "shipping/shipment-created": {
    title: "Shipping - Shipment Created",
    render: () =>
      getTemplate(
        "SHIPMENT_CREATED",
        {
          userName: "Jane Doe",
          shipmentId: "SHP-555",
          carrierName: "Acme Shipping",
          trackingNumber: "TRK-987654",
          trackingUrl: "https://tracking.example.com/TRK-987654",
          estimatedDelivery: new Date(
            Date.now() + 3 * 24 * 3600 * 1000,
          ).toLocaleDateString(),
          items: [{ name: "Blue T-Shirt", quantity: 1 }],
          shipmentUrl: `${shopSettings.shopUrl}/shipments/SHP-555`,
        },
        shopSettings,
      ),
  },

  // Admin order notification
  "admin/new-order": {
    title: "Admin - New Order Notification",
    render: () =>
      getTemplate(
        "NEW_ORDER_NOTIFICATION",
        {
          orderRef: "ORD-12345",
          customerName: "Jane Doe",
          customerEmail: "jane@example.com",
          total: 34.81,
          currency: "$",
          items: [{ name: "Blue T-Shirt", quantity: 1, price: 19.99 }],
          adminDashboardUrl: `${shopSettings.shopUrl}/admin/orders/ORD-12345`,
        },
        shopSettings,
      ),
  },
};

const indexHtml = () => {
  const links = Object.keys(templates)
    .map((k) => `<li><a href="/${k}">${templates[k].title}</a></li>`)
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Email previews</title></head><body><h1>Email previews</h1><ul>${links}</ul><p>Run with: <code>npx ts-node src/emails/preview-server.ts</code></p></body></html>`;
};

const server = http.createServer((req, res) => {
  if (!req.url) return;
  const path = req.url.replace(/^\//, "");
  if (path === "" || path === "index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(indexHtml());
    return;
  }
  const tpl = templates[path];
  if (!tpl) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found. See / for available previews.");
    return;
  }

  try {
    const result = tpl.render();
    let html: string;
    if (typeof result === "string") html = result;
    else if (result && typeof (result as any).html === "string")
      html = (result as any).html;
    else if (result && typeof (result as any).children === "string")
      html = (result as any).children;
    else html = String(result);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  } catch (err: any) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(`Error rendering template: ${err?.message || String(err)}`);
  }
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Email preview server running: http://localhost:${port}`);
});
