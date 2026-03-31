import { AppError } from './AppError.js';
import { ZodError } from 'zod';

export class ValidationError extends AppError {
  public readonly issues: Array<{ path: string; message: string }>;

  constructor(error: ZodError) {
    super('Validation failed', 400, 'VALIDATION_ERROR');
    this.issues = error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  }
}
