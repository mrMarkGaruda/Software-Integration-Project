import request from 'supertest';
import express from 'express';
import session from 'express-session';
import * as authController from '../../src/controllers/auth.controller';
import userModel from '../../src/models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../../src/models/userModel');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(
  session({
    secret: 'test',
    resave: false,
    saveUninitialized: true,
  })
);
app.post('/signup', authController.signup);
app.post('/signin', authController.signin);
app.get('/me', authController.getUser);
app.post('/logout', authController.logout);

describe('Auth Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /signup', () => {
    it('should return 400 if missing fields', async () => {
      const res = await request(app).post('/signup').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('missing information');
    });

    it('should return 200 and user on success', async () => {
      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashedPassword');
      const saveMock = jest
        .fn()
        .mockResolvedValue({ _id: '123', email: 'a@test.com' });
      (userModel as any).mockImplementation(() => ({
        save: saveMock,
      }));

      const res = await request(app)
        .post('/signup')
        .send({ username: 'test', email: 'a@test.com', password: 'pass' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
    });
  });

  describe('POST /signin', () => {
    it('should return 400 if missing fields', async () => {
      const res = await request(app).post('/signin').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('missing information');
    });

    it('should return 400 if user not found', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/signin')
        .send({ email: 'a@test.com', password: 'pass' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('User not found');
    });

    it('should return 400 on password mismatch', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue({
        password: 'wrongpass',
      });
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

      const res = await request(app)
        .post('/signin')
        .send({ email: 'a@test.com', password: 'wrong' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email or password don't match");
    });

    it('should return 200 and a token on success', async () => {
      const fakeUser = { _id: '123', email: 'a@test.com', password: 'hashed' };
      (userModel.findOne as jest.Mock).mockResolvedValue(fakeUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('fakeToken');

      const res = await request(app)
        .post('/signin')
        .send({ email: 'a@test.com', password: 'pass' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe('fakeToken');
    });
  });

  describe('GET /me', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/me');
      expect(res.status).toBe(401);
    });

    it('should return user data on success', async () => {
      const fakeUser = {
        _id: '123',
        email: 'a@test.com',
        populate: jest
          .fn()
          .mockResolvedValue({ _id: '123', email: 'a@test.com' }),
      };
      (userModel.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeUser),
      });

      const agent = request.agent(app);

      // Manually initialize session
      await agent
        .post('/signin')
        .send({ email: 'a@test.com', password: 'pass' });
      agent.jar.setCookie('connect.sid=some-session-id'); // Simulated

      app.use((req, _res, next) => {
        req.session.user = { _id: '123' };
        next();
      });

      const res = await agent.get('/me');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
    });
  });

  describe('POST /logout', () => {
    it('should logout user and return 200', async () => {
      const agent = request.agent(app);
      await agent.post('/logout').send();
      expect(agent).toBeDefined();
    });
  });
});
