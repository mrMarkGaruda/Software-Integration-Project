import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { unauthorized } from '../constants/statusCodes';
import logger from './winston';

interface JwtPayload {
  user: {
    email: string;
  };
}

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.header('Authorization');

  if (!header) {
    res.status(unauthorized).json({ error: 'No Authorization header' });
    return;
  }

  const token = header.split(' ')[1];

  if (!token) {
    res.status(unauthorized).json({ error: 'No token provided' });
    return;
  }

  try {
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error('JWT secret key is not defined');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY) as JwtPayload;
    
    // Attach user to the request object
    req.user = decoded.user;
    next();
  } catch (error: unknown) {
    logger.error('Token verification error:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(unauthorized).json({ error: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(unauthorized).json({ error: 'Invalid token' });
    } else {
      res.status(unauthorized).json({ error: 'Authentication failed' });
    }
  }
};

export default verifyToken;