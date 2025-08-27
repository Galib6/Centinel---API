import { Injectable, LoggerService, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import pino from 'pino';
import { ENV } from './env';

interface ILoggerConfig {
  enableLoki?: boolean;
  lokiConfig?: {
    host: string;
    batchingEnabled?: boolean;
    batchInterval?: number;
    labels?: Record<string, string>;
    basicAuth?: string;
  };
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
      enableLoki = false,
      lokiConfig = {
        host: 'http://localhost:3100',
        batchingEnabled: true,
        batchInterval: 5,
        labels: {},
      },
      fileRotation = {
        maxSize: '50m',
        maxFiles: 10,
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
          translateTime: 'HH:MM:ss',
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
          mkdir: true,
        },
      }
    );

    // Loki transport (if enabled) - with unique instance to prevent conflicts
    if (enableLoki) {
      targets.push({
        target: 'pino-loki',
        level: logLevel,
        options: {
          batching: lokiConfig.batchingEnabled,
          interval: lokiConfig.batchInterval,
          host: lokiConfig.host,
          basicAuth: lokiConfig.basicAuth || undefined,
          labels: {
            service: ENV.serviceName || 'centinel-api',
            environment: ENV.config?.nodeEnv || 'development',
            version: ENV.appVersion || '1.0.0',
            instance: `${ENV.serviceName}-${process.pid}-${Date.now()}`, // Unique instance ID
            ...lokiConfig.labels,
          },
          replaceTimestamp: true,
          convertArrays: false,
          timeout: 30000,
          silenceErrors: false,
        },
      });
    }

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
  logWithMetadata: (
    level: string,
    message: string,
    metadata: Record<string, any>,
    context?: string
  ) => void;
  logPerformance: (
    operation: string,
    duration: number,
    context?: string,
    metadata?: Record<string, any>
  ) => void;
  flush: () => Promise<void>;
  isReady: () => boolean;
}

// Injectable Logger Service with proper lifecycle management
@Injectable()
export class EnhancedLoggerService
  implements IExtendedLoggerService, OnModuleInit, OnModuleDestroy
{
  private logger: pino.Logger;
  private loggerManager: LoggerManager;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(private config: ILoggerConfig = {}) {
    this.loggerManager = LoggerManager.getInstance();
  }

  async onModuleInit(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.initialize();
    return this.initializationPromise;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.isInitialized) {
      await this.flush();
      this.isInitialized = false;
      this.loggerManager.clearLoggers();
    }
  }

  async log(message: any, context?: string): Promise<void> {
    await this.ensureInitialized();
    const childLogger = this.createChildLogger(context);

    if (typeof message === 'string') {
      childLogger.info(message);
    } else {
      childLogger.info(message, 'Log');
    }
  }

  async error(message: any, trace?: string, context?: string): Promise<void> {
    await this.ensureInitialized();
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

  async warn(message: any, context?: string): Promise<void> {
    await this.ensureInitialized();
    const childLogger = this.createChildLogger(context);

    if (typeof message === 'string') {
      childLogger.warn(message);
    } else {
      childLogger.warn(message, 'Warning');
    }
  }

  async debug(message: any, context?: string): Promise<void> {
    await this.ensureInitialized();
    const childLogger = this.createChildLogger(context);

    if (typeof message === 'string') {
      childLogger.debug(message);
    } else {
      childLogger.debug(message, 'Debug');
    }
  }

  async verbose(message: any, context?: string): Promise<void> {
    await this.ensureInitialized();
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

  async logWithMetadata(
    level: string,
    message: string,
    metadata: Record<string, any>,
    context?: string
  ): Promise<void> {
    await this.ensureInitialized();
    const childLogger = this.createChildLogger(context);
    (childLogger as any)[level]({ ...metadata }, message);
  }

  async logPerformance(
    operation: string,
    duration: number,
    context?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.ensureInitialized();
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

  isReady(): boolean {
    return this.isInitialized;
  }

  clearLoggers(): void {
    this.loggerManager.clearLoggers();
  }

  private async initialize(): Promise<void> {
    try {
      this.logger = this.loggerManager.createLogger(
        this.getEffectiveConfig(),
        `${ENV.serviceName}-${Date.now()}`
      );
      this.isInitialized = true;
      this.logger.info('Logger service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize logger:', error);
      throw error;
    }
  }

  private getEffectiveConfig(): ILoggerConfig {
    const isDevelopment = ENV.config?.isDevelopment || ENV.config?.nodeEnv !== 'production';
    const isProduction = !isDevelopment;

    return {
      enableLoki: isProduction && !!ENV.lokiHost,
      lokiConfig: {
        host: ENV.lokiHost || 'http://localhost:3100',
        batchingEnabled: true,
        batchInterval: 5,
        labels: {
          service: ENV.serviceName || 'centinel-api',
          environment: ENV.config?.nodeEnv || 'development',
        },
      },
      fileRotation: {
        maxSize: '50m',
        maxFiles: 10,
      },
      logLevel: isProduction ? 'info' : 'debug',
      ...this.config,
    };
  }

  private createChildLogger(context?: string): pino.Logger {
    if (!this.isInitialized) {
      throw new Error('Logger service not initialized. Call onModuleInit() first.');
    }
    return context ? this.logger.child({ context }) : this.logger;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized && !this.initializationPromise) {
      await this.onModuleInit();
    } else if (this.initializationPromise) {
      await this.initializationPromise;
    }
  }
}

// Factory functions for backward compatibility
export function createLogger(): IExtendedLoggerService {
  return new EnhancedLoggerService();
}

export function createCustomLogger(config: ILoggerConfig = {}): IExtendedLoggerService {
  return new EnhancedLoggerService(config);
}

export function createProductionLogger(lokiHost?: string): IExtendedLoggerService {
  return new EnhancedLoggerService({
    enableLoki: !!lokiHost,
    lokiConfig: {
      host: lokiHost || 'http://localhost:3100',
      batchingEnabled: true,
      batchInterval: 5,
      labels: {
        service: ENV.serviceName || 'centinel-api',
        environment: ENV.config?.nodeEnv || 'production',
      },
    },
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
          await logger.logPerformance(operationName, duration, target.constructor.name);
        }

        return result;
      } catch (error) {
        const duration = Date.now() - start;

        if (logger && typeof logger.logPerformance === 'function') {
          await logger.logPerformance(operationName, duration, target.constructor.name, {
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
