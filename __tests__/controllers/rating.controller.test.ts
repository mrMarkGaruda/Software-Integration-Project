import request from 'supertest';
import express from 'express';
import session from 'express-session';
import pool from '../../src-ts/boot/database/db_connect';
import * as ratingController from '../../src-ts/controllers/rating.controller';
import RatingModel from '../../src-ts/models/ratingModel';
import logger from '../../src-ts/middleware/winston';
import statusCodes from '../../src-ts/constants/statusCodes';

jest.mock('../../src-ts/boot/database/db_connect', () => ({
  query: jest.fn(),
}));
jest.mock('../../src-ts/models/ratingModel');
jest.mock('../../src-ts/middleware/winston', () => ({
  info: jest.fn(),
  http: jest.fn(),
  error: jest.fn(),
  stream: { write: jest.fn() },
}));

describe('Rating Controller - addRating', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(
      session({ secret: 'test', resave: false, saveUninitialized: true })
    );
    // simulate authentication
    app.use((req, _res, next) => {
      req.user = { email: 'u@test.com' };
      next();
    });
    app.post('/ratings/:movieId', ratingController.addRating);
    jest.clearAllMocks();
  });

  it('400 if movieId not a number', async () => {
    const res = await request(app).post('/ratings/abc').send({ rating: 5 });
    expect(res.status).toBe(statusCodes.badRequest);
    expect(res.body).toEqual({ message: 'Missing parameters' });
  });

  it('400 if rating missing', async () => {
    const res = await request(app).post('/ratings/42').send({});
    expect(res.status).toBe(statusCodes.badRequest);
    expect(res.body).toEqual({ message: 'Missing parameters' });
  });

  it('500 if save() throws', async () => {
    const saveMock = jest.fn().mockRejectedValue(new Error('save-fail'));
    (RatingModel as any).mockImplementation(() => ({ save: saveMock }));

    const res = await request(app).post('/ratings/7').send({ rating: 3 });

    expect(saveMock).toHaveBeenCalledWith();
    expect(res.status).toBe(statusCodes.queryError);
    expect(res.body).toEqual({
      error: 'Exception occurred while adding rating',
    });
    expect(logger.error).toHaveBeenCalled();
  });

  it('500 if pool.query throws after computing average', async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const fakeRatings = [{ rating: 2 }, { rating: 4 }];
    (RatingModel as any).mockImplementation(() => ({ save: saveMock }));
    (RatingModel.find as jest.Mock).mockResolvedValue(fakeRatings);
    (pool.query as jest.Mock).mockRejectedValue(new Error('db-fail'));

    const res = await request(app).post('/ratings/9').send({ rating: 5 });

    expect(saveMock).toHaveBeenCalled();
    expect(RatingModel.find).toHaveBeenCalledWith({ movie_id: 9 });
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE movies SET rating = $1 WHERE movie_id = $2;',
      [Math.floor((2 + 4 + 5) / 3), 9]
    );
    expect(res.status).toBe(statusCodes.queryError);
    expect(res.body).toEqual({
      error: 'Exception occurred while adding rating',
    });
    expect(logger.error).toHaveBeenCalled();
  });

  it('200 on success', async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const fakeRatings = [{ rating: 1 }, { rating: 3 }];
    (RatingModel as any).mockImplementation(() => ({ save: saveMock }));
    (RatingModel.find as jest.Mock).mockResolvedValue(fakeRatings);
    (pool.query as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app).post('/ratings/5').send({ rating: 4 });

    expect(saveMock).toHaveBeenCalled();
    expect(RatingModel.find).toHaveBeenCalledWith({ movie_id: 5 });
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE movies SET rating = $1 WHERE movie_id = $2;',
      [Math.floor((1 + 3 + 4) / 3), 5]
    );
    expect(res.status).toBe(statusCodes.success);
    expect(res.body).toEqual({ message: 'Rating added' });
  });
});
