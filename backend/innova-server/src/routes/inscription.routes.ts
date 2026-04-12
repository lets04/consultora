import { Router } from 'express';
import * as inscriptionController from '../controllers/inscription.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middleware/auth.js';
export const inscriptionsRouter = Router();



inscriptionsRouter.get(
  '/inscriptions',
  requireRole('admin'),
  asyncHandler(inscriptionController.listInscriptions)
);

inscriptionsRouter.post(
  '/inscriptions',
  requireRole('admin'),
  asyncHandler(inscriptionController.createInscription)
);