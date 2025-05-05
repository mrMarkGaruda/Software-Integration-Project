import { Request, Response } from 'express';

export declare const editPassword: (req: Request, res: Response) => Promise<void>;
export declare const logout: (req: Request, res: Response) => Promise<Response>;