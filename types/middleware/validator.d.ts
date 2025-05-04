import { Request, Response, NextFunction } from 'express';

/**
 * Request body validator middleware
 * Sanitizes and validates incoming request body data
 */
export default function validator(req: Request, res: Response, next: NextFunction): void;