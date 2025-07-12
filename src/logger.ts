import { LoggerService } from "@nestjs/common";
import { utilities, WinstonModule, WinstonModuleOptions } from "nest-winston";
import { format, transports } from "winston";
import { ENV } from "./env";

export function createLogger(): LoggerService {
  const logFolder = ENV.logFolder;

  // Console format with colors for development
  const consoleFormat = format.combine(
    format.timestamp(),
    utilities.format.nestLike()
  );

  // File format without colors for clean logs
  const fileFormat = format.combine(
    format.timestamp(),
    format.uncolorize(),
    format.printf(({ timestamp, level, message, context }) => {
      return `${timestamp} [${level.toUpperCase()}] ${context ? `[${context}] ` : ""}${message}`;
    })
  );

  const winstonOptions: WinstonModuleOptions = {
    transports: [
      // Console transport for development with colors
      new transports.Console({
        format: consoleFormat,
        level: "debug",
      }),
      // Combined logs (all levels) without colors
      new transports.File({
        format: fileFormat,
        filename: `${logFolder}/app.log`,
        maxsize: 100 * 1024 * 1024, // 100MB
        maxFiles: 3,
      }),
      // Error logs only without colors
      new transports.File({
        format: fileFormat,
        filename: `${logFolder}/errors.log`,
        level: "error",
        maxsize: 100 * 1024 * 1024, // 100MB
        maxFiles: 3,
      }),
    ],
  };

  return WinstonModule.createLogger(winstonOptions);
}
