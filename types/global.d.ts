// Environment variables type definitions
declare namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      DB_USER: string;
      DB_HOST: string;
      DB_NAME: string;
      DB_PASSWORD: string;
      JWT_SECRET_KEY: string;
    }
  }
  
  // Express request augmentation to include user and session properties
  declare namespace Express {
    interface Request {
      user?: {
        id?: string;
        email: string;
      };
      session: {
        user?: {
          _id?: string;
          email?: string;
        };
      } & Express.Session;
    }
  }