/**
 * Standard API Error Response
 */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

/**
 * Loading State
 */
export interface LoadingState {
  [key: string]: boolean;
}
