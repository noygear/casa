import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../validation/auth.schema.js';
import * as authService from '../services/auth.service.js';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);

    res.cookie('token', token, authService.getCookieOptions());
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.decode(token) as any;
      if (decoded?.jti && decoded?.exp) {
        await authService.logout(decoded.jti, new Date(decoded.exp * 1000));
      }
    }

    res.clearCookie('token', { path: '/' });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getMe(req.user!.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
