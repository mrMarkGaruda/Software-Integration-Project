import { Request, Response } from 'express';

interface Movie {
  movie_id: string;
  title: string;
  type: string;
  release_date: string;
  rating: number;
}

interface AuthenticatedRequest extends Request {
  user: {
    email: string;
  };
}

export declare const getMovies: (req: Request, res: Response) => Promise<void>;
export declare const getMoviesByCategory: (category: string) => Promise<Movie[]>;
export declare const getTopRatedMovies: (req: Request, res: Response) => Promise<void>;
export declare const getSeenMovies: (req: AuthenticatedRequest, res: Response) => Promise<void>;