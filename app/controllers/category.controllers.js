"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCategory = exports.deleteMultipleCategory = exports.deleteCategory = exports.updateCategory = exports.getCategoryByID = exports.getCategories = void 0;
const zod_1 = require("zod");
const crud_1 = require("../crud");
const user_schema_1 = require("../schemas/user.schema");
const categoryIdSchema = zod_1.z.object({
    category_id: zod_1.z.coerce.number(),
    shop_id: zod_1.z.coerce.number(),
});
const updateCategorySchema = zod_1.z.object({
    uid: zod_1.z.string(),
    name: zod_1.z.string().optional(),
    position: zod_1.z.coerce.number().optional(),
    description: zod_1.z.string().optional(),
});
const deleteCategorySchema = zod_1.z.object({
    uid: zod_1.z.string(),
});
const getCategories = async (req, res) => {
    const parsed = zod_1.z.object({ shop_id: zod_1.z.coerce.number() }).safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { shop_id } = parsed.data;
    try {
        const categories = await (0, crud_1.getDocs)("categories", shop_id);
        const sorted = categories.sort((a, b) => a.position - b.position);
        res.status(200).json(sorted);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCategories = getCategories;
const getCategoryByID = async (req, res) => {
    const parsed = categoryIdSchema.safeParse(req.params);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { category_id, shop_id } = parsed.data;
    try {
        const category = await (0, crud_1.getDocs)("categories", shop_id, {
            find: { field: "id", operator: "===", value: category_id },
        });
        res.status(200).json({ category });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCategoryByID = getCategoryByID;
const updateCategory = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = updateCategorySchema.safeParse(req.body);
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
        await (0, crud_1.updateShopDoc)("categories", uid, parsed.data, shop_id);
        const category = await (0, crud_1.getDocs)("categories", shop_id, {
            find: { field: "uid", operator: "===", value: uid },
        });
        res
            .status(200)
            .json({ success: "Category updated successfully.", category });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = deleteCategorySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { uid } = parsed.data;
    const { role, shop_id } = authParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Unauthorised User." });
        return;
    }
    try {
        await (0, crud_1.deleteShopDoc)("categories", uid, shop_id);
        res.status(200).json({ success: "Category deleted successfully." });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteCategory = deleteCategory;
const deleteMultipleCategory = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = zod_1.z
        .object({
        uids: zod_1.z.array(zod_1.z.string()),
    })
        .safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { uids } = parsed.data;
    const { role, shop_id } = authParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Unauthorised User." });
        return;
    }
    try {
        await (0, crud_1.deleteShopDocs)("categories", uids, shop_id);
        res.status(200).json({ success: "Categories deleted successfully." });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteMultipleCategory = deleteMultipleCategory;
const addCategory = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = zod_1.z
        .object({
        name: zod_1.z.string(),
        description: zod_1.z.string().optional(),
    })
        .safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { role, shop_id } = authParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Unauthorised User." });
        return;
    }
    try {
        const categories = await (0, crud_1.getDocs)("categories", shop_id);
        const newId = categories.reduce((max, c) => Math.max(max, c.id), 0) + 1;
        const categoryData = {
            name: parsed.data.name,
            description: parsed.data.description || "",
            status: "Active",
            position: newId,
        };
        await (0, crud_1.addShopDoc)("categories", categoryData, shop_id);
        res.status(200).json({
            success: "Category added successfully.",
            category: categoryData,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addCategory = addCategory;
