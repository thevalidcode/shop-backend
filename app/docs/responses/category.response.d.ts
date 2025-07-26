import { z } from "zod";
export declare const CategoryListResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodArray<z.ZodObject<{
                id: z.ZodNumber;
                uid: z.ZodString;
                name: z.ZodString;
                slug: z.ZodString;
                description: z.ZodString;
                status: z.ZodString;
                position: z.ZodNumber;
                image_url: z.ZodNullable<z.ZodString>;
                banner_url: z.ZodNullable<z.ZodString>;
                icon_url: z.ZodNullable<z.ZodString>;
                parent_uid: z.ZodNullable<z.ZodString>;
                shop_id: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                id: number;
                name: string;
                shop_id: number;
                uid: string;
                description: string;
                status: string;
                slug: string;
                position: number;
                image_url: string | null;
                banner_url: string | null;
                icon_url: string | null;
                parent_uid: string | null;
            }, {
                id: number;
                name: string;
                shop_id: number;
                uid: string;
                description: string;
                status: string;
                slug: string;
                position: number;
                image_url: string | null;
                banner_url: string | null;
                icon_url: string | null;
                parent_uid: string | null;
            }>, "many">;
        };
    };
};
export declare const CategoryCreatedResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Category added successfully.">;
                category: z.ZodObject<{
                    id: z.ZodNumber;
                    uid: z.ZodString;
                    name: z.ZodString;
                    slug: z.ZodString;
                    description: z.ZodString;
                    status: z.ZodString;
                    position: z.ZodNumber;
                    image_url: z.ZodNullable<z.ZodString>;
                    banner_url: z.ZodNullable<z.ZodString>;
                    icon_url: z.ZodNullable<z.ZodString>;
                    parent_uid: z.ZodNullable<z.ZodString>;
                    shop_id: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    id: number;
                    name: string;
                    shop_id: number;
                    uid: string;
                    description: string;
                    status: string;
                    slug: string;
                    position: number;
                    image_url: string | null;
                    banner_url: string | null;
                    icon_url: string | null;
                    parent_uid: string | null;
                }, {
                    id: number;
                    name: string;
                    shop_id: number;
                    uid: string;
                    description: string;
                    status: string;
                    slug: string;
                    position: number;
                    image_url: string | null;
                    banner_url: string | null;
                    icon_url: string | null;
                    parent_uid: string | null;
                }>;
            }, "strip", z.ZodTypeAny, {
                category: {
                    id: number;
                    name: string;
                    shop_id: number;
                    uid: string;
                    description: string;
                    status: string;
                    slug: string;
                    position: number;
                    image_url: string | null;
                    banner_url: string | null;
                    icon_url: string | null;
                    parent_uid: string | null;
                };
                success: "Category added successfully.";
            }, {
                category: {
                    id: number;
                    name: string;
                    shop_id: number;
                    uid: string;
                    description: string;
                    status: string;
                    slug: string;
                    position: number;
                    image_url: string | null;
                    banner_url: string | null;
                    icon_url: string | null;
                    parent_uid: string | null;
                };
                success: "Category added successfully.";
            }>;
        };
    };
};
export declare const CategoryUpdatedResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Category updated successfully.">;
                category: z.ZodObject<{
                    id: z.ZodNumber;
                    uid: z.ZodString;
                    name: z.ZodString;
                    slug: z.ZodString;
                    description: z.ZodString;
                    status: z.ZodString;
                    position: z.ZodNumber;
                    image_url: z.ZodNullable<z.ZodString>;
                    banner_url: z.ZodNullable<z.ZodString>;
                    icon_url: z.ZodNullable<z.ZodString>;
                    parent_uid: z.ZodNullable<z.ZodString>;
                    shop_id: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    id: number;
                    name: string;
                    shop_id: number;
                    uid: string;
                    description: string;
                    status: string;
                    slug: string;
                    position: number;
                    image_url: string | null;
                    banner_url: string | null;
                    icon_url: string | null;
                    parent_uid: string | null;
                }, {
                    id: number;
                    name: string;
                    shop_id: number;
                    uid: string;
                    description: string;
                    status: string;
                    slug: string;
                    position: number;
                    image_url: string | null;
                    banner_url: string | null;
                    icon_url: string | null;
                    parent_uid: string | null;
                }>;
            }, "strip", z.ZodTypeAny, {
                category: {
                    id: number;
                    name: string;
                    shop_id: number;
                    uid: string;
                    description: string;
                    status: string;
                    slug: string;
                    position: number;
                    image_url: string | null;
                    banner_url: string | null;
                    icon_url: string | null;
                    parent_uid: string | null;
                };
                success: "Category updated successfully.";
            }, {
                category: {
                    id: number;
                    name: string;
                    shop_id: number;
                    uid: string;
                    description: string;
                    status: string;
                    slug: string;
                    position: number;
                    image_url: string | null;
                    banner_url: string | null;
                    icon_url: string | null;
                    parent_uid: string | null;
                };
                success: "Category updated successfully.";
            }>;
        };
    };
};
export declare const CategoryObject: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                category: z.ZodObject<{
                    id: z.ZodNumber;
                    uid: z.ZodString;
                    name: z.ZodString;
                    slug: z.ZodString;
                    description: z.ZodString;
                    status: z.ZodString;
                    position: z.ZodNumber;
                    image_url: z.ZodNullable<z.ZodString>;
                    banner_url: z.ZodNullable<z.ZodString>;
                    icon_url: z.ZodNullable<z.ZodString>;
                    parent_uid: z.ZodNullable<z.ZodString>;
                    shop_id: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    id: number;
                    name: string;
                    shop_id: number;
                    uid: string;
                    description: string;
                    status: string;
                    slug: string;
                    position: number;
                    image_url: string | null;
                    banner_url: string | null;
                    icon_url: string | null;
                    parent_uid: string | null;
                }, {
                    id: number;
                    name: string;
                    shop_id: number;
                    uid: string;
                    description: string;
                    status: string;
                    slug: string;
                    position: number;
                    image_url: string | null;
                    banner_url: string | null;
                    icon_url: string | null;
                    parent_uid: string | null;
                }>;
            }, "strip", z.ZodTypeAny, {
                category: {
                    id: number;
                    name: string;
                    shop_id: number;
                    uid: string;
                    description: string;
                    status: string;
                    slug: string;
                    position: number;
                    image_url: string | null;
                    banner_url: string | null;
                    icon_url: string | null;
                    parent_uid: string | null;
                };
            }, {
                category: {
                    id: number;
                    name: string;
                    shop_id: number;
                    uid: string;
                    description: string;
                    status: string;
                    slug: string;
                    position: number;
                    image_url: string | null;
                    banner_url: string | null;
                    icon_url: string | null;
                    parent_uid: string | null;
                };
            }>;
        };
    };
};
