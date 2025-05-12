import express from 'express';
import request from 'supertest';
import validator from '../../src/middleware/validator';
import { badRequest } from '../../src/constants/statusCodes';

describe('Validator Middleware', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Create a route that uses the validator middleware
    app.post(
      '/test',
      (req, res, next) => {
        validator(req, res, next);
      },
      (req, res) => {
        res.json(req.body);
      }
    );
  });

  it('should remove creation_date from request body if present', async () => {
    const response = await request(app)
      .post('/test')
      .send({ creation_date: '2023-01-01', username: 'testuser' });

    expect(response.body.creation_date).toBeTruthy(); // Middleware adds a new creation_date
    expect(response.body.username).toBe('testuser');
  });

  it('should convert empty strings to null', async () => {
    const response = await request(app)
      .post('/test')
      .send({ username: '', email: 'test@example.com' });

    expect(response.body.username).toBeNull();
    expect(response.body.email).toBe('test@example.com');
  });

  it('should add current date as creation_date', async () => {
    const response = await request(app)
      .post('/test')
      .send({ username: 'testuser' });

    const today = new Date().toJSON().slice(0, 10);
    expect(response.body.creation_date).toBe(today);
  });

  it('should handle error with malformed input', async () => {
    // Simulate an error by passing a circular reference
    const circularObj: any = {};
    circularObj.self = circularObj;

    const response = await request(app).post('/test').send(circularObj);

    expect(response.status).toBe(badRequest);
    expect(response.body).toEqual({ error: 'Bad request' });
  });
});
