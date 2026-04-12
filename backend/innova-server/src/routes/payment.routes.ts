import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middleware/auth.js';
export const paymentsRouter = Router();



paymentsRouter.get(
  '/payments/summary',
  requireRole('admin'),
  asyncHandler(paymentController.getSummary)
);

paymentsRouter.get(
  '/payments/:filtro',
  requireRole('admin'),
  asyncHandler(paymentController.listByFiltro)
);

paymentsRouter.post(
  '/payments',
  requireRole('admin'),
  asyncHandler(paymentController.createPayment)
);