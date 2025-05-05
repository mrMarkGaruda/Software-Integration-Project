import { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    email: string;
  };
}

/**
 * Update user password after validating the old password
 */
export declare const editPassword: (req: AuthenticatedRequest, res: Response) => Promise<void>;

/**
 * Logout user by removing session data
 */
export declare const logout: (req: Request, res: Response) => Promise<Response>;