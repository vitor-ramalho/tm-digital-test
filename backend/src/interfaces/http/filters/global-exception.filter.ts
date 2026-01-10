import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Error response structure
 */
interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

/**
 * Global Exception Filter
 * Catches all exceptions and formats them consistently
 *
 * HTTP Status Codes used:
 * - 200 OK: Successful GET, PUT
 * - 201 Created: Successful POST
 * - 204 No Content: Successful DELETE
 * - 400 Bad Request: Validation errors, invalid business rules
 * - 404 Not Found: Resource doesn't exist
 * - 409 Conflict: Resource conflict (e.g., duplicate CPF)
 * - 500 Internal Server Error: Unexpected errors
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status: number;
    let message: string | string[];
    let error: string;

    if (exception instanceof HttpException) {
      // Handle NestJS HTTP exceptions
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        message = (exceptionResponse as any).message;
        error = (exceptionResponse as any).error || exception.name;
      } else {
        message = exception.message;
        error = exception.name;
      }
    } else if (exception instanceof Error) {
      // Handle domain/validation errors
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      error = 'Bad Request';

      // Log unexpected errors
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    } else {
      // Handle unknown exceptions
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';

      this.logger.error('Unknown exception', exception);
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log all errors for debugging (except 404s which are common)
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status}`,
        JSON.stringify(errorResponse),
      );
    } else if (status >= 400 && status !== 404) {
      this.logger.warn(`${request.method} ${request.url} - ${status}: ${message}`);
    }

    response.status(status).json(errorResponse);
  }
}
