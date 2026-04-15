import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function listPromotions(
  _req: Request,
  res: Response
): Promise<void> {
  const promociones = await prisma.promocion.findMany({
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
      cursos: p.cursos.map((pc) => ({
        id: pc.curso.id,
        nombre: pc.curso.nombre,
      })),
    }))
  );
}