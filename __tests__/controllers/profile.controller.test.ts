import request from 'supertest';
import express from 'express';
import session from 'express-session';
import pool from '../../src-ts/boot/database/db_connect';
import * as profileController from '../../src-ts/controllers/profile.controller';
import statusCodes from '../../src-ts/constants/statusCodes';
import logger from '../../src-ts/middleware/winston';

// Silence logger
jest.mock('../../src-ts/middleware/winston', () => ({
  info: jest.fn(),
  http: jest.fn(),
  error: jest.fn(),
  stream: { write: jest.fn() },
}));

// Mock the pool
jest.mock('../../src-ts/boot/database/db_connect', () => ({
  query: jest.fn(),
}));

describe('Profile Controller - editPassword', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    // simulate authenticated user
    app.use(
      session({ secret: 'test', resave: false, saveUninitialized: true })
    );
    app.use((req, _res, next) => {
      req.user = { email: 'u@test.com' };
      next();
    });
    app.put('/profile/password', profileController.editPassword);
    jest.clearAllMocks();
  });

  it('400 if parameters missing', async () => {
    const res = await request(app).put('/profile/password').send({});
    expect(res.status).toBe(statusCodes.badRequest);
    expect(res.body).toEqual({ message: 'Missing parameters' });
  });

  it('400 if old and new password are equal', async () => {
    const res = await request(app)
      .put('/profile/password')
      .send({ oldPassword: 'same', newPassword: 'same' });
    expect(res.status).toBe(statusCodes.badRequest);
    expect(res.body).toEqual({
      message: 'New password cannot be equal to old password',
    });
  });

  it('500 if first DB query errors', async () => {
    (pool.query as jest.Mock).mockImplementationOnce(
      (_sql, _params, cb: Function) => {
        cb(new Error('first-fail'), null);
      }
    );

    const res = await request(app)
      .put('/profile/password')
      .send({ oldPassword: 'o', newPassword: 'n' });
    expect(res.status).toBe(statusCodes.queryError);
    expect(res.body).toEqual({
      error: 'Exception occurred while updating password',
    });
    expect(logger.error).toHaveBeenCalled();
  });

  it('400 if old password incorrect', async () => {
    (pool.query as jest.Mock).mockImplementationOnce(
      (_sql, _params, cb: Function) => {
        cb(null, { rows: [] });
      }
    );

    const res = await request(app)
      .put('/profile/password')
      .send({ oldPassword: 'wrong', newPassword: 'newp' });
    expect(res.status).toBe(statusCodes.badRequest);
    expect(res.body).toEqual({ message: 'Incorrect password' });
  });

  it('200 if update succeeds', async () => {
    // first call: old password check
    (pool.query as jest.Mock)
      .mockImplementationOnce((_sql, _params, cb: Function) => {
        cb(null, { rows: [{ any: 'row' }] });
      })
      // second call: update
      .mockImplementationOnce((_sql, _params, cb: Function) => {
        cb(null);
      });

    const res = await request(app)
      .put('/profile/password')
      .send({ oldPassword: 'old', newPassword: 'new' });
    expect(res.status).toBe(statusCodes.success);
    expect(res.body).toEqual({ message: 'Password updated' });
  });

  it('500 if update query errors', async () => {
    (pool.query as jest.Mock)
      .mockImplementationOnce((_sql, _params, cb: Function) => {
        cb(null, { rows: [{ any: 'row' }] });
      })
      .mockImplementationOnce((_sql, _params, cb: Function) => {
        cb(new Error('second-fail'));
      });

    const res = await request(app)
      .put('/profile/password')
      .send({ oldPassword: 'old', newPassword: 'new2' });
    expect(res.status).toBe(statusCodes.queryError);
    expect(res.body).toEqual({
      error: 'Exception occurred while updating password',
    });
    expect(logger.error).toHaveBeenCalled();
  });
});
