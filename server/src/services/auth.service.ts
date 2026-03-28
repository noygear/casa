import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../prisma.js';
import { UnauthorizedError } from '../errors/AuthError.js';
import { NotFoundError } from '../errors/NotFoundError.js';

const TOKEN_EXPIRY = '24h';
const SALT_ROUNDS = 12;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return secret;
}

export function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.passwordHash) {
    throw new UnauthorizedError('Account not configured for password login');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const jti = uuidv4();
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId,
      jti,
    },
    getJwtSecret(),
    { expiresIn: TOKEN_EXPIRY }
  );

  const { passwordHash: _, ...safeUser } = user;
  return { token, user: safeUser };
}

export async function logout(jti: string, expiresAt: Date) {
  await prisma.revokedToken.create({
    data: { jti, expiresAt },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User', userId);
  }
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}
