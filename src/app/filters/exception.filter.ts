import {
  ArgumentsHost,
  Catch,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
  ExceptionFilter as NestExceptionFilter,
} from "@nestjs/common";
import { ENV } from "@src/env";

@Catch()
export class ExceptionFilter implements NestExceptionFilter {
  private readonly logger = new Logger(ExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let statusCode: number;
    let errorMessages: string[] = [exception.message];

    // Enhanced error logging with detailed information
    const errorDetails = {
      message: exception?.message || "Unknown error",
      stack: exception?.stack,
      name: exception?.name || exception?.constructor?.name,
      url: request?.url,
      method: request?.method,
      timestamp: new Date().toISOString(),
    };

    // Log different levels based on error type
    if (exception instanceof HttpException) {
      this.logger.warn(
        `HTTP Exception [${exception.getStatus()}]: ${exception.message} | URL: ${request?.url} | Method: ${request?.method}`,
      );
    } else {
      this.logger.error(
        `Unhandled Exception: ${errorDetails.message} | Type: ${errorDetails.name} | URL: ${errorDetails.url} | Method: ${errorDetails.method}`,
        errorDetails.stack,
      );
    }

    if (exception instanceof TypeError) {
      errorMessages = errorMessages;

      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

      if (exception.message) {
        errorMessages = [exception.message];
      } else {
        errorMessages = ["Internal Server Error"];
      }
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res: any = exception.getResponse();
      if (exception instanceof ForbiddenException) {
        errorMessages = ["Unauthorized request"];
      } else {
        errorMessages =
          typeof res.message === "string" ? [res.message] : res.message;
      }
    } else {
      if (
        exception?.message &&
        exception.message.includes(
          "duplicate key value violates unique constraint",
        )
      ) {
        const field = exception.detail.split("Key (")[1].split(")")[0];
        errorMessages = [`${field} already exists`];
        statusCode = HttpStatus.CONFLICT;
      } else if (
        exception?.message &&
        exception.message.includes("null value in column")
      ) {
        const field = exception.column;
        errorMessages = [`${field} is required`];
        statusCode = HttpStatus.BAD_REQUEST;
      }
      errorMessages = errorMessages ? errorMessages : ["Internal Server Error"];
      statusCode = statusCode ? statusCode : HttpStatus.INTERNAL_SERVER_ERROR;
    }

    const handleErrorMessage = (errorMessages) => {
      if (
        Array.isArray(errorMessages) &&
        errorMessages?.length &&
        ENV.config.isDevelopment
      ) {
        return [
          ...(exception.response?.detail ? [exception.response?.detail] : []),
          errorMessages[0],
        ];
      } else if (Array.isArray(errorMessages) && errorMessages?.length) {
        return [errorMessages[0]];
      } else {
        return "something went wrong";
      }
    };

    const res = {
      success: false,
      statusCode: statusCode,
      errorMessages: handleErrorMessage(errorMessages),
      // exception,
    };
    response.status(statusCode).json(res);
  }
}
