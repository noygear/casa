import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors/ValidationError.js';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      (req as any)[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('[validate] Zod validation failed on', source, JSON.stringify(req[source]), '\nIssues:', JSON.stringify(error.issues));
        next(new ValidationError(error));
      } else {
        next(error);
      }
    }
  };
}
