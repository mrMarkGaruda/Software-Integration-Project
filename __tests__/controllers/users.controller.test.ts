jest.mock('../../src-ts/boot/database/db_connect', () => {
  // Both connect and query are jest mocks.
  return {
    connect: jest.fn(),
    query: jest.fn(),
  };
});

jest.mock('../../src-ts/middleware/winston', () => ({
  info: jest.fn(),
  http: jest.fn(),
  error: jest.fn(),
  stream: { write: jest.fn() },
}));

// 3) Mock jsonwebtoken.sign
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

import request from 'supertest';
import express from 'express';
import session from 'express-session';
import pool from '../../src-ts/boot/database/db_connect'; // now the pool.query mock
import * as usersController from '../../src-ts/controllers/users.controller';
import jwt from 'jsonwebtoken';
import statusCodes from '../../src-ts/constants/statusCodes';

describe('Users Controller', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use(
      session({ secret: 'test', resave: false, saveUninitialized: true })
    );
    app.post('/login', usersController.login);
  });

  describe('POST /login', () => {
    it('200 and token on success', async () => {
      // Arrange: stub pool.query to invoke callback with a user row
      const fakeRow = { email: 'a@a.com', username: 'usr' };

      (pool.query as jest.Mock).mockImplementation(
        (
          _sql: string,
          _params: any[],
          cb: (err: Error | null, rows?: any) => void
        ) => {
          cb(null, { rows: [fakeRow] });
        }
      );

      // Arrange: stub jwt.sign
      (jwt.sign as jest.Mock).mockReturnValue('tok');

      // Act
      const res = await request(app)
        .post('/login')
        .send({ email: 'a@a.com', password: 'p' });

      // Assert
      expect(res.status).toBe(statusCodes.success);
      expect(res.body).toEqual({ token: 'tok', username: 'usr' });
    });
  });
});
