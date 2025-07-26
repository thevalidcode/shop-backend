import { z } from "zod";
export declare const OrderPublicListResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodArray<z.ZodObject<{
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
            }>, "many">;
        };
    };
};
export declare const OrderListResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodArray<z.ZodObject<{
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
            }>, "many">;
        };
    };
};
export declare const OrderSingleResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
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
        };
    };
};
export declare const OrderCreatedResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Order added successfully.">;
                uid: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                success: "Order added successfully.";
                uid: string;
            }, {
                success: "Order added successfully.";
                uid: string;
            }>;
        };
    };
};
export declare const OrderCreatedListResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Orders added successfully.">;
                uids: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                success: "Orders added successfully.";
                uids: string[];
            }, {
                success: "Orders added successfully.";
                uids: string[];
            }>;
        };
    };
};
export declare const OrderUpdatedResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Order updated successfully.">;
            }, "strip", z.ZodTypeAny, {
                success: "Order updated successfully.";
            }, {
                success: "Order updated successfully.";
            }>;
        };
    };
};
