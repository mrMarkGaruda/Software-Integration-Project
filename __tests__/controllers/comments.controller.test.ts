import request from 'supertest';
import express from 'express';
import session from 'express-session';
import statusCodes from '../../src-ts/constants/statusCodes';
import * as commentsController from '../../src-ts/controllers/comments.controller';
import CommentModel from '../../src-ts/models/commentModel';

jest.mock('../../src-ts/models/commentModel');

const app = express();
app.use(express.json());
app.use(
  session({
    secret: 'test',
    resave: false,
    saveUninitialized: true,
  })
);

// Mount routes using the controller directly
app.post('/comments/:movie_id', commentsController.addComment);
app.get('/comments/:movie_id', commentsController.getCommentsById);

describe('Comments Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /comments/:movie_id (addComment)', () => {
    it('returns 400 if missing any field', async () => {
      const res = await request(app)
        .post('/comments/42')
        .send({ rating: 5, username: 'u' }); // missing comment+title
      expect(res.status).toBe(statusCodes.badRequest);
      expect(res.body.message).toMatch(/Missing parameters/);
    });

    it('returns 400 if movie_id is invalid', async () => {
      const res = await request(app)
        .post('/comments/not-a-number')
        .send({ rating: 5, username: 'u', comment: 'c', title: 't' });
      expect(res.status).toBe(statusCodes.badRequest);
      expect(res.body.message).toMatch(/Missing parameters|movie id missing/);
    });

    it('returns 200 when comment is saved', async () => {
      // Mock save() to resolve
      const saveMock = jest.fn().mockResolvedValue(undefined);
      (CommentModel as any).mockImplementation(() => ({
        save: saveMock,
      }));

      const payload = {
        rating: 4,
        username: 'alice',
        comment: 'Nice!',
        title: 'Review',
      };
      const res = await request(app).post('/comments/7').send(payload);

      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toBe(statusCodes.success);
      expect(res.body.message).toBe('Comment added');
    });

    it('returns 500 on exception', async () => {
      // Mock save() to reject
      const saveMock = jest.fn().mockRejectedValue(new Error('DB down'));
      (CommentModel as any).mockImplementation(() => ({
        save: saveMock,
      }));

      const payload = {
        rating: 3,
        username: 'bob',
        comment: 'Okay',
        title: 'So-so',
      };
      const res = await request(app).post('/comments/8').send(payload);

      expect(res.status).toBe(statusCodes.queryError);
      expect(res.body.error).toBe('Exception occurred while adding comment');
    });
  });

  describe('GET /comments/:movie_id (getCommentsById)', () => {
    it('returns 400 if movie_id is invalid', async () => {
      const res = await request(app).get('/comments/abc');
      expect(res.status).toBe(statusCodes.badRequest);
      expect(res.body.message).toBe('movie id missing');
    });

    it('returns 200 and comments array on success', async () => {
      const fakeComments = [{ movie_id: 9, comment: 'A', rating: 5 }];
      (CommentModel.find as jest.Mock).mockResolvedValue(fakeComments);

      const res = await request(app).get('/comments/9');
      expect(CommentModel.find).toHaveBeenCalledWith({ movie_id: 9 });
      expect(res.status).toBe(statusCodes.success);
      expect(res.body.comments).toEqual(fakeComments);
    });

    it('returns 500 on exception', async () => {
      (CommentModel.find as jest.Mock).mockRejectedValue(new Error('fail'));

      const res = await request(app).get('/comments/10');
      expect(res.status).toBe(statusCodes.queryError);
      expect(res.body.error).toBe('Exception occured while fetching comments');
    });
  });
});
