"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentAdmin = exports.getCurrentUser = exports.getRates = exports.getSiteData = exports.getStyles = exports.getShopCSRFToken = exports.getShopData = void 0;
const zod_1 = require("zod");
const crud_1 = require("../crud");
const storeIdQuerySchema = zod_1.z.object({ domain: zod_1.z.string().min(1) });
const storeIdSchema = zod_1.z.object({ shop_id: zod_1.z.coerce.number() });
const getShopData = async (req, res) => {
    const parsed = storeIdQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { domain } = parsed.data;
    try {
        const shops = await (0, crud_1.getDocs)("shops");
        const shop = shops.find((p) => p.uid === domain);
        if (!shop) {
            res.status(404).json({ error: "Shop not found for the given domain" });
            return;
        }
        res.json({
            shop_id: shop.shop_id,
            plan: shop.plan,
            timestamp: shop.timestamp,
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getShopData = getShopData;
const getShopCSRFToken = async (req, res) => {
    const parsed = storeIdQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { domain } = parsed.data;
    try {
        const shops = await (0, crud_1.getDocs)("shops");
        const shop = shops.find((p) => p.uid === domain);
        if (!shop) {
            res.status(404).json({ error: "Shop not found for the given domain" });
            return;
        }
        res.json({ csrfToken: req.csrfToken() });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getShopCSRFToken = getShopCSRFToken;
const getStyles = async (req, res) => {
    const parsed = storeIdSchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { shop_id } = parsed.data;
    try {
        const result = await (0, crud_1.getDocs)("design_styles", shop_id);
        res.json(result[0]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getStyles = getStyles;
const getSiteData = async (req, res) => {
    const parsed = storeIdSchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { shop_id } = parsed.data;
    try {
        const result = await (0, crud_1.getDocs)("general", shop_id);
        res.json(result[0]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getSiteData = getSiteData;
const getRates = async (_req, res) => {
    try {
        const result = await (0, crud_1.getDocs)("currencies", 1);
        res.json(result[0].quotes);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getRates = getRates;
const getCurrentUser = async (req, res) => {
    if (!req.auth) {
        res.status(401).json({ error: "Unauthorized: auth info missing" });
        return;
    }
    const { uid, shop_id } = req.auth;
    try {
        const result = await (0, crud_1.getDocs)("users", shop_id, {
            find: { field: "uid", operator: "===", value: uid },
            removeKeys: ["password", "api_key"],
        });
        if (!result) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getCurrentUser = getCurrentUser;
const getCurrentAdmin = async (req, res) => {
    if (!req.auth) {
        res.status(401).json({ error: "Unauthorized: auth info missing" });
        return;
    }
    const { shop_id, uid, role } = req.auth;
    if (role !== "admin") {
        res.status(403).json({ error: "Access denied. Admins only." });
        return;
    }
    try {
        const result = await (0, crud_1.getDocs)("admins", shop_id, {
            find: { field: "uid", operator: "===", value: uid },
            removeKeys: ["password", "api_key"],
        });
        if (!result) {
            res.status(404).json({ error: "Admin not found" });
            return;
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getCurrentAdmin = getCurrentAdmin;
