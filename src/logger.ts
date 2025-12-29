/**
 * Enhanced logger service (pino-backed)
 * - Provides Nest-compatible logging methods: log, error, warn, debug, verbose
 * - Adds: setLogLevel, logPerformance, flush
 * - Writes rotated JSON logs: app.log, error.log, debug.log (configurable via env)
 * - Pretty-printed, colorized console output in development for easier debugging
 *
 * The service intentionally exposes a small public API to keep usage simple and testable.
 */
import { Injectable, LoggerService, OnModuleDestroy } from '@nestjs/common';
import pino from 'pino';
import { ENV } from './env';

interface ILoggerConfig {
  fileRotation?: {
    maxSize?: string;
    maxFiles?: number;
  };
  logLevel?: string;
}

// Singleton to manage logger instances and prevent port conflicts
class LoggerManager {
  private static instance: LoggerManager;
  private loggers: Map<string, pino.Logger> = new Map();

  private constructor() {}

  static getInstance(): LoggerManager {
    if (!LoggerManager.instance) {
      LoggerManager.instance = new LoggerManager();
    }
    return LoggerManager.instance;
  }

  createLogger(config: ILoggerConfig, name = 'default'): pino.Logger {
    if (this.loggers.has(name)) {
      return this.loggers.get(name)!;
    }

    const logger = this.buildLogger(config);
    this.loggers.set(name, logger);
    return logger;
  }

  clearLoggers(): void {
    this.loggers.clear();
  }

  getActiveLoggersCount(): number {
    return this.loggers.size;
  }

  private buildLogger(config: ILoggerConfig): pino.Logger {
    const {
      fileRotation = {
        maxSize: ENV.logMaxSize || '100m',
        maxFiles: ENV.logMaxFiles || 5,
      },
      logLevel = ENV.config?.nodeEnv === 'production' ? 'info' : 'debug',
    } = config;

    const logFolder = ENV.logFolder || './logs';
    const isDevelopment = ENV.config?.isDevelopment || ENV.config?.nodeEnv !== 'production';

    const targets: any[] = [];

    // Console transport (only in development)
    if (isDevelopment) {
      targets.push({
        target: 'pino-pretty',
        level: logLevel,
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname,service,env',
          messageFormat: '[{context}] {msg}',
          levelFirst: true,
          singleLine: true,
        },
      });
    }

    // File transports with rotation
    targets.push(
      {
        target: 'pino-roll',
        level: logLevel,
        options: {
          file: `${logFolder}/app.log`,
          frequency: 'daily',
          size: fileRotation.maxSize,
          maxFiles: fileRotation.maxFiles,
          mkdir: true,
        },
      },
      {
        target: 'pino-roll',
        level: 'error',
        options: {
          file: `${logFolder}/error.log`,
          frequency: 'daily',
          size: fileRotation.maxSize,
          maxFiles: fileRotation.maxFiles,
          mkdir: true,
        },
      }
    );

    // Human-readable debug logs (pretty-printed) to help with local debugging
    // This produces non-colored, pretty output suitable for quick inspection of `./logs/debug.log`.
    targets.push({
      target: 'pino-roll',
      level: 'debug',
      options: {
        file: `${logFolder}/debug.log`,
        frequency: 'daily',
        size: fileRotation.maxSize,
        maxFiles: fileRotation.maxFiles,
        mkdir: true,
      },
    });

    return pino({
      level: logLevel,
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        log: (object: any) => {
          const { context, ...rest } = object;
          return {
            ...rest,
            ...(context && { context }),
          };
        },
      },
      serializers: {
        err: pino.stdSerializers.err,
        error: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res,
      },
      transport: {
        targets,
      },
      base: {
        service: ENV.serviceName || 'centinel-api',
        env: ENV.config?.nodeEnv || 'development',
        pid: process.pid,
      },
    });
  }
}

// Enhanced LoggerService interface
export interface IExtendedLoggerService extends LoggerService {
  setLogLevel: (level: string) => void;
  logPerformance: (
    operation: string,
    duration: number,
    context?: string,
    metadata?: Record<string, any>
  ) => void;
  flush: () => Promise<void>;
}

// Injectable Logger Service with proper lifecycle management
@Injectable()
export class EnhancedLoggerService implements IExtendedLoggerService, OnModuleDestroy {
  private logger: pino.Logger;
  private loggerManager: LoggerManager;
  private isInitialized = false;

