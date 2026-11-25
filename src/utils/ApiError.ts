export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', details?: unknown) {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }
  static unauthorized(message = 'Unauthorized', details?: unknown) {
    return new ApiError(401, 'UNAUTHORIZED', message, details);
  }
  static forbidden(message = 'Forbidden', details?: unknown) {
    return new ApiError(403, 'FORBIDDEN', message, details);
  }
  static notFound(message = 'Not found', details?: unknown) {
    return new ApiError(404, 'NOT_FOUND', message, details);
  }
  static conflict(message = 'Conflict', details?: unknown) {
    return new ApiError(409, 'CONFLICT', message, details);
  }
  static validation(message = 'Validation error', details?: unknown) {
    return new ApiError(422, 'VALIDATION_ERROR', message, details);
  }
  static internal(message = 'Internal server error', details?: unknown) {
    return new ApiError(500, 'INTERNAL_ERROR', message, details);
  }
}