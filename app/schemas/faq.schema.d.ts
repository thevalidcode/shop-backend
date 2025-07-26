import { z } from "zod";
export declare const faqIdSchema: z.ZodObject<{
    faq_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    faq_id: number;
}, {
    faq_id: number;
}>;
export declare const createFAQSchema: z.ZodObject<{
    question: z.ZodString;
    slug: z.ZodString;
    answer: z.ZodString;
}, "strip", z.ZodTypeAny, {
    slug: string;
    question: string;
    answer: string;
}, {
    slug: string;
    question: string;
    answer: string;
}>;
export declare const FAQSchema: z.ZodObject<{
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
export declare const updateFAQSchema: z.ZodObject<{
    question: z.ZodString;
    slug: z.ZodString;
    answer: z.ZodString;
} & {
    uid: z.ZodString;
}, "strip", z.ZodTypeAny, {
    uid: string;
    slug: string;
    question: string;
    answer: string;
}, {
    uid: string;
    slug: string;
    question: string;
    answer: string;
}>;
export declare const deleteFAQSchema: z.ZodObject<{
    uid: z.ZodString;
}, "strip", z.ZodTypeAny, {
    uid: string;
}, {
    uid: string;
}>;
export declare const deleteMultipleFAQsSchema: z.ZodObject<{
    uids: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    uids: string[];
}, {
    uids: string[];
}>;
