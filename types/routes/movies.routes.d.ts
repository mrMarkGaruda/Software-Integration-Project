import { Router } from 'express';

/**
 * Router instance for movie-related routes:
 * - GET / - Get all movies or movies by category
 * - GET /top - Get top rated movies
 * - GET /me - Get movies seen by the authenticated user
 */
declare const router: Router;

export default router;