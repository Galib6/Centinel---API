import { LoggerService } from '@nestjs/common';
import pino from 'pino';
import { ENV } from './env';

export function createLogger(): LoggerService {
  const logFolder = ENV.logFolder;

  // Loki stream for Grafana Loki
  // const lokiStream = createWriteStream({
  //   batching: true,
  //   interval: 5, // seconds
  //   host: 'http://localhost:3100',
  // });

  // Main logger for console and files
  const logger = pino({
    level: 'debug',
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: {
      targets: [
        {
          target: 'pino-pretty',
          level: 'debug',
          options: { colorize: true },
        },
        {
          target: 'pino/file',
          level: 'debug',
          options: { destination: `${logFolder}/app.log`, mkdir: true },
        },
        {
          target: 'pino/file',
          level: 'error',
          options: { destination: `${logFolder}/errors.log`, mkdir: true },
        },
      ],
    },
  });

  // Separate logger for Loki
  const lokiLogger = pino();

  // Adapter to match LoggerService interface
  // ANSI green: \x1b[32m ... \x1b[0m
  function formatNestLog(message: any, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : '';
    // Only colorize for console (pino-pretty)
    return `\x1b[32m[Nest] ${timestamp}${contextStr} ${message}\x1b[0m`;
  }

  const loggerService: LoggerService = {
    log: (message: any, context?: string) => {
      logger.info(formatNestLog(message, context));
      lokiLogger.info({ context }, message);
    },
    error: (message: any, trace?: string, context?: string) => {
      logger.error({ context, trace }, message);
      lokiLogger.error({ context, trace }, message);
    },
    warn: (message: any, context?: string) => {
      logger.warn({ context }, message);
      lokiLogger.warn({ context }, message);
    },
    debug: (message: any, context?: string) => {
      logger.debug({ context }, message);
      lokiLogger.debug({ context }, message);
    },
    verbose: (message: any, context?: string) => {
      logger.info({ context }, message);
      lokiLogger.info({ context }, message);
    },
  };

  return loggerService;
}
