import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { unauthorized } from '../constants/statusCodes';
import logger from './winston';

interface JwtPayload {
  user: {
    id: string;
    email: string;
  };
}

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.header('Authorization');

  if (!header) {
    res.status(unauthorized).json({ error: 'Unauthorized' });
    return;
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as JwtPayload;
    req.user = decoded.user;
    next();
  } catch (error: unknown) {
    logger.error(error);
    res.status(unauthorized).json({ error: 'Invalid token' });
    return;
  }
};

export default verifyToken;
