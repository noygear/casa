import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { UnauthorizedError } from '../errors/AuthError.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  vendorId: string | null;
  jti: string;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.token;
    if (!token) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const payload = jwt.verify(token, secret) as JwtPayload;

    if (!UUID_RE.test(payload.sub)) {
      throw new UnauthorizedError('Invalid session. Please log in again.');
    }

    if (payload.vendorId !== null && !UUID_RE.test(payload.vendorId)) {
      throw new UnauthorizedError('Invalid session. Please log in again.');
    }

    // Check if token has been revoked
    const revoked = await prisma.revokedToken.findUnique({
      where: { jti: payload.jti },
    });

    if (revoked) {
      throw new UnauthorizedError('Token has been revoked');
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role as any,
      vendorId: payload.vendorId,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
}
