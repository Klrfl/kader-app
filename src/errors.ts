export class AppError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "AppError";

    this.message = message;
    this.code = code;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}