  constructor(private config: ILoggerConfig = {}) {
    this.loggerManager = LoggerManager.getInstance();
    this.initialize();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.isInitialized) {
      await this.flush();
      this.isInitialized = false;
      this.loggerManager.clearLoggers();
    }
  }

  log(message: any, context?: string): void {
    const childLogger = this.createChildLogger(context);

    if (typeof message === 'string') {
      childLogger.info(message);
    } else {
      childLogger.info(message, 'Log');
    }
  }

  error(message: any, trace?: string, context?: string): void {
    const childLogger = this.createChildLogger(context);

    if (message instanceof Error) {
      childLogger.error(
        {
          err: message,
          stack: message.stack,
          trace,
        },
        message.message
      );
    } else if (typeof message === 'string') {
      childLogger.error(
        {
          trace,
          stack: trace,
        },
        message
      );
    } else {
      childLogger.error(
        {
          trace,
          ...message,
        },
        'Error occurred'
      );
    }
  }

  warn(message: any, context?: string): void {
    const childLogger = this.createChildLogger(context);

    if (typeof message === 'string') {
      childLogger.warn(message);
    } else {
      childLogger.warn(message, 'Warning');
    }
  }

  debug(message: any, context?: string): void {
    const childLogger = this.createChildLogger(context);

    if (typeof message === 'string') {
      childLogger.debug(message);
    } else {
      childLogger.debug(message, 'Debug');
    }
  }

  verbose(message: any, context?: string): void {
    const childLogger = this.createChildLogger(context);

    if (typeof message === 'string') {
      childLogger.trace(message);
    } else {
      childLogger.trace(message, 'Verbose');
    }
  }

  setLogLevel(level: string): void {
    if (this.isInitialized) {
      this.logger.level = level;
    }
  }

  // NOTE: `logWithMetadata` removed to keep the API small; use `log`/`error`/`debug` + object payloads instead.

  logPerformance(
    operation: string,
    duration: number,
    context?: string,
    metadata?: Record<string, any>
  ): void {
    const childLogger = this.createChildLogger(context);
    childLogger.info(
      {
        operation,
        duration,
        performance: true,
        ...metadata,
      },
      `Operation ${operation} completed in ${duration}ms`
    );
  }

  async flush(): Promise<void> {
    if (this.isInitialized) {
      return new Promise<void>((resolve) => {
        this.logger.flush(() => resolve());
      });
    }
  }

  // internal helpers are intentionally limited; avoid exposing manager control publicly.

  private initialize(): void {
    try {
      const effectiveConfig = this.getEffectiveConfig();
      this.logger = this.loggerManager.createLogger(
        effectiveConfig,
        `${ENV.serviceName}-${Date.now()}`
      );
      this.isInitialized = true;
      this.logger.info(
        { fileRotation: effectiveConfig.fileRotation },
        'Logger service initialized successfully'
      );
    } catch (error) {
      console.error('Failed to initialize logger:', error);
      throw error;
    }
  }

  private getEffectiveConfig(): ILoggerConfig {
    const isDevelopment = ENV.config?.isDevelopment || ENV.config?.nodeEnv !== 'production';
    const isProduction = !isDevelopment;

    return {
      fileRotation: {
        maxSize: ENV.logMaxSize || '50m',
        maxFiles: ENV.logMaxFiles || 10,
      },
      logLevel: isProduction ? 'info' : 'debug',
      ...this.config,
    };
  }

  private createChildLogger(context?: string): pino.Logger {
    if (!this.isInitialized) {
      this.initialize();
    }
    return context ? this.logger.child({ context }) : this.logger;
  }
}

// Factory functions for backward compatibility
export function createLogger(): IExtendedLoggerService {
  return new EnhancedLoggerService();
}

export function createCustomLogger(config: ILoggerConfig = {}): IExtendedLoggerService {
  return new EnhancedLoggerService(config);
}

export function createProductionLogger(): IExtendedLoggerService {
  return new EnhancedLoggerService({
    fileRotation: {
      maxSize: '50m',
      maxFiles: 10,
    },
    logLevel: 'info',
  });
}

// Enhanced Performance logging decorator
export function LogPerformance(operation?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const operationName = operation || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      const logger = this.logger || global.logger;

      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - start;

        if (logger && typeof logger.logPerformance === 'function') {
          logger.logPerformance(operationName, duration, target.constructor.name);
        }

        return result;
      } catch (error) {
        const duration = Date.now() - start;

        if (logger && typeof logger.logPerformance === 'function') {
          logger.logPerformance(operationName, duration, target.constructor.name, {
            error: true,
            errorMessage: error instanceof Error ? error.message : String(error),
          });
        }

        throw error;
      }
    };

    return descriptor;
  };
}

// Health check function for monitoring
export function createLoggerHealthCheck(): {
  checkHealth: () => Promise<{ status: string; details: Record<string, any> }>;
} {
  return {
    checkHealth: async (): Promise<{ status: string; details: Record<string, any> }> => {
      const loggerManager = LoggerManager.getInstance();

      return {
        status: 'ok',
        details: {
          activeLoggers: loggerManager.getActiveLoggersCount(),
          pid: process.pid,
          uptime: process.uptime(),
        },
      };
    },
  };
}
