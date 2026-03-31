import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../../src/types/index.js';
import { ForbiddenError } from '../errors/AuthError.js';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError(`Role '${req.user.role}' does not have access to this resource`));
      return;
    }

    next();
  };
}
