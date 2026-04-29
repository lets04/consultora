import { Router } from 'express';
import * as catalogController from '../controllers/catalog.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const catalogRouter = Router();

import { requireRole } from '../middleware/auth.js';

catalogRouter.get(
  '/promotions',
  requireRole('admin', 'gerente'),
  asyncHandler(catalogController.listPromotions)
);

catalogRouter.get(
  '/areas',
  requireRole('admin', 'gerente'),
  asyncHandler(catalogController.listAreas)
);

catalogRouter.post(
  '/promotions',
  requireRole('gerente'),
  asyncHandler(catalogController.createPromotion)
);

catalogRouter.put(
  '/promotions/:id/status',
  requireRole('gerente'),
  asyncHandler(catalogController.updatePromotionStatus)
);

catalogRouter.post(
  '/areas',
  requireRole('gerente'),
  asyncHandler(catalogController.createArea)
);

catalogRouter.put(
  '/areas/:id',
  requireRole('gerente'),
  asyncHandler(catalogController.updateArea)
);

catalogRouter.delete(
  '/areas/:id',
  requireRole('gerente'),
  asyncHandler(catalogController.deleteArea)
);

catalogRouter.post(
  '/cursos',
  requireRole('gerente'),
  asyncHandler(catalogController.createCurso)
);

catalogRouter.put(
  '/cursos/:id',
  requireRole('gerente'),
  asyncHandler(catalogController.updateCurso)
);

catalogRouter.delete(
  '/cursos/:id',
  requireRole('gerente'),
  asyncHandler(catalogController.deleteCurso)
);
