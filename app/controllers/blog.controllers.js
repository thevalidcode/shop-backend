"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMultipleBlogs = exports.deleteBlog = exports.updateBlog = exports.addBlog = exports.getBlogByID = exports.getBlogs = void 0;
const user_schema_1 = require("../schemas/user.schema");
const crud_1 = require("../crud");
const common_schema_1 = require("../schemas/common.schema");
const blog_schema_1 = require("../schemas/blog.schema");
const getBlogs = async (req, res) => {
    const parsed = common_schema_1.ShopIdSchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { shop_id } = parsed.data;
    try {
        const blogs = await (0, crud_1.getDocs)("blogs", shop_id);
        const sorted = blogs.sort((a, b) => a.position - b.position);
        res.status(200).json(sorted);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getBlogs = getBlogs;
const getBlogByID = async (req, res) => {
    const parsed = blog_schema_1.blogIdSchema.safeParse(req.params);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { blog_id } = parsed.data;
    const queryParsed = common_schema_1.ShopIdSchema.safeParse(req.query);
    if (!queryParsed.success) {
        res.status(400).json({ error: queryParsed.error.flatten() });
        return;
    }
    const { shop_id } = queryParsed.data;
    try {
        const blog = await (0, crud_1.getDocs)("blogs", shop_id, {
            find: { field: "id", operator: "===", value: blog_id },
        });
        res.status(200).json({ blog });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getBlogByID = getBlogByID;
const addBlog = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = blog_schema_1.createBlogSchema.safeParse(req.body);
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
        const blogs = await (0, crud_1.getDocs)("blogs", shop_id);
        const newId = blogs.reduce((max, b) => Math.max(max, b.id), 0) + 1;
        const blogData = {
            title: parsed.data.title,
            content: parsed.data.content,
            description: parsed.data.description || "",
            status: "Active",
            position: newId,
        };
        await (0, crud_1.addShopDoc)("blogs", blogData, shop_id);
        res.status(200).json({
            success: "Blog added successfully.",
            blog: blogData,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addBlog = addBlog;
const updateBlog = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = blog_schema_1.updateBlogSchema.safeParse(req.body);
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
        await (0, crud_1.updateShopDoc)("blogs", uid, parsed.data, shop_id);
        const blog = await (0, crud_1.getDocs)("blogs", shop_id, {
            find: { field: "uid", operator: "===", value: uid },
        });
        res.status(200).json({ success: "Blog updated successfully.", blog });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateBlog = updateBlog;
const deleteBlog = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = blog_schema_1.deleteBlogSchema.safeParse(req.body);
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
        await (0, crud_1.deleteShopDoc)("blogs", uid, shop_id);
        res.status(200).json({ success: "Blog deleted successfully." });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteBlog = deleteBlog;
const deleteMultipleBlogs = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = blog_schema_1.deleteMultipleBlogsSchema.safeParse(req.body);
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
        await (0, crud_1.deleteShopDocs)("blogs", uids, shop_id);
        res.status(200).json({ success: "Blogs deleted successfully." });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteMultipleBlogs = deleteMultipleBlogs;
