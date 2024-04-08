// api-error.ts

export class ApiError extends Error {
    constructor(public statusCode: number, message: string) {
      super(message);
      this.statusCode = statusCode;
    }
  }