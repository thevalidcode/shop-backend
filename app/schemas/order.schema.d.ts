import { z } from "zod";
export declare const OrderPublicSchema: z.ZodObject<{
    id: z.ZodNumber;
    uid: z.ZodString;
    user_uid: z.ZodString;
    product_id: z.ZodNumber;
    price: z.ZodNumber;
    quantity: z.ZodNumber;
    currency: z.ZodString;
    status: z.ZodEnum<["Pending", "Processing", "Shipped", "Delivered", "Completed", "Canceled", "Failed", "Refunded", "Returned"]>;
    shipping_address: z.ZodString;
    billing_address: z.ZodString;
    payment_method: z.ZodString;
    tracking_number: z.ZodNullable<z.ZodString>;
    estimated_delivery: z.ZodNullable<z.ZodString>;
    delivered_at: z.ZodNullable<z.ZodString>;
    timestamp: z.ZodString;
}, "strict", z.ZodTypeAny, {
    id: number;
    price: number;
    product_id: number;
    currency: string;
    uid: string;
    status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Completed" | "Canceled" | "Failed" | "Refunded" | "Returned";
    timestamp: string;
    user_uid: string;
    quantity: number;
    shipping_address: string;
    billing_address: string;
    payment_method: string;
    tracking_number: string | null;
    estimated_delivery: string | null;
    delivered_at: string | null;
}, {
    id: number;
    price: number;
    product_id: number;
    currency: string;
    uid: string;
    status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Completed" | "Canceled" | "Failed" | "Refunded" | "Returned";
    timestamp: string;
    user_uid: string;
    quantity: number;
    shipping_address: string;
    billing_address: string;
    payment_method: string;
    tracking_number: string | null;
    estimated_delivery: string | null;
    delivered_at: string | null;
}>;
export declare const OrderSchema: z.ZodObject<{
    id: z.ZodNumber;
    uid: z.ZodString;
    user_uid: z.ZodString;
    product_id: z.ZodNumber;
    price: z.ZodNumber;
    quantity: z.ZodNumber;
    currency: z.ZodString;
    status: z.ZodEnum<["Pending", "Processing", "Shipped", "Delivered", "Completed", "Canceled", "Failed", "Refunded", "Returned"]>;
    shipping_address: z.ZodString;
    billing_address: z.ZodString;
    payment_method: z.ZodString;
    tracking_number: z.ZodNullable<z.ZodString>;
    estimated_delivery: z.ZodNullable<z.ZodString>;
    delivered_at: z.ZodNullable<z.ZodString>;
    timestamp: z.ZodString;
}, "strict", z.ZodTypeAny, {
    id: number;
    price: number;
    product_id: number;
    currency: string;
    uid: string;
    status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Completed" | "Canceled" | "Failed" | "Refunded" | "Returned";
    timestamp: string;
    user_uid: string;
    quantity: number;
    shipping_address: string;
    billing_address: string;
    payment_method: string;
    tracking_number: string | null;
    estimated_delivery: string | null;
    delivered_at: string | null;
}, {
    id: number;
    price: number;
    product_id: number;
    currency: string;
    uid: string;
    status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Completed" | "Canceled" | "Failed" | "Refunded" | "Returned";
    timestamp: string;
    user_uid: string;
    quantity: number;
    shipping_address: string;
    billing_address: string;
    payment_method: string;
    tracking_number: string | null;
    estimated_delivery: string | null;
    delivered_at: string | null;
}>;
export declare const placeOrderSchema: z.ZodObject<{
    user_uid: z.ZodString;
    product_id: z.ZodNumber;
    quantity: z.ZodNumber;
    shipping_address: z.ZodString;
    billing_address: z.ZodString;
    payment_method: z.ZodString;
}, "strip", z.ZodTypeAny, {
    product_id: number;
    user_uid: string;
    quantity: number;
    shipping_address: string;
    billing_address: string;
    payment_method: string;
}, {
    product_id: number;
    user_uid: string;
    quantity: number;
    shipping_address: string;
    billing_address: string;
    payment_method: string;
}>;
export declare const updateOrderSchema: z.ZodObject<{
    update: z.ZodObject<{
        status: z.ZodEnum<["Pending", "Processing", "Shipped", "Delivered", "Completed", "Canceled", "Failed", "Refunded", "Returned"]>;
        tracking_number: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        estimated_delivery: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        delivered_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Completed" | "Canceled" | "Failed" | "Refunded" | "Returned";
        tracking_number?: string | null | undefined;
        estimated_delivery?: string | null | undefined;
        delivered_at?: string | null | undefined;
    }, {
        status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Completed" | "Canceled" | "Failed" | "Refunded" | "Returned";
        tracking_number?: string | null | undefined;
        estimated_delivery?: string | null | undefined;
        delivered_at?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    update: {
        status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Completed" | "Canceled" | "Failed" | "Refunded" | "Returned";
        tracking_number?: string | null | undefined;
        estimated_delivery?: string | null | undefined;
        delivered_at?: string | null | undefined;
    };
}, {
    update: {
        status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Completed" | "Canceled" | "Failed" | "Refunded" | "Returned";
        tracking_number?: string | null | undefined;
        estimated_delivery?: string | null | undefined;
        delivered_at?: string | null | undefined;
    };
}>;
export declare const getOrdersByStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["Pending", "Processing", "Shipped", "Delivered", "Completed", "Canceled", "Failed", "Refunded", "Returned"]>;
}, "strip", z.ZodTypeAny, {
    status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Completed" | "Canceled" | "Failed" | "Refunded" | "Returned";
}, {
    status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Completed" | "Canceled" | "Failed" | "Refunded" | "Returned";
}>;
export declare const bulkCreateSchema: z.ZodObject<{
    orders: z.ZodArray<z.ZodObject<{
        user_uid: z.ZodString;
        product_id: z.ZodNumber;
        quantity: z.ZodNumber;
        shipping_address: z.ZodString;
        billing_address: z.ZodString;
        payment_method: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        product_id: number;
        user_uid: string;
        quantity: number;
        shipping_address: string;
        billing_address: string;
        payment_method: string;
    }, {
        product_id: number;
        user_uid: string;
        quantity: number;
        shipping_address: string;
        billing_address: string;
        payment_method: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    orders: {
        product_id: number;
        user_uid: string;
        quantity: number;
        shipping_address: string;
        billing_address: string;
        payment_method: string;
    }[];
}, {
    orders: {
        product_id: number;
        user_uid: string;
        quantity: number;
        shipping_address: string;
        billing_address: string;
        payment_method: string;
    }[];
}>;
export declare const bulkStatusUpdateSchema: z.ZodObject<{
    updates: z.ZodArray<z.ZodObject<{
        uid: z.ZodString;
        status: z.ZodEnum<["Pending", "Processing", "Shipped", "Delivered", "Completed", "Canceled", "Failed", "Refunded", "Returned"]>;
    }, "strip", z.ZodTypeAny, {
        uid: string;
        status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Completed" | "Canceled" | "Failed" | "Refunded" | "Returned";
    }, {
        uid: string;
        status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Completed" | "Canceled" | "Failed" | "Refunded" | "Returned";
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    updates: {
        uid: string;
        status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Completed" | "Canceled" | "Failed" | "Refunded" | "Returned";
    }[];
}, {
    updates: {
        uid: string;
        status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Completed" | "Canceled" | "Failed" | "Refunded" | "Returned";
    }[];
}>;
