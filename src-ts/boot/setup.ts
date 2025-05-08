import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import session from 'express-session';
import morgan from 'morgan';
import logger from '../middleware/winston';
import notFound from '../middleware/notFound';
import healthCheck from '../middleware/healthCheck';
import verifyToken from '../middleware/authentication';
import validator from '../middleware/validator';

// ROUTES
import authRoutes from '../routes/auth.routes';
import messageRoutes from '../routes/messages.routes';
import usersRoutes from '../routes/users.routes';
import profileRoutes from '../routes/profile.routes';
import moviesRoutes from '../routes/movies.routes';
import ratingRoutes from '../routes/rating.routes';
import commentsRoutes from '../routes/comments.routes';

const PORT: number = Number(process.env.PORT) || 8080;
const app: Application = express();

/**
 * Register core middleware components for the Express application
 */
const registerCoreMiddleWare = (): void => {
  // Session middleware
  app.use(
    session({
      secret: '1234',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false, httpOnly: true },
    })
  );

  // Morgan logging (cast to RequestHandler to satisfy types)
  app.use(morgan('combined') as unknown as express.RequestHandler);

  // Built‑in middleware
  app.use(express.json());
  app.use(cors());
  app.use(helmet());

  // Custom middleware (all must return void)
  app.use(validator as express.RequestHandler);
  app.use(healthCheck as express.RequestHandler);

  // Public routes
  app.use('/auth', authRoutes);
  app.use('/users', usersRoutes);

  // Protected routes
  app.use('/messages', verifyToken, messageRoutes);
  app.use('/profile', verifyToken, profileRoutes);
  app.use('/movies', verifyToken, moviesRoutes);
  app.use('/ratings', verifyToken, ratingRoutes);
  app.use('/comments', verifyToken, commentsRoutes);

  // 404 fallback
  app.use(notFound as express.RequestHandler);

  logger.http('Done registering all middlewares');
};

/**
 * Handle uncaught exceptions
 */
const handleError = (): void => {
  process.on('uncaughtException', (err: Error) => {
    logger.error(`UNCAUGHT_EXCEPTION OCCURRED: ${err.stack}`);
  });
};

/**
 * Connect to MongoDB and start the application
 */
const startApp = (): void => {
  mongoose
    .connect('mongodb://localhost:27017/epita')
    .then(() => {
      logger.info('MongoDB Connected');
      registerCoreMiddleWare();
      app.listen(PORT, () => {
        logger.info(`Listening on 127.0.0.1:${PORT}`);
      });
      handleError();
    })
    .catch((error: Error) => {
      logger.error('Error connecting to MongoDB: ' + error.message);
      process.exit(1);
    });
};

export { startApp };
