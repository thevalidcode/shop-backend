import { z } from "zod";
export declare const AuthSchema: z.ZodObject<{
    shop_id: z.ZodNumber;
    email: z.ZodString;
    uid: z.ZodString;
    api_key: z.ZodString;
    role: z.ZodString;
    user: z.ZodObject<{}, "strip", z.ZodUnknown, z.objectOutputType<{}, z.ZodUnknown, "strip">, z.objectInputType<{}, z.ZodUnknown, "strip">>;
}, "strip", z.ZodTypeAny, {
    user: {} & {
        [k: string]: unknown;
    };
    email: string;
    shop_id: number;
    uid: string;
    api_key: string;
    role: string;
}, {
    user: {} & {
        [k: string]: unknown;
    };
    email: string;
    shop_id: number;
    uid: string;
    api_key: string;
    role: string;
}>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
    status: z.ZodString;
    api_key: z.ZodString;
    role: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    id: string;
    email: string;
    api_key: string;
    role: string;
    password: string;
    status: string;
}, {
    username: string;
    id: string;
    email: string;
    api_key: string;
    role: string;
    password: string;
    status: string;
}>;
export declare const UserPublicSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    username: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    id: string;
    email: string;
}, {
    username: string;
    id: string;
    email: string;
}>;
export declare const UserUpdateRequestSchema: z.ZodObject<{
    uid: z.ZodString;
    username: z.ZodString;
    full_name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    uid: string;
    full_name: string;
}, {
    username: string;
    uid: string;
    full_name: string;
}>;
export declare const AuthenticateUserSchema: z.ZodObject<{
    shop_id: z.ZodNumber;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    shop_id: number;
    password: string;
}, {
    email: string;
    shop_id: number;
    password: string;
}>;
export declare const AuthenticateUserResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<"Logged in successfully">;
    user: z.ZodObject<{
        id: z.ZodNumber;
        email: z.ZodString;
        username: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        username: string;
        id: number;
        email: string;
    }, {
        username: string;
        id: number;
        email: string;
    }>;
}, "strip", z.ZodTypeAny, {
    user: {
        username: string;
        id: number;
        email: string;
    };
    success: "Logged in successfully";
}, {
    user: {
        username: string;
        id: number;
        email: string;
    };
    success: "Logged in successfully";
}>;
export declare const CreateUserInputSchema: z.ZodObject<{
    email: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
    shop_id: z.ZodNumber;
    ref: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    username: string;
    email: string;
    shop_id: number;
    password: string;
    ref?: number | undefined;
}, {
    username: string;
    email: string;
    shop_id: number;
    password: string;
    ref?: number | undefined;
}>;
export declare const AdminPublicSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    username: z.ZodString;
    role: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    id: string;
    email: string;
    role: string;
}, {
    username: string;
    id: string;
    email: string;
    role: string;
}>;
export declare const GoogleAuthRequestSchema: z.ZodObject<{
    id_token: z.ZodString;
    shop_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    shop_id: number;
    id_token: string;
}, {
    shop_id: number;
    id_token: string;
}>;
