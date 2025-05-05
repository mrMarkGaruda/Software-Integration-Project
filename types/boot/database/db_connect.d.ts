// types/boot/database/db_connect.d.ts
import { Pool } from 'pg';

/**
 * PostgreSQL connection pool.
 */
declare const db_connection: Pool;

export default db_connection;
