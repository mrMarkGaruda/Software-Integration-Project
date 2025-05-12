// src/middleware/winston.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message, ...meta }) =>
        `${timestamp} [${level}]: ${message}${
          Object.keys(meta).length ? ' ' + JSON.stringify(meta) : ''
        }`
    )
  ),
  transports: [
    // write all logs with level `info` and below to ./logs/app.log
    new winston.transports.File({
      filename: './logs/app.log',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),

    // also log to the console
    new winston.transports.Console(),
  ],
});

export default logger;
