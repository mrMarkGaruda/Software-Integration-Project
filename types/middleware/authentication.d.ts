import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to verify JWT token.
 * Adds `user` to the request object if token is valid.
 */
declare const verifyToken: (req: Request, res: Response, next: NextFunction) => Response | void;

export default verifyToken;
