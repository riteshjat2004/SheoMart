export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public stage?: string;

  constructor(message: string, statusCode = 500, stage?: string) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true;
    this.stage = stage;

    Error.captureStackTrace(this, this.constructor);
  }
}