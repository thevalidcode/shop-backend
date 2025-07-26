import { z } from "zod";
export declare const FAQListResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodArray<z.ZodObject<{
                id: z.ZodNumber;
                slug: z.ZodString;
                question: z.ZodString;
                answer: z.ZodString;
                status: z.ZodBoolean;
                position: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                id: number;
                status: boolean;
                slug: string;
                position: number;
                question: string;
                answer: string;
            }, {
                id: number;
                status: boolean;
                slug: string;
                position: number;
                question: string;
                answer: string;
            }>, "many">;
        };
    };
};
export declare const FAQCreatedResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"FAQ added successfully.">;
                faq: z.ZodObject<{
                    id: z.ZodNumber;
                    slug: z.ZodString;
                    question: z.ZodString;
                    answer: z.ZodString;
                    status: z.ZodBoolean;
                    position: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    id: number;
                    status: boolean;
                    slug: string;
                    position: number;
                    question: string;
                    answer: string;
                }, {
                    id: number;
                    status: boolean;
                    slug: string;
                    position: number;
                    question: string;
                    answer: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                success: "FAQ added successfully.";
                faq: {
                    id: number;
                    status: boolean;
                    slug: string;
                    position: number;
                    question: string;
                    answer: string;
                };
            }, {
                success: "FAQ added successfully.";
                faq: {
                    id: number;
                    status: boolean;
                    slug: string;
                    position: number;
                    question: string;
                    answer: string;
                };
            }>;
        };
    };
};
export declare const FAQUpdatedResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"FAQ updated successfully.">;
                faq: z.ZodObject<{
                    id: z.ZodNumber;
                    slug: z.ZodString;
                    question: z.ZodString;
                    answer: z.ZodString;
                    status: z.ZodBoolean;
                    position: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    id: number;
                    status: boolean;
                    slug: string;
                    position: number;
                    question: string;
                    answer: string;
                }, {
                    id: number;
                    status: boolean;
                    slug: string;
                    position: number;
                    question: string;
                    answer: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                success: "FAQ updated successfully.";
                faq: {
                    id: number;
                    status: boolean;
                    slug: string;
                    position: number;
                    question: string;
                    answer: string;
                };
            }, {
                success: "FAQ updated successfully.";
                faq: {
                    id: number;
                    status: boolean;
                    slug: string;
                    position: number;
                    question: string;
                    answer: string;
                };
            }>;
        };
    };
};
export declare const FAQObject: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                faq: z.ZodObject<{
                    id: z.ZodNumber;
                    slug: z.ZodString;
                    question: z.ZodString;
                    answer: z.ZodString;
                    status: z.ZodBoolean;
                    position: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    id: number;
                    status: boolean;
                    slug: string;
                    position: number;
                    question: string;
                    answer: string;
                }, {
                    id: number;
                    status: boolean;
                    slug: string;
                    position: number;
                    question: string;
                    answer: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                faq: {
                    id: number;
                    status: boolean;
                    slug: string;
                    position: number;
                    question: string;
                    answer: string;
                };
            }, {
                faq: {
                    id: number;
                    status: boolean;
                    slug: string;
                    position: number;
                    question: string;
                    answer: string;
                };
            }>;
        };
    };
};
