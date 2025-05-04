import { Logger } from 'winston';

interface LoggerWithStream extends Logger {
  stream: {
    write(message: string): void;
  };
}

declare const logger: LoggerWithStream;
export default logger;