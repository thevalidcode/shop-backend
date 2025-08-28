import fs from "fs";
import tls, { SecureContext } from "tls";
import { prisma } from "./db.config";
import { env as processENV } from "./env.config";

const env = processENV.NODE_ENV;

type SSLOptions = {
  [domain: string]: {
    cert: Buffer;
    key: Buffer;
  };
};

const sslOptions: SSLOptions = {};

async function loadCertificates(): Promise<void> {
  const domains = await prisma.shop.findMany({
    where: { ssl: true },
    select: { uid: true },
  });

  domains
    .filter(
      (domain) =>
        domain.uid !== "localhost:5173" && domain.uid !== "localhost:3000"
    )
    .forEach((domain) => {
      if (env === "production") {
        sslOptions[domain.uid] = {
          cert: fs.readFileSync(
            `/etc/ssl/${
              domain.uid.includes("validpanel.com") ? "validpanel.com" : domain
            }/fullchain.crt`
          ),
          key: fs.readFileSync(
            `/etc/ssl/${
              domain.uid.includes("validpanel.com") ? "validpanel.com" : domain
            }/keyfile.key`
          ),
        };
      }
    });
}

async function SNICallback(
  domain: string,
  cb: (err: Error | null, ctx?: SecureContext) => void
): Promise<void> {
  if (domain === "localhost:5173" || domain === "localhost:3000") {
    return cb(new Error("SSL certificate not available for localhost"));
  }

  let ctx = sslOptions[domain];

  if (!ctx) {
    const shop = await prisma.shop.findUnique({
      where: { uid: domain },
    });

    if (shop?.ssl) {
      ctx = {
        cert: fs.readFileSync(
          `/etc/ssl/${
            domain.includes("validpanel.com") ? "validpanel.com" : domain
          }/fullchain.crt`
        ),
        key: fs.readFileSync(
          `/etc/ssl/${
            domain.includes("validpanel.com") ? "validpanel.com" : domain
          }/keyfile.key`
        ),
      };
      sslOptions[domain] = ctx;
    }
  }

  if (ctx) {
    cb(null, tls.createSecureContext(ctx));
  } else {
    cb(new Error(`No SSL certificate available for domain: ${domain}`));
  }
}

// Preload certificates at startup
loadCertificates();

export { sslOptions, SNICallback };
