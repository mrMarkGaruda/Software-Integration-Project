import winston from 'winston';
import logger from '../../src/middleware/winston';

describe('Winston Logger', () => {
  // Check basic logger configurations
  it('should create a logger with correct configuration', () => {
    expect(logger).toBeDefined();
    expect(logger instanceof winston.Logger).toBeTruthy();
  });

  // Check transport configurations
  it('should have correct transports', () => {
    const transports = logger.transports;

    const fileTransport = transports.find(
      (t) => t instanceof winston.transports.File
    );
    expect(fileTransport).toBeDefined();

    // adjust this to just 'app.log'
    expect(fileTransport?.filename).toBe('app.log');
    expect(fileTransport?.maxsize).toBe(5 * 1024 * 1024);
    expect(fileTransport?.maxFiles).toBe(5);

    const consoleTransport = transports.find(
      (t) => t instanceof winston.transports.Console
    );
    expect(consoleTransport).toBeDefined();
  });

  // Check log level
  it('should have info log level', () => {
    expect(logger.level).toBe('info');
  });

  // Check logging methods
  it('should have standard logging methods', () => {
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  // Check logger format
  it('should have correct log format', () => {
    const format = logger.format;
    expect(format).toBeDefined();
  });
});
