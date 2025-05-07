// types/global.d.ts
import 'express-serve-static-core'; // Augment Express core types
import 'express-session'; // Augment express‑session types

// 1. Environment variables
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

// 2. Extend Express’s Request (via express‑serve‑static‑core)
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id?: string;
      email: string;
    };
  }
}

// 3. Extend session data
declare module 'express-session' {
  interface SessionData {
    user?: {
      _id?: string;
      email?: string;
    };
  }
}
