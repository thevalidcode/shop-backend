"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpdateOrderStatus = exports.bulkCreateOrders = exports.getOrdersByStatus = exports.deleteOrder = exports.updateOrder = exports.placeOrder = exports.getOrderByID = exports.getOrdersForAdmins = exports.getOrders = void 0;
const crud_1 = require("../crud");
const user_schema_1 = require("../schemas/user.schema");
const order_schema_1 = require("../schemas/order.schema");
const zod_1 = require("zod");
const getOrders = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { role, shop_id, user } = authParsed.data;
    if (role !== "user") {
        res.status(403).json({ error: "Access denied, Users only." });
        return;
    }
    try {
        const orders = await (0, crud_1.getDocs)("orders", shop_id, {
            filter: { user_uid: user.uid },
        });
        const sorted = orders.sort((a, b) => b.id - a.id);
        const parsedOrders = sorted.map((o) => order_schema_1.OrderPublicSchema.safeParse(o).data);
        res.status(200).json(parsedOrders);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getOrders = getOrders;
const getOrdersForAdmins = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { role, shop_id } = authParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Access denied, Admins only." });
        return;
    }
    try {
        const orders = await (0, crud_1.getDocs)("orders", shop_id);
        const sorted = orders.sort((a, b) => b.id - a.id);
        const parsedOrders = sorted.map((o) => order_schema_1.OrderSchema.safeParse(o).data);
        res.status(200).json(parsedOrders);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getOrdersForAdmins = getOrdersForAdmins;
const getOrderByID = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const { order_uid } = req.params;
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { role, shop_id, user } = authParsed.data;
    try {
        const order = await (0, crud_1.getDocs)("orders", shop_id, {
            find: {
                uid: order_uid,
                user_uid: user.uid,
            },
        });
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        const parsedOrder = role === "user"
            ? order_schema_1.OrderPublicSchema.safeParse(order)
            : order_schema_1.OrderSchema.safeParse(order);
        res.status(200).json(parsedOrder.data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getOrderByID = getOrderByID;
const placeOrder = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = order_schema_1.placeOrderSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { shop_id, role } = authParsed.data;
    if (role !== "user") {
        res.status(403).json({ error: "Access denied, Users only." });
        return;
    }
    const reqData = parsed.data;
    try {
        const newOrder = await (0, crud_1.addShopDoc)("orders", reqData, shop_id);
        res
            .status(200)
            .json({ success: "Order placed successfully", uid: newOrder.uid });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.placeOrder = placeOrder;
const updateOrder = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = order_schema_1.updateOrderSchema.safeParse(req.body);
    const { order_uid } = req.params;
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
        res.status(403).json({ error: "Access denied, Admins only." });
        return;
    }
    try {
        await (0, crud_1.updateShopDoc)("orders", order_uid, parsed.data.update, shop_id);
        res.status(200).json({ success: "Order updated successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateOrder = updateOrder;
const deleteOrder = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const { order_uid } = req.params;
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { role, shop_id } = authParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Access denied, Admins only." });
        return;
    }
    try {
        await (0, crud_1.deleteShopDoc)("orders", order_uid, shop_id);
        res.status(200).json({ success: "Order deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteOrder = deleteOrder;
const getOrdersByStatus = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = order_schema_1.getOrdersByStatusSchema
        .extend({
        status: zod_1.z.union([order_schema_1.getOrdersByStatusSchema.shape.status, zod_1.z.literal("all")]),
    })
        .safeParse(req.params);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { shop_id, role, user } = authParsed.data;
    const { status } = parsed.data;
    try {
        const queryOptions = role === "user" ? { filter: { user_uid: user.uid } } : undefined;
        const allOrders = await (0, crud_1.getDocs)("orders", shop_id, queryOptions);
        const filteredOrders = status === "all"
            ? allOrders
            : allOrders.filter((o) => o.status === status);
        const parsedOrders = filteredOrders.map((o) => (role === "user"
            ? order_schema_1.OrderPublicSchema.safeParse(o)
            : order_schema_1.OrderSchema.safeParse(o)).data);
        res.status(200).json(parsedOrders);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getOrdersByStatus = getOrdersByStatus;
const bulkCreateOrders = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = order_schema_1.bulkCreateSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { role, shop_id } = authParsed.data;
    if (role !== "user") {
        res.status(403).json({ error: "Access denied, Users only." });
        return;
    }
    try {
        const results = await Promise.all(parsed.data.orders.map((order) => (0, crud_1.addShopDoc)("orders", order, shop_id)));
        const uids = results.map((r) => r.uid);
        res.status(200).json({ success: "Bulk orders created", uids });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.bulkCreateOrders = bulkCreateOrders;
const bulkUpdateOrderStatus = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = order_schema_1.bulkStatusUpdateSchema.safeParse(req.body);
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
        res.status(403).json({ error: "Access denied, Admins only." });
        return;
    }
    try {
        await Promise.all(parsed.data.updates.map((update) => (0, crud_1.updateShopDoc)("orders", update.uid, { status: update.status }, shop_id)));
        res.status(200).json({ success: "Bulk status update completed" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.bulkUpdateOrderStatus = bulkUpdateOrderStatus;
