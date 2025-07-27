import express from "express";
import axios from "axios";
import bcrypt from "bcrypt";
import cors from "cors";
import jwt from "jsonwebtoken";
import { verifyGoogleIdToken } from "../helpers/googleverify";
import { prisma } from "../config/db";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env";
import { Request, Response } from "express";
import { getNextShopModelId } from "../utils/nextId";

const router = express.Router();

const isValidShopDomain = async (url: string): Promise<boolean> => {
  const match = url.match(/^https?:\/\/([^/]+)/i);
  if (!match) return false;
  const domain = match[1];
  const shop = await prisma.shop.findUnique({ where: { uid: domain } });
  return !!shop;
};

// Allow all origins per route
const openCors = cors({ origin: true, credentials: true });

router.get(
  "/google",
  openCors,
  async (req: Request, res: Response): Promise<void> => {
    const { redirect, shop_id } = req.query;

    if (!redirect || !shop_id) {
      res.status(400).send("Missing redirect or shop_id");
      return;
    }

    const state = encodeURIComponent(
      JSON.stringify({ redirect, shop_id: Number(shop_id) })
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
  }
);

router.get(
  "/callback/google",
  openCors,
  async (req: Request, res: Response): Promise<void> => {
    const { code, state } = req.query;

    if (!code || !state) {
      res.status(400).send("Missing code or state");
      return;
    }

    let redirectDomain: string, shop_id: number;
    try {
      const parsed = JSON.parse(decodeURIComponent(state as string));
      redirectDomain = parsed.redirect;
      shop_id = parseInt(parsed.shop_id);
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
        redirect_uri:
          "https://auth.validpanel.com/api/auth/shop/callback/google",
        grant_type: "authorization_code",
      });

      const { id_token } = tokenRes.data;
      const googleUser = await verifyGoogleIdToken(id_token);

      let user = await prisma.user.findFirst({
        where: {
          email: googleUser.email,
          shopId: shop_id,
        },
      });

      if (!user) {
        const timestamp = new Date();
        const uid = uuidv4();
        const newId = await getNextShopModelId("user", shop_id);

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
            shopId: shop_id,
          },
        });
      }

      const token = jwt.sign(
        { email: user.email, shop_id, api_key: user.apiKey },
        env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const redirectTo = `${redirectDomain}?token=${token}&email=${encodeURIComponent(
        user.email
      )}`;
      res.redirect(redirectTo);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send("OAuth failed");
    }
  }
);

export default router;
