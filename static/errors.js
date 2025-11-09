class AppError extends Error {
  /**
   * @param message string
   * @param code string */
  constructor(message, code) {
    super(message);

    this.name = "AppError";
    this.message = message;
    this.code = code;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomAppError);
    }
  }
}
