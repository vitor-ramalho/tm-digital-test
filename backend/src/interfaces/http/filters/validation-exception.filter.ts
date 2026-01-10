import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Response } from 'express';

/**
 * Validation Exception Filter
 * Formats class-validator validation errors consistently
 *
 * Transforms validation errors into a cleaner format:
 * {
 *   statusCode: 400,
 *   message: ["field1 error", "field2 error"],
 *   error: "Validation Failed",
 *   timestamp: "2025-01-10T...",
 *   path: "/api/endpoint"
 * }
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    let message: string | string[];

    // Extract validation messages from class-validator
    if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      const responseMessage = (exceptionResponse as any).message;

      // If it's already an array of validation messages, use it directly
      if (Array.isArray(responseMessage)) {
        message = responseMessage;
      } else {
        message = [responseMessage];
      }
    } else {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: 'Validation Failed',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
