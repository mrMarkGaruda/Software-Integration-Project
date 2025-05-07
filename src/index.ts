import dotenv from 'dotenv';
dotenv.config();

import { startApp } from './boot/setup';

(async () => {
  try {
    await startApp();
  } catch (error: unknown) {
    console.error('Error in index.ts => startApp');
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error(`Error: ${JSON.stringify(error, null, 2)}`);
    }
  }
})();
