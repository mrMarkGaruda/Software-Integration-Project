import { Request, Response } from 'express';
import { statusCodes } from '../constants/statusCodes';
import logger from '../middleware/winston';
import pool from '../boot/database/db_connect';
import jwt from 'jsonwebtoken';

interface RegisterBody {
  email: string;
  username: string;
  password: string;
  country: string;
  city?: string;
  street?: string;
  creation_date?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

/**
 * Register a new user
 * @param req Express request with registration data
 * @param res Express response
 */
const register = async (req: Request, res: Response): Promise<void> => {
  const { email, username, password, country, city, street } = req.body as RegisterBody;

  if (!email || !username || !password || !country) {
    res.status(statusCodes.badRequest).json({ message: 'Missing parameters' });
  } else {
    const client = await pool.connect();

    try {
      const result = await client.query(
        'SELECT * FROM users WHERE email = $1;',
        [email]
      );
      if (result.rowCount) {
        res
          .status(statusCodes.userAlreadyExists)
          .json({ message: 'User already has an account' });
      } else {
        await client.query('BEGIN');
        const addedUser = await client.query(
          `INSERT INTO users(email, username, password, creation_date)
           VALUES ($1, $2, crypt($3, gen_salt('bf')), $4);`,
          [email, username, password, req.body.creation_date]
        );

        logger.info('USER ADDED', addedUser.rowCount);

        const address = await client.query(
          `INSERT INTO addresses(email, country, street, city) VALUES ($1, $2, $3, $4);`,
          [email, country, street || null, city || null]
        );
        logger.info('ADDRESS ADDED', address.rowCount);

        res.status(statusCodes.success).json({ message: 'User created' });
        await client.query('COMMIT');
      }
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(error instanceof Error ? error.stack : String(error));
      res.status(statusCodes.queryError).json({
        message: 'Exception occurred while registering',
      });
    } finally {
      client.release();
    }
  }
};

/**
 * User login handler
 * @param req Express request with login credentials
 * @param res Express response
 */
const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginBody;

  if (!email || !password) {
    res.status(statusCodes.badRequest).json({ message: 'Missing parameters' });
  } else {
    pool.query(
      'SELECT * FROM users WHERE email = $1 AND password = crypt($2, password);',
      [email, password],
      (err, rows) => {
        if (err) {
          logger.error(err.stack);
          res
            .status(statusCodes.queryError)
            .json({ error: 'Exception occurred while logging in' });
        } else {
          if (rows.rows[0]) {
            req.session.user = {
              email: rows.rows[0].email,
            };

            if (!process.env.JWT_SECRET_KEY) {
              logger.error('JWT_SECRET_KEY not defined in environment');
              res
                .status(statusCodes.queryError)
                .json({ error: 'Server configuration error' });
              return;
            }

            const token = jwt.sign(
              { user: { email: rows.rows[0].email } },
              process.env.JWT_SECRET_KEY,
              {
                expiresIn: '1h',
              }
            );
            res
              .status(statusCodes.success)
              .json({ token, username: rows.rows[0].username });
          } else {
            res
              .status(statusCodes.notFound)
              .json({ message: 'Incorrect email/password' });
          }
        }
      }
    );
  }
};

export {
  register,
  login,
};