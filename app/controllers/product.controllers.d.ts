import type { Request, Response } from "express";
export declare const getProducts: (req: Request, res: Response) => Promise<void>;
export declare const getProductsForAdmins: (req: Request, res: Response) => Promise<void>;
export declare const getProductByID: (req: Request, res: Response) => Promise<void>;
export declare const getProductByIDFromAdmin: (req: Request, res: Response) => Promise<void>;
export declare const updateProduct: (req: Request, res: Response) => Promise<void>;
export declare const deleteProduct: (req: Request, res: Response) => Promise<void>;
export declare const deleteMultipleProduct: (req: Request, res: Response) => Promise<void>;
export declare const addProduct: (req: Request, res: Response) => Promise<void>;
