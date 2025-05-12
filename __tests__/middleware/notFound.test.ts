import express from 'express';
import request from 'supertest';
import notFoundHandler from '../../src/middleware/notFound';

describe('Not Found Middleware', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();

    // Add the not found middleware
    app.use(notFoundHandler);
  });

  it('should return 404 status code', async () => {
    const response = await request(app).get('/non-existent-route');

    expect(response.status).toBe(404);
  });

  it('should return JSON error response', async () => {
    const response = await request(app).get('/non-existent-route');

    expect(response.type).toBe('application/json');
    expect(response.body).toEqual({
      error: {
        message: 'Not Found',
      },
    });
  });

  it('should work with different HTTP methods', async () => {
    const methods = ['post', 'put', 'delete', 'patch'];

    for (const method of methods) {
      const response = await request(app)[
        method as 'post' | 'put' | 'delete' | 'patch'
      ]('/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: {
          message: 'Not Found',
        },
      });
    }
  });
});
