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
 * Register core middleware components
 */
const registerCoreMiddleWare = (): void => {
  try {
    // using our session
    app.use(
      session({
        secret: '1234',
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: false,
          httpOnly: true,
        },
      })
    );

    app.use(morgan('combined', { stream: logger.stream }));
    app.use(express.json()); // returning middleware that only parses Json
    app.use(cors({})); // enabling CORS
    app.use(helmet()); // enabling helmet -> setting response headers

    app.use(validator);
    app.use(healthCheck);

    app.use('/auth', authRoutes);
    app.use('/users', usersRoutes);

    // Route registration
    app.use('/messages', verifyToken, messageRoutes);
    app.use('/profile', verifyToken, profileRoutes);
    app.use('/movies', verifyToken, moviesRoutes);
    app.use('/ratings', verifyToken, ratingRoutes);
    app.use('/comments', verifyToken, commentsRoutes);

    // 404 handling for not found
    app.use(notFound);

    logger.http('Done registering all middlewares');
  } catch (err) {
    logger.error('Error thrown while executing registerCoreMiddleWare');
    process.exit(1);
  }
};

/**
 * Handle uncaught exceptions 
 */
const handleError = (): void => {
  // 'process' is a built it object in nodejs
  // if uncaught exception, then we execute this
  process.on('uncaughtException', (err: Error) => {
    logger.error(`UNCAUGHT_EXCEPTION OCCURED : ${JSON.stringify(err.stack)}`);
  });
};

/**
 * Connect to MongoDB and start the application
 */
const startApp = (): void => {
  try {
    // Connect to MongoDB
    mongoose.connect('mongodb://localhost:27017/epita')
      .then(() => {
        logger.info('MongoDB Connected');
        
        // register core application level middleware
        registerCoreMiddleWare();

        app.listen(PORT, () => {
          logger.info('Listening on 127.0.0.1:' + PORT);
        });

        // exit on uncaught exception
        handleError();
      })
      .catch((error) => {
        logger.error('Error connecting to DB' + error);
      });
  } catch (err) {
    logger.error(
      `startup :: Error while booting the application ${JSON.stringify(
        err,
        undefined,
        2
      )}`
    );
    throw err;
  }
};

export { startApp };