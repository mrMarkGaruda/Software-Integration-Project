import { Request, Response } from 'express';
import pool from '../boot/database/db_connect';
import logger from '../middleware/winston';
import statusCodes from '../constants/statusCodes';
import RatingModel from '../models/ratingModel';

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
  user: {
    email: string;
  };
}

export const addRating = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { movieId } = req.params;
  const { rating } = req.body;

  const movie_id = parseInt(movieId, 10);

  if (isNaN(movie_id) || rating === undefined || rating === null) {
    res.status(statusCodes.badRequest).json({ message: 'Missing parameters' });
    return;
  }

  try {
    const ratingObj = new RatingModel({
      email: req.user.email,
      movie_id,
      rating,
    });

    await ratingObj.save();

    // Fetch all ratings for the specific movie
    const ratings = await RatingModel.find({ movie_id });

    const averageRating =
      ratings.reduce((acc, item) => acc + item.rating, 0) /
      (ratings.length || 1);

    await pool.query('UPDATE movies SET rating = $1 WHERE movie_id = $2;', [
      averageRating,
      movie_id,
    ]);

    res.status(statusCodes.success).json({ message: 'Rating added' });
  } catch (error: unknown) {
    logger.error(error instanceof Error ? error.stack : String(error));
    res
      .status(statusCodes.queryError)
      .json({ error: 'Exception occurred while adding rating' });
  }
};
