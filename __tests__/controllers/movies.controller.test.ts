import request from 'supertest';
import express from 'express';
import session from 'express-session';
import pool from '../../src/boot/database/db_connect';
import * as moviesController from '../../src/controllers/movies.controller';
import logger from '../../src/middleware/winston';
import statusCodes from '../../src/constants/statusCodes';

jest.mock('../../src/boot/database/db_connect');
jest.mock('../../src/middleware/winston', () => ({
  info: jest.fn(),
  http: jest.fn(),
  error: jest.fn(),
  stream: { write: jest.fn() },
}));

const app = express();
app.use(express.json());
app.use(
  session({
    secret: 'test',
    resave: false,
    saveUninitialized: true,
  })
);

// Mount routes
app.get('/movies', moviesController.getMovies);
app.get('/movies/top-rated', moviesController.getTopRatedMovies);
app.get(
  '/movies/seen',
  (req, _res, next) => {
    // simulate authentication
    req.user = { email: 'u@test.com' };
    next();
  },
  moviesController.getSeenMovies
);

describe('Movies Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /movies without category', () => {
    it('should return grouped movies on success', async () => {
      const fakeRows = [
        {
          movie_id: '1',
          title: 'A',
          type: 'drama',
          release_date: '2020-01-01',
          rating: 5,
        },
        {
          movie_id: '2',
          title: 'B',
          type: 'drama',
          release_date: '2021-01-01',
          rating: 4,
        },
        {
          movie_id: '3',
          title: 'C',
          type: 'action',
          release_date: '2022-01-01',
          rating: 3,
        },
      ];
      (pool.query as jest.Mock).mockResolvedValue({ rows: fakeRows });

      const res = await request(app).get('/movies');
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM movies GROUP BY type, movie_id;'
      );
      expect(res.status).toBe(statusCodes.success);
      expect(res.body.movies).toEqual({
        drama: fakeRows.filter((m) => m.type === 'drama'),
        action: fakeRows.filter((m) => m.type === 'action'),
      });
    });

    it('should return 500 on DB error', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('DB fail'));

      const res = await request(app).get('/movies');
      expect(res.status).toBe(statusCodes.queryError);
      expect(res.body).toEqual({
        error: 'Exception occured while fetching movies',
      });
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('GET /movies?category=type', () => {
    it('should return filtered movies on success', async () => {
      const fakeRows = [
        {
          movie_id: '10',
          title: 'X',
          type: 'comedy',
          release_date: '2023-01-01',
          rating: 2,
        },
      ];
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: fakeRows }); // for WHERE query

      const res = await request(app)
        .get('/movies')
        .query({ category: 'comedy' });
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM movies WHERE type = $1 ORDER BY release_date DESC;',
        ['comedy']
      );
      expect(res.status).toBe(statusCodes.success);
      expect(res.body.movies).toEqual(fakeRows);
    });

    it('should return empty array on DB error', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error());
      // First call is filtering
      const res = await request(app)
        .get('/movies')
        .query({ category: 'horror' });
      expect(res.status).toBe(statusCodes.success);
      expect(res.body.movies).toEqual([]);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('GET /movies/top-rated', () => {
    it('should return top-rated movies on success', async () => {
      const fakeRows = [
        {
          movie_id: '5',
          title: 'Top',
          type: 'thriller',
          release_date: '2024-01-01',
          rating: 10,
        },
      ];
      (pool.query as jest.Mock).mockResolvedValue({ rows: fakeRows });

      const res = await request(app).get('/movies/top-rated');
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM movies ORDER BY rating DESC LIMIT 10;'
      );
      expect(res.status).toBe(statusCodes.success);
      expect(res.body.movies).toEqual(fakeRows);
    });

    it('should return 500 on DB error', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error());
      const res = await request(app).get('/movies/top-rated');
      expect(res.status).toBe(statusCodes.queryError);
      expect(res.body).toEqual({
        error: 'Exception occured while fetching top rated movies',
      });
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('GET /movies/seen', () => {
    it('should return seen movies on success', async () => {
      const fakeRows = [
        {
          movie_id: '7',
          title: 'SeenIt',
          type: 'drama',
          release_date: '2022-02-02',
          rating: 8,
        },
      ];
      (pool.query as jest.Mock).mockResolvedValue({ rows: fakeRows });

      const res = await request(app).get('/movies/seen');
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM seen_movies S JOIN movies M ON S.movie_id = M.movie_id WHERE email = $1;',
        ['u@test.com']
      );
      expect(res.status).toBe(statusCodes.success);
      expect(res.body.movies).toEqual(fakeRows);
    });

    it('should return 500 on DB error', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error());
      const res = await request(app).get('/movies/seen');
      expect(res.status).toBe(statusCodes.queryError);
      expect(res.body).toEqual({
        error: 'Exception occured while fetching seen movies',
      });
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
