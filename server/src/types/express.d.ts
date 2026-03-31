import { UserRole } from '../../../src/types/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        vendorId: string | null;
      };
    }
  }
}

export {};
