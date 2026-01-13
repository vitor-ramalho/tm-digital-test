import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoadingStateService } from '../services/loading-state.service';
import { ErrorHandlerService } from '../services/error-handler.service';

/**
 * HTTP Interceptor for API calls
 * - Manages loading states
 * - Handles errors centrally
 * - Adds common headers
 */
export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingStateService);
  const errorHandler = inject(ErrorHandlerService);

  // Generate loading key from request
  const loadingKey = `${req.method}:${req.url}`;

  // Set loading state
  loadingService.setLoading(loadingKey, true);

  // Clone request with headers
  const clonedRequest = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
    }
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      return errorHandler.handleError(error);
    }),
    finalize(() => {
      // Clear loading state when request completes
      loadingService.setLoading(loadingKey, false);
    })
  );
};
