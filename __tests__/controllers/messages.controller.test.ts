import request from 'supertest';
import express from 'express';
import session from 'express-session';
import * as messagesController from '../../src/controllers/messages.controller';
import MessageModel from '../../src/models/messageModel';

// Silence logging
jest.mock('../../src/middleware/winston', () => ({
  info: jest.fn(),
  http: jest.fn(),
  error: jest.fn(),
  stream: { write: jest.fn() },
}));

jest.mock('../../src/models/messageModel');

describe('Messages Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /messages', () => {
    it('should return 200 and a list of messages', async () => {
      const app = express();
      app.use(express.json());
      // mount without auth
      app.get('/messages', messagesController.getMessages);

      const fakeMessages = [{ _id: '1', name: 'hello' }];
      (MessageModel.find as jest.Mock).mockResolvedValue(fakeMessages);

      const res = await request(app).get('/messages');
      expect(MessageModel.find).toHaveBeenCalledWith({});
      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeMessages);
    });
  });

  describe('GET /messages/:messageId', () => {
    it('should return 200 and the message data', async () => {
      const app = express();
      app.use(express.json());
      app.get('/messages/:messageId', messagesController.getMessageById);

      const fakeMessage = { _id: 'abc', name: 'world' };
      (MessageModel.findById as jest.Mock).mockResolvedValue(fakeMessage);

      const res = await request(app).get('/messages/abc');
      expect(MessageModel.findById).toHaveBeenCalledWith('abc');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeMessage);
    });

    it('should return 500 on exception', async () => {
      const app = express();
      app.use(express.json());
      app.get('/messages/:messageId', messagesController.getMessageById);

      (MessageModel.findById as jest.Mock).mockRejectedValue(new Error('oops'));

      const res = await request(app).get('/messages/doesntmatter');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Error while getting message' });
    });
  });

  describe('POST /messages', () => {
    it('should return 400 if body missing message.name', async () => {
      const app = express();
      app.use(express.json());
      app.post('/messages', messagesController.addMessage);

      const res = await request(app).post('/messages').send({ message: {} });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'missing information' });
    });

    it('should return 500 if not authenticated', async () => {
      const app = express();
      app.use(express.json());
      app.use(
        session({ secret: 'test', resave: false, saveUninitialized: true })
      );
      app.post('/messages', messagesController.addMessage);

      const res = await request(app)
        .post('/messages')
        .send({ message: { name: 'hi' } });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'You are not authenticated' });
    });

    it('should return 200 and saved object on success', async () => {
      const app = express();
      app.use(express.json());
      app.use(
        session({ secret: 'test', resave: false, saveUninitialized: true })
      );
      // inject session.user before routes
      app.use((req, _res, next) => {
        req.session.user = { _id: 'usr1' };
        next();
      });
      app.post('/messages', messagesController.addMessage);

      const saveMock = jest.fn().mockResolvedValue(undefined);
      (MessageModel as any).mockImplementation((data: any) => ({
        save: saveMock,
        ...data,
      }));

      const payload = { message: { name: 'msg1', content: 'hey' } };
      const res = await request(app).post('/messages').send(payload);

      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        name: 'msg1',
        content: 'hey',
        user: 'usr1',
      });
    });

    it('should return 500 on save error', async () => {
      const app = express();
      app.use(express.json());
      app.use(
        session({ secret: 'test', resave: false, saveUninitialized: true })
      );
      app.use((req, _res, next) => {
        req.session.user = { _id: 'usr2' };
        next();
      });
      app.post('/messages', messagesController.addMessage);

      const saveMock = jest.fn().mockRejectedValue(new Error('fail'));
      (MessageModel as any).mockImplementation(() => ({
        save: saveMock,
      }));

      const res = await request(app)
        .post('/messages')
        .send({ message: { name: 'foo' } });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to add message' });
    });
  });

  describe('PUT /messages/:messageId', () => {
    it('should return 404 if missing id', async () => {
      const app = express();
      app.use(express.json());
      app.put('/messages/:messageId', messagesController.editMessage);

      const res = await request(app).put('/messages/').send({ name: 'x' });
      expect(res.status).toBe(404);
    });

    it('should return 200 and updated doc on success', async () => {
      const app = express();
      app.use(express.json());
      app.put('/messages/:messageId', messagesController.editMessage);

      const updated = { _id: 'm1', name: 'newname' };
      (MessageModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updated);

      const res = await request(app)
        .put('/messages/m1')
        .send({ name: 'newname' });

      expect(MessageModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'm1',
        { name: 'newname' },
        { new: true }
      );
      expect(res.status).toBe(200);
      expect(res.body).toEqual(updated);
    });

    it('should return 500 on update error', async () => {
      const app = express();
      app.use(express.json());
      app.put('/messages/:messageId', messagesController.editMessage);

      (MessageModel.findByIdAndUpdate as jest.Mock).mockRejectedValue(
        new Error()
      );
      const res = await request(app).put('/messages/x').send({ name: 'n' });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to update message' });
    });
  });

  describe('DELETE /messages/:messageId', () => {
    it('should return 404 if no id', async () => {
      const app = express();
      app.use(express.json());
      app.delete('/messages/:messageId', messagesController.deleteMessage);

      const res = await request(app).delete('/messages/');
      expect(res.status).toBe(404);
    });

    it('should return 200 on delete success', async () => {
      const app = express();
      app.use(express.json());
      app.delete('/messages/:messageId', messagesController.deleteMessage);

      (MessageModel.findByIdAndDelete as jest.Mock).mockResolvedValue(
        undefined
      );
      const res = await request(app).delete('/messages/mX');
      expect(MessageModel.findByIdAndDelete).toHaveBeenCalledWith('mX');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Message deleted' });
    });

    it('should return 500 on delete error', async () => {
      const app = express();
      app.use(express.json());
      app.delete('/messages/:messageId', messagesController.deleteMessage);

      (MessageModel.findByIdAndDelete as jest.Mock).mockRejectedValue(
        new Error()
      );
      const res = await request(app).delete('/messages/y');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to delete message' });
    });
  });
});
