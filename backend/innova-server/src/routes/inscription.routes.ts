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

inscriptionsRouter.get(
  '/inscriptions/by-admin',
  requireRole('gerente'),
  asyncHandler(inscriptionController.listInscriptionsByAdmin)
);

inscriptionsRouter.post(
  '/inscriptions',
  requireRole('admin'),
  asyncHandler(inscriptionController.createInscription)
);

inscriptionsRouter.put(
  '/inscriptions/nota',
  requireRole('admin'),
  asyncHandler(inscriptionController.updateNota)
);