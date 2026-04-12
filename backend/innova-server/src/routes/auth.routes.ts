import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authPublicRouter = Router();

authPublicRouter.post('/auth/login', asyncHandler(authController.login));
authPublicRouter.post('/auth/logout', asyncHandler(authController.logout));

export function createAuthMeRouter(): Router {
  const r = Router();
  r.get('/auth/me', asyncHandler(authController.me));
  return r;
}
