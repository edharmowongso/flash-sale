export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super("BAD_REQUEST", message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super("CONFLICT", message, 409);
  }
}

export class GoneError extends AppError {
  constructor(message: string) {
    super("GONE", message, 410);
  }
}
