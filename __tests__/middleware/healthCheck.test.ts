import request from 'supertest';
import express from 'express';
import healthCheckRouter from '../../src/middleware/healthCheck';

describe('Health Check Middleware', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(healthCheckRouter);
  });

  it('should return 200 OK with correct message', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'All up and running !!',
    });
  });

  it('should respond to health check endpoint', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.type).toBe('application/json');
  });
});
