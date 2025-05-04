import { Request, Response, NextFunction } from 'express';

/**
 * Middleware for handling 404 not found routes
 */
export default function notFoundHandler(req: Request, res: Response, next: NextFunction): void;