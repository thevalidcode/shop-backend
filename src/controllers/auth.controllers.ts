import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { v4 as uuidv4 } from "uuid";
import type { Request, Response } from "express";
import { verifyGoogleIdToken } from "../helpers/googleverify";
import axios from "axios";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import { getNextShopModelId } from "../utils/nextId";
import { env } from "../config/env";

const isValidShopDomain = async (url: string): Promise<boolean> => {
  const match = url.match(/^https?:\/\/([^/]+)/i);
  if (!match) return false;
  const domain = match[1];
  const shop = await prisma.shop.findUnique({ where: { uid: domain } });
  return !!shop;
};

export const redirectToGoogle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { redirect, shopId } = req.query;

  if (!redirect || !shopId) {
    res.status(400).send("Missing redirect or shopId");
    return;
  }

  const state = encodeURIComponent(
    JSON.stringify({ redirect, shopId: Number(shopId) })
  );

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${env.GOOGLE_CLIENT_ID}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile` +
    `&redirect_uri=${encodeURIComponent(
      "https://auth.validpanel.com/api/auth/shop/callback/google"
    )}` +
    `&state=${state}`;

  res.redirect(authUrl);
};

export const googleCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { code, state } = req.query;

  if (!code || !state) {
    res.status(400).send("Missing code or state");
    return;
  }

  let redirectDomain: string, shopId: number;
  try {
    const parsed = JSON.parse(decodeURIComponent(state as string));
    redirectDomain = parsed.redirect;
    shopId = parseInt(parsed.shopId);
  } catch {
    res.status(400).send("Invalid state");
    return;
  }

  const allowed = await isValidShopDomain(redirectDomain);
  if (!allowed) {
    res.status(400).send("Unauthorized domain");
    return;
  }

  try {
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: "https://auth.validpanel.com/api/auth/shop/callback/google",
      grant_type: "authorization_code",
    });

    const { id_token } = tokenRes.data;
    const googleUser = await verifyGoogleIdToken(id_token);

    let user = await prisma.user.findFirst({
      where: { email: googleUser.email, shopId },
    });

    if (!user) {
      const timestamp = new Date();
      const uid = uuidv4();
      const newId = await getNextShopModelId("user", shopId);

      user = await prisma.user.create({
        data: {
          id: newId,
          email: googleUser.email,
          username: googleUser.name.replace(/\s/g, "").toLowerCase(),
          image: googleUser.picture,
          password: await bcrypt.hash(Date.now().toString(), 10),
          apiKey: uuidv4(),
          timestamp,
          uid,
          role: "user",
          shopId,
        },
      });
    }

    // Generate short-lived session code
    const sessionCode = uuidv4();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 mins

    await prisma.sessionCode.create({
      data: {
        code: sessionCode,
        email: user.email,
        shopId,
        expiresAt,
        used: false,
      },
    });

    // Redirect to frontend with session code
    res.redirect(`${redirectDomain}?session_code=${sessionCode}`);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("OAuth failed");
  }
};

export const verifySessionCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { sessionCode } = req.body;

  if (!sessionCode || typeof sessionCode !== "string") {
    res.status(400).json({ error: "Invalid session code" });
    return;
  }

  const session = await prisma.sessionCode.findUnique({
    where: { code: sessionCode },
  });

  if (!session || session.used || session.expiresAt < new Date()) {
    res.status(400).json({ error: "Session code expired or invalid" });
    return;
  }

  const user = await prisma.user.findFirst({
    where: { email: session.email, shopId: session.shopId },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // Mark session code as used
  await prisma.sessionCode.update({
    where: { code: sessionCode },
    data: { used: true },
  });

  const token = jwt.sign(
    { email: user.email, shopId: user.shopId, apiKey: user.apiKey },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  const csrfToken = randomBytes(32).toString("hex");

  res.cookie("csrf_token", csrfToken, {
    httpOnly: false,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ role: user.role });
};
