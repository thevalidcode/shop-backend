import type { Request, Response } from "express";
export declare const getBlogs: (req: Request, res: Response) => Promise<void>;
export declare const getBlogByID: (req: Request, res: Response) => Promise<void>;
export declare const addBlog: (req: Request, res: Response) => Promise<void>;
export declare const updateBlog: (req: Request, res: Response) => Promise<void>;
export declare const deleteBlog: (req: Request, res: Response) => Promise<void>;
export declare const deleteMultipleBlogs: (req: Request, res: Response) => Promise<void>;
