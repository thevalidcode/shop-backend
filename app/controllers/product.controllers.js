"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addProduct = exports.deleteMultipleProduct = exports.deleteProduct = exports.updateProduct = exports.getProductByIDFromAdmin = exports.getProductByID = exports.getProductsForAdmins = exports.getProducts = void 0;
const zod_1 = require("zod");
const crud_1 = require("../crud");
const user_schema_1 = require("../schemas/user.schema");
const product_schema_1 = require("../schemas/product.schema");
const getProductsSchema = zod_1.z.object({
    shop_id: zod_1.z.coerce.number(),
});
const serviceIdSchema = zod_1.z.object({
    product_id: zod_1.z.coerce.number(),
    shop_id: zod_1.z.coerce.number(),
});
const getProducts = async (req, res) => {
    const parsed = getProductsSchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { shop_id } = parsed.data;
    try {
        const products = await (0, crud_1.getDocs)("products", shop_id, {
            filter: { field: "status", operator: "===", value: "active" },
        });
        const sortedProducts = products.sort((a, b) => a.position - b.position);
        res.status(200).json(sortedProducts);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getProducts = getProducts;
const getProductsForAdmins = async (req, res) => {
    const parsed = user_schema_1.AuthSchema.safeParse(req.auth);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { shop_id, role } = parsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Unauthorised User." });
        return;
    }
    try {
        const products = await (0, crud_1.getDocs)("products", shop_id);
        const sortedProducts = products.sort((a, b) => a.position - b.position);
        res.status(200).json(sortedProducts);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getProductsForAdmins = getProductsForAdmins;
const getProductByID = async (req, res) => {
    const parsed = serviceIdSchema.safeParse(req.params);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { shop_id, product_id } = parsed.data;
    try {
        const service = await (0, crud_1.getDocs)("products", shop_id, {
            find: { field: "id", operator: "===", value: product_id },
        });
        res.status(200).json({ service });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getProductByID = getProductByID;
const getProductByIDFromAdmin = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = serviceIdSchema.safeParse(req.params);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { product_id } = parsed.data;
    const { shop_id, role } = authParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Unauthorised User." });
        return;
    }
    try {
        const service = await (0, crud_1.getDocs)("products", shop_id, {
            find: { field: "id", operator: "===", value: product_id },
        });
        res.status(200).json({ service });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getProductByIDFromAdmin = getProductByIDFromAdmin;
const updateProduct = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = product_schema_1.ProductUpdateInputSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const reqData = parsed.data;
    const { shop_id, role } = authParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Unauthorised User." });
        return;
    }
    try {
        await (0, crud_1.updateShopDoc)("products", reqData.uid, reqData, shop_id);
        const service = await (0, crud_1.getDocs)("products", shop_id, {
            find: { field: "uid", operator: "===", value: reqData.uid },
        });
        res.status(200).json({ success: "Product updated successfully.", service });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = product_schema_1.DeleteProductInputSchema.safeParse(req.body);
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
        await (0, crud_1.deleteShopDoc)("products", uid, shop_id);
        res.status(200).json({ success: "Product deleted successfully." });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteProduct = deleteProduct;
const deleteMultipleProduct = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = product_schema_1.DeleteMultipleProductsInputSchema.safeParse(req.body);
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
        await (0, crud_1.deleteShopDocs)("products", uids, shop_id);
        res.status(200).json({ success: "Products deleted successfully." });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteMultipleProduct = deleteMultipleProduct;
const addProduct = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = product_schema_1.ProductCreateInputSchema.safeParse(req.body);
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
        const products = await (0, crud_1.getDocs)("products", shop_id);
        const newId = products.reduce((max, s) => Math.max(max, s.id), 0) + 1;
        const productData = {
            ...parsed.data,
            position: newId,
            shop_id,
            status: "active",
        };
        await (0, crud_1.addShopDoc)("products", productData, shop_id);
        res.status(200).json({
            success: "Product added successfully.",
            product: productData,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addProduct = addProduct;
