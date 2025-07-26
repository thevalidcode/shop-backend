import { Request, Response } from "express";
export declare const getFAQs: (req: Request, res: Response) => Promise<void>;
export declare const getFAQByID: (req: Request, res: Response) => Promise<void>;
export declare const addFAQ: (req: Request, res: Response) => Promise<void>;
export declare const updateFAQ: (req: Request, res: Response) => Promise<void>;
export declare const deleteFAQ: (req: Request, res: Response) => Promise<void>;
export declare const deleteMultipleFAQs: (req: Request, res: Response) => Promise<void>;
