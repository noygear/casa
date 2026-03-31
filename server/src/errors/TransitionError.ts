import { AppError } from './AppError.js';

export class TransitionError extends AppError {
  public readonly fromStatus: string;
  public readonly toStatus: string;

  constructor(fromStatus: string, toStatus: string, reason: string) {
    super(reason, 409, 'INVALID_TRANSITION');
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
  }
}
