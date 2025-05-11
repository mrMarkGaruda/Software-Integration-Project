import { Request, Response, NextFunction } from 'express';
import logger from './winston';
import { badRequest } from '../constants/statusCodes';

/**
 * Request body validator middleware
 * Sanitizes and validates incoming request body data
 */
const validator = (req: Request, res: Response, next: NextFunction): void => {
  // No creation date is allowed to pass through
  if (req.body.creation_date) {
    delete req.body.creation_date;
  }

  let creationDate = new Date().toJSON().slice(0, 10);
  req.body.creation_date = creationDate;

  try {
    for (let [key, value] of Object.entries(req.body)) {
      if (value === '') {
        value = null;
        req.body[key] = value;
        continue;
      }
    }

    next();
  } catch (error) {
    logger.error(error instanceof Error ? error.stack : String(error));
    res.status(badRequest).json({ error: 'Bad request' });
  }
};

export default validator;