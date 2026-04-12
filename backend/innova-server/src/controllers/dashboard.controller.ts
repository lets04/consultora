import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { buildAdminDashboard, buildGerenteDashboard } from '../services/dashboard.service.js';

export async function getAdminDashboard(_req: Request, res: Response): Promise<void> {
  const data = await buildAdminDashboard(prisma);
  res.json(data);
}

export async function getGerenteDashboard(_req: Request, res: Response): Promise<void> {
  const data = await buildGerenteDashboard(prisma);
  res.json(data);
}
