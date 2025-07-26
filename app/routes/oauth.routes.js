"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const googleverify_1 = require("../helpers/googleverify");
const crud_1 = require("../crud");
const uuid_1 = require("uuid");
const env_1 = require("../config/env");
const router = express_1.default.Router();
const isValidShopDomain = async (url) => {
    const match = url.match(/^https?:\/\/([^/]+)/i);
    if (!match)
        return false;
    const domain = match[1];
    const shop = await (0, crud_1.getDocs)("shops", null, {
        find: { field: "uid", operator: "===", value: domain },
    });
    return !!shop;
};
// Allow all origins per route
const openCors = (0, cors_1.default)({ origin: true, credentials: true });
router.get("/google", openCors, async (req, res) => {
    const { redirect, shop_id } = req.query;
    if (!redirect || !shop_id) {
        res.status(400).send("Missing redirect or shop_id");
        return;
    }
    const state = encodeURIComponent(JSON.stringify({ redirect, shop_id: Number(shop_id) }));
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${env_1.env.GOOGLE_CLIENT_ID}` +
        `&response_type=code` +
        `&scope=openid%20email%20profile` +
        `&redirect_uri=${encodeURIComponent("https://auth.validpanel.com/api/auth/shop/callback/google")}` +
        `&state=${state}`;
    res.redirect(authUrl);
});
router.get("/callback/google", openCors, async (req, res) => {
    const { code, state } = req.query;
    if (!code || !state) {
        res.status(400).send("Missing code or state");
        return;
    }
    let redirectDomain, shop_id;
    try {
        const parsed = JSON.parse(decodeURIComponent(state));
        redirectDomain = parsed.redirect;
        shop_id = parseInt(parsed.shop_id);
    }
    catch {
        res.status(400).send("Invalid state");
        return;
    }
    const allowed = await isValidShopDomain(redirectDomain);
    if (!allowed) {
        res.status(400).send("Unauthorized domain");
        return;
    }
    try {
        const tokenRes = await axios_1.default.post("https://oauth2.googleapis.com/token", {
            code,
            client_id: env_1.env.GOOGLE_CLIENT_ID,
            client_secret: env_1.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: "https://auth.validpanel.com/api/auth/shop/callback/google",
            grant_type: "authorization_code",
        });
        const { id_token } = tokenRes.data;
        const googleUser = await (0, googleverify_1.verifyGoogleIdToken)(id_token);
        const users = await (0, crud_1.getDocs)("users", shop_id);
        let user = users.find((u) => u.email === googleUser.email);
        if (!user) {
            user = {
                email: googleUser.email,
                username: googleUser.name.replace(/\s/g, "").toLowerCase(),
                image: googleUser.picture,
                password: await bcrypt_1.default.hash(Date.now().toString(), 10),
                api_key: (0, uuid_1.v4)(),
                timestamp: new Date(),
                uid: (0, uuid_1.v4)(),
                role: "user",
            };
            await (0, crud_1.addShopDoc)("users", user, shop_id);
        }
        const token = jsonwebtoken_1.default.sign({ email: user.email, shop_id, api_key: user.api_key }, env_1.env.JWT_SECRET, { expiresIn: "7d" });
        const redirectTo = `${redirectDomain}?token=${token}&email=${encodeURIComponent(user.email)}`;
        res.redirect(redirectTo);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("OAuth failed");
    }
});
exports.default = router;
