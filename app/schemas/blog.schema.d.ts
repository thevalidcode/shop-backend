import { z } from "zod";
export declare const blogIdSchema: z.ZodObject<{
    blog_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    blog_id: number;
}, {
    blog_id: number;
}>;
export declare const createBlogSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodString;
    content: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    content: string;
    title: string;
    slug: string;
    description?: string | undefined;
}, {
    content: string;
    title: string;
    slug: string;
    description?: string | undefined;
}>;
export declare const BlogSchema: z.ZodObject<{
    id: z.ZodNumber;
    title: z.ZodString;
    content: z.ZodString;
    slug: z.ZodString;
    status: z.ZodBoolean;
    position: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: number;
    content: string;
    title: string;
    status: boolean;
    slug: string;
    position: number;
    description?: string | undefined;
}, {
    id: number;
    content: string;
    title: string;
    status: boolean;
    slug: string;
    position: number;
    description?: string | undefined;
}>;
export declare const updateBlogSchema: z.ZodObject<{
    uid: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    content: string;
    uid: string;
    title: string;
    slug: string;
    description?: string | undefined;
}, {
    content: string;
    uid: string;
    title: string;
    slug: string;
    description?: string | undefined;
}>;
export declare const deleteBlogSchema: z.ZodObject<{
    uid: z.ZodString;
}, "strip", z.ZodTypeAny, {
    uid: string;
}, {
    uid: string;
}>;
export declare const deleteMultipleBlogsSchema: z.ZodObject<{
    uids: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    uids: string[];
}, {
    uids: string[];
}>;
export declare const getBlogsSchema: z.ZodObject<{
    shop_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    shop_id: number;
}, {
    shop_id: number;
}>;
