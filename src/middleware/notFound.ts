import { Request, Response } from 'express';

/**
 * Middleware for handling 404 not found routes
 */
const notFoundHandler = (_req: Request, res: Response): void => {
  const err = new Error('Not Found');
  res.status(404).json({
    error: {
      message: err.message,
    },
  });
};

export default notFoundHandler;
