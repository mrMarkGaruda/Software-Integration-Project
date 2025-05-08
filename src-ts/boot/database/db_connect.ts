import * as pg from 'pg';
import logger from '../../middleware/winston';

/**
 * Database configuration
 */
interface DbConfig {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
  max: number;
}

const db_config: DbConfig = {
  user: process.env.DB_USER!,
  host: process.env.DB_HOST!,
  database: process.env.DB_NAME!,
  password: process.env.DB_PASSWORD!,
  port: 5432,
  max: 10,
};

let db_connection: pg.Pool;

/**
 * Start PostgreSQL connection
 */
function startConnection(): void {
  // type parsers here
  pg.types.setTypeParser(1082, (stringValue: string): string => stringValue);

  db_connection = new pg.Pool(db_config);

  db_connection.connect((err: Error | null) => {
    if (!err) {
      logger.info('PostgreSQL Connected');
    } else {
      logger.error('PostgreSQL Connection Failed');
    }
  });

  db_connection.on('error', (err: Error) => {
    logger.error('Unexpected error on idle client');
    logger.error(err.message);
    startConnection();
  });
}

startConnection();

export default db_connection;
