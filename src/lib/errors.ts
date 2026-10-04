export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string = "APP_ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof AppError) return error.message;
  return fallback;
}
