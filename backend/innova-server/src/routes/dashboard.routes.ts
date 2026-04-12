import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middleware/auth.js';
export const dashboardRouter = Router();



dashboardRouter.get(
  '/dashboard/admin',
  requireRole('admin'),
  asyncHandler(dashboardController.getAdminDashboard)
);

dashboardRouter.get(
  '/dashboard/gerente',
  requireRole('gerente'),
  asyncHandler(dashboardController.getGerenteDashboard)
);