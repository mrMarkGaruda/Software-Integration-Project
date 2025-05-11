import { Request, Response } from 'express';
import pool from '../boot/database/db_connect';
import logger from '../middleware/winston';
import statusCodes from '../constants/statusCodes';

interface AuthenticatedRequest extends Request {
  user: {
    email: string;
  };
}

interface QueryResult {
  rows: Array<Record<string, unknown>>;
}

export const editPassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    res.status(statusCodes.badRequest).json({ message: 'Missing parameters' });
    return;
  }

  if (oldPassword === newPassword) {
    res
      .status(statusCodes.badRequest)
      .json({ message: 'New password cannot be equal to old password' });
    return;
  }

  pool.query(
    'SELECT * FROM users WHERE email = $1 AND password = crypt($2, password);',
    [req.user.email, oldPassword],
    (err: Error | null, result: QueryResult) => {
      if (err) {
        logger.error(err.stack);
        res
          .status(statusCodes.queryError)
          .json({ error: 'Exception occurred while updating password' });
        return;
      }

      if (result.rows[0]) {
        pool.query(
          "UPDATE users SET password = crypt($1, gen_salt('bf')) WHERE email = $2;",
          [newPassword, req.user.email],
          (err: Error | null) => {
            if (err) {
              logger.error(err.stack);
              res
                .status(statusCodes.queryError)
                .json({ error: 'Exception occurred while updating password' });
            } else {
              res
                .status(statusCodes.success)
                .json({ message: 'Password updated' });
            }
          }
        );
      } else {
        res
          .status(statusCodes.badRequest)
          .json({ message: 'Incorrect password' });
      }
    }
  );
};
