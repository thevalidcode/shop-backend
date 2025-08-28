import { CorsOptions, CorsRequest } from "cors";
import { env } from "./env.config";
import { prisma } from "./db.config";
import cors from "cors";

// --- Dynamic CORS Setup ---
let allowedOrigins: string[] = [];

// FIX: Export this function to be awaited at startup
export async function updateAllowedOrigins(): Promise<void> {
  try {
    const shops = await prisma.shop.findMany({
      where: { ssl: true },
    });

    const domains = shops.map((shop: any) => shop.uid);
    allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:7070",
      ...domains.flatMap((domain: string) => [
        `https://${domain}`,
        `https://${domain}:7070`,
      ]),
    ];
  } catch (error) {
    console.error("Failed to update allowed origins:", error);
  }
}

export const openCors = cors({ origin: true, credentials: true });

export const dynamicCors = function (
  req: CorsRequest,
  callback: (err: Error | null, options?: CorsOptions) => void
) {
  const origin = req.headers.origin;

  if (env.NODE_ENV === "development") {
    return callback(null, { origin: true, credentials: true });
  }

  if (!origin) {
    return callback(new Error("Origin header is required by CORS"), {
      origin: false,
    });
  }

  if (allowedOrigins.includes(origin)) {
    return callback(null, { origin: true, credentials: true });
  }

  return callback(new Error("Not allowed by CORS"), { origin: false });
};
