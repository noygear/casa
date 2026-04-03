import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import { AppError } from '../errors/AppError.js';
import { ValidationError } from '../errors/ValidationError.js';
import { TransitionError } from '../errors/TransitionError.js';
import { WorkOrderTransitionError } from '../../../src/domain/workOrderStateMachine.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  // Domain state machine error
  if (err instanceof WorkOrderTransitionError) {
    res.status(409).json({
      error: 'INVALID_TRANSITION',
      message: err.reason,
      fromStatus: err.fromStatus,
      toStatus: err.toStatus,
    });
    return;
  }

  // Validation error with Zod issues
  if (err instanceof ValidationError) {
    res.status(400).json({
      error: err.code,
      message: err.message,
      issues: err.issues,
    });
    return;
  }

  // Transition error
  if (err instanceof TransitionError) {
    res.status(409).json({
      error: err.code,
      message: err.message,
      fromStatus: err.fromStatus,
      toStatus: err.toStatus,
    });
    return;
  }

  // Prisma UUID parse error — stale token with a non-UUID user ID
  if (err instanceof PrismaClientKnownRequestError && err.code === 'P2023') {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Invalid session. Please log in again.',
    });
    return;
  }

  // Generic app errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
    return;
  }

  // Unhandled errors
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
  });
}
