import { Request, Response } from 'express';

export function addComment(req: Request, res: Response): Promise<Response>;
export function getCommentsById(req: Request, res: Response): Promise<Response>;