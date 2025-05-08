import dotenv from 'dotenv';
dotenv.config();

import { startApp } from './boot/setup';
import logger from './middleware/winston';

(async function runApp(): Promise<void> {
  try {
    await startApp();
  } catch (error: unknown) {
    logger.error('Error in index.ts => startApp');
    if (error instanceof Error) {
      logger.error(`Error: ${error.message}`);
    } else {
      logger.error(`Error: ${JSON.stringify(error, null, 2)}`);
    }
  }
})();
