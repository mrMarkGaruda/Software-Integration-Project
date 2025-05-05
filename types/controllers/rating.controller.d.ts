import { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    email: string;
  };
}

/**
 * Add a user rating for a movie and update the movie's average rating
 */
export declare const addRating: (req: AuthenticatedRequest, res: Response) => Promise<void>;