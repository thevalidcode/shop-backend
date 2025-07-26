"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMultipleFAQs = exports.deleteFAQ = exports.updateFAQ = exports.addFAQ = exports.getFAQByID = exports.getFAQs = void 0;
const faq_schema_1 = require("../schemas/faq.schema");
const common_schema_1 = require("../schemas/common.schema");
const user_schema_1 = require("../schemas/user.schema");
const crud_1 = require("../crud");
const getFAQs = async (req, res) => {
    const parsed = common_schema_1.ShopIdSchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { shop_id } = parsed.data;
    try {
        const faqs = await (0, crud_1.getDocs)("faqs", shop_id);
        const sorted = faqs.sort((a, b) => a.position - b.position);
        res.status(200).json(sorted);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getFAQs = getFAQs;
const getFAQByID = async (req, res) => {
    const parsed = faq_schema_1.faqIdSchema.safeParse(req.params);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { faq_id } = parsed.data;
    const queryParsed = common_schema_1.ShopIdSchema.safeParse(req.query);
    if (!queryParsed.success) {
        res.status(400).json({ error: queryParsed.error.flatten() });
        return;
    }
    const { shop_id } = queryParsed.data;
    try {
        const faq = await (0, crud_1.getDocs)("faqs", shop_id, {
            find: { field: "id", operator: "===", value: faq_id },
        });
        res.status(200).json({ faq });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getFAQByID = getFAQByID;
const addFAQ = async (req, res) => {
    const parsed = faq_schema_1.createFAQSchema.safeParse(req.body);
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { shop_id, role } = authParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Unauthorised User." });
        return;
    }
    try {
        const faqs = await (0, crud_1.getDocs)("faqs", shop_id);
        const newId = faqs.reduce((max, f) => Math.max(max, f.id), 0) + 1;
        const faqData = {
            question: parsed.data.question,
            answer: parsed.data.answer,
            status: "Active",
            position: newId,
        };
        await (0, crud_1.addShopDoc)("faqs", faqData, shop_id);
        res.status(200).json({ success: "FAQ added successfully.", faq: faqData });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.addFAQ = addFAQ;
const updateFAQ = async (req, res) => {
    const parsed = faq_schema_1.updateFAQSchema.safeParse(req.body);
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { uid } = parsed.data;
    const { shop_id, role } = authParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Unauthorised User." });
        return;
    }
    try {
        await (0, crud_1.updateShopDoc)("faqs", uid, parsed.data, shop_id);
        const faq = await (0, crud_1.getDocs)("faqs", shop_id, {
            find: { field: "uid", operator: "===", value: uid },
        });
        res.status(200).json({ success: "FAQ updated successfully.", faq });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateFAQ = updateFAQ;
const deleteFAQ = async (req, res) => {
    const parsed = faq_schema_1.deleteFAQSchema.safeParse(req.body);
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { uid } = parsed.data;
    const { shop_id, role } = authParsed.data;
    if (role === "user") {
        {
            res.status(403).json({ error: "Unauthorised User." });
            return;
        }
    }
    try {
        await (0, crud_1.deleteShopDoc)("faqs", uid, shop_id);
        res.status(200).json({ success: "FAQ deleted successfully." });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteFAQ = deleteFAQ;
const deleteMultipleFAQs = async (req, res) => {
    const parsed = faq_schema_1.deleteMultipleFAQsSchema.safeParse(req.body);
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { uids } = parsed.data;
    const { shop_id, role } = authParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Unauthorised User." });
        return;
    }
    try {
        await (0, crud_1.deleteShopDocs)("faqs", uids, shop_id);
        res.status(200).json({ success: "FAQs deleted successfully." });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteMultipleFAQs = deleteMultipleFAQs;
