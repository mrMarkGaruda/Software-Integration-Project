import { Application } from 'express';

/**
 * Register core middleware components for the Express application
 */
export declare const registerCoreMiddleWare: () => void;

/**
 * Handle uncaught exceptions in the application
 */
export declare const handleError: () => void;

/**
 * Connect to MongoDB and start the application
 */
export declare const startApp: () => Promise<void>;

/**
 * Express application instance
 */
export declare const app: Application;