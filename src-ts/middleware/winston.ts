import winston from 'winston';

// Define custom settings for each transport
interface LoggerOptions {
  file: winston.transports.FileTransportOptions;
  console: winston.transports.ConsoleTransportOptions;
}

const options: LoggerOptions = {
  file: {
    level: 'info',
    filename: `./logs/app.log`,
    handleExceptions: true,
    maxsize: 5242880, // about 5MB
    maxFiles: 5,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  },
};

// Instantiate a new Winston Logger with the options defined above
const logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false,
});

// Create a stream object with a 'write' function that will be used by morgan
interface LoggerStream {
  write(message: string): void;
}

const loggerStream: LoggerStream = {
  write: (message: string): void => {
    // Here we're using the 'info' log level so the output will
    // be picked by both transports (file and console)
    logger.info(message.trim());
  },
};

// Create a custom logger object with the stream property
const customLogger = {
  ...logger,
  stream: loggerStream,
};

export default customLogger;
