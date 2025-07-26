import { z } from "zod";
export declare const BlogListResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodArray<z.ZodObject<{
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
            }>, "many">;
        };
    };
};
export declare const BlogCreatedResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Blog added successfully.">;
                blog: z.ZodObject<{
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
            }, "strip", z.ZodTypeAny, {
                success: "Blog added successfully.";
                blog: {
                    id: number;
                    content: string;
                    title: string;
                    status: boolean;
                    slug: string;
                    position: number;
                    description?: string | undefined;
                };
            }, {
                success: "Blog added successfully.";
                blog: {
                    id: number;
                    content: string;
                    title: string;
                    status: boolean;
                    slug: string;
                    position: number;
                    description?: string | undefined;
                };
            }>;
        };
    };
};
export declare const BlogUpdatedResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Blog updated successfully.">;
                blog: z.ZodObject<{
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
            }, "strip", z.ZodTypeAny, {
                success: "Blog updated successfully.";
                blog: {
                    id: number;
                    content: string;
                    title: string;
                    status: boolean;
                    slug: string;
                    position: number;
                    description?: string | undefined;
                };
            }, {
                success: "Blog updated successfully.";
                blog: {
                    id: number;
                    content: string;
                    title: string;
                    status: boolean;
                    slug: string;
                    position: number;
                    description?: string | undefined;
                };
            }>;
        };
    };
};
export declare const BlogObject: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                blog: z.ZodObject<{
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
            }, "strip", z.ZodTypeAny, {
                blog: {
                    id: number;
                    content: string;
                    title: string;
                    status: boolean;
                    slug: string;
                    position: number;
                    description?: string | undefined;
                };
            }, {
                blog: {
                    id: number;
                    content: string;
                    title: string;
                    status: boolean;
                    slug: string;
                    position: number;
                    description?: string | undefined;
                };
            }>;
        };
    };
};
