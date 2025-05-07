import { Request, Response } from 'express';
import logger from '../middleware/winston';
import statusCodes from '../constants/statusCodes';
import CommentModel from '../models/commentModel';

export const addComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { movie_id } = req.params;
  const { rating, username, comment, title } = req.body;

  const movieId = parseInt(movie_id, 10);

  if (
    !movie_id ||
    isNaN(movieId) ||
    !rating ||
    !username ||
    !comment ||
    !title
  ) {
    res.status(statusCodes.badRequest).json({ message: 'Missing parameters' });
    return;
  }

  try {
    const commentObj = new CommentModel({
      movie_id: movieId,
      rating,
      username,
      comment,
      title,
    });

    await commentObj.save();
    res.status(statusCodes.success).json({ message: 'Comment added' });
  } catch (error: any) {
    logger.error(error.stack);
    res
      .status(statusCodes.queryError)
      .json({ error: 'Exception occurred while adding comment' });
  }
};

export const getCommentsById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { movie_id } = req.params;
  const movieId = parseInt(movie_id, 10);

  if (!movie_id || isNaN(movieId)) {
    res.status(statusCodes.badRequest).json({ message: 'movie id missing' });
    return;
  }

  try {
    const comments = await CommentModel.find({ movie_id: movieId });
    res.status(statusCodes.success).json({ comments });
  } catch (error: any) {
    logger.error(error.stack);
    res
      .status(statusCodes.queryError)
      .json({ error: 'Exception occured while fetching comments' });
  }
};
