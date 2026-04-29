import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function listPromotions(
  req: Request,
  res: Response
): Promise<void> {
  const onlyActive = req.query.active === "true";

  const promociones = await prisma.promocion.findMany({
    where: onlyActive ? { activa: true } : undefined,
    include: {
      cursos: {
        include: {
          curso: true,
        },
      },
    },
  });

  res.json(
    promociones.map((p) => ({
      id: p.id,
      titulo: p.nombre,
      periodo: p.periodo,
      activa: p.activa,
      cursos: p.cursos.map((pc) => ({
        id: pc.curso.id,
        nombre: pc.curso.nombre,
      })),
    }))
  );
}
