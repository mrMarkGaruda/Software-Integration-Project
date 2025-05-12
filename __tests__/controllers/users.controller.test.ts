// __tests__/controllers/users.controller.test.ts

jest.mock('../../src/boot/database/db_connect', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

jest.mock('../../src/middleware/winston', () => ({
  info: jest.fn(),
  error: jest.fn(),
  http: jest.fn(),
  stream: { write: jest.fn() },
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

import request from 'supertest';
import express from 'express';
import session from 'express-session';
import pool from '../../src/boot/database/db_connect';
import * as usersController from '../../src/controllers/users.controller';
import jwt from 'jsonwebtoken';
import statusCodes from '../../src/constants/statusCodes';

describe('Users Controller', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.JWT_SECRET_KEY = 'test-secret'; // needed for jwt.sign to work

    app = express();
    app.use(express.json());
    app.use(
      session({ secret: 'test', resave: false, saveUninitialized: true })
    );
    app.post('/login', usersController.login);
  });

  describe('POST /login', () => {
    it('200 and token on success', async () => {
      const userRow = { email: 'a@a.com', username: 'usr' };

      // Mock pool.query to use callback-style
      (pool.query as jest.Mock).mockImplementation(
        (_sql: string, _params: any[], callback: Function) => {
          callback(null, { rows: [userRow] });
        }
      );

      // Mock jwt.sign
      (jwt.sign as jest.Mock).mockReturnValue('tok');

      const res = await request(app)
        .post('/login')
        .send({ email: 'a@a.com', password: 'p' });

      expect(res.status).toBe(statusCodes.success);
      expect(res.body).toEqual({ token: 'tok', username: 'usr' });
    });
  });
});
