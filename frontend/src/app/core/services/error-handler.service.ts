import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ApiError } from '../models/api-response.model';

/**
 * Error Handling Service
 * Centralized error processing and user-friendly messages
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  /**
   * Handle HTTP errors
   */
  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage: string;

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Erro de rede: ${error.error.message}`;
    } else {
      // Backend error
      const apiError = error.error as ApiError;
      errorMessage = this.extractErrorMessage(apiError, error.status);
    }

    console.error('HTTP Error:', error);
    console.error('User-friendly message:', errorMessage);

    return throwError(() => ({
      message: errorMessage,
      originalError: error,
      statusCode: error.status
    }));
  }

  /**
   * Extract user-friendly error message from API error
   */
  private extractErrorMessage(apiError: ApiError, status: number): string {
    if (apiError?.message) {
      // Handle array of messages
      if (Array.isArray(apiError.message)) {
        return apiError.message.join(', ');
      }
      return apiError.message;
    }

    // Default messages based on status code
    switch (status) {
      case 400:
        return 'Dados inválidos. Por favor, verifique as informações.';
      case 404:
        return 'Recurso não encontrado.';
      case 409:
        return 'Conflito: este registro já existe.';
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.';
      case 503:
        return 'Serviço temporariamente indisponível.';
      default:
        return 'Ocorreu um erro. Por favor, tente novamente.';
    }
  }

  /**
   * Get user-friendly validation message
   */
  getValidationMessage(field: string, error: string): string {
    const messages: { [key: string]: string } = {
      required: `${field} é obrigatório`,
      minlength: `${field} deve ter no mínimo {requiredLength} caracteres`,
      maxlength: `${field} deve ter no máximo {requiredLength} caracteres`,
      email: `${field} deve ser um e-mail válido`,
      pattern: `${field} está em formato inválido`,
      min: `${field} deve ser no mínimo {min}`,
      max: `${field} deve ser no máximo {max}`
    };

    return messages[error] || `${field} é inválido`;
  }
}
