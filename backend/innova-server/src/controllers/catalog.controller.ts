import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function listPromotions(req: Request, res: Response): Promise<void> {
  const onlyActive = req.query.active === 'true';

  const rows = await prisma.promocion.findMany({
    where: onlyActive ? { activa: true } : undefined,
    orderBy: { id: 'desc' },
    include: {
      cursos: {
        include: { curso: true },
      },
    },
  });

  res.json(
    rows.map((row) => ({
      id: row.id,
      titulo: row.nombre,
      periodo: row.periodo,
      activa: row.activa,
      cursos: row.cursos.map((pc) => ({
        id: pc.curso.id,
        nombre: pc.curso.nombre,
      })),
    })),
  );
}

export async function createPromotion(req: Request, res: Response): Promise<void> {
  const { titulo, cursos } = req.body as { titulo: string; cursos: Array<string | number> };

  if (!titulo || !Array.isArray(cursos) || cursos.length === 0) {
    res.status(400).json({ message: 'Datos incompletos' });
    return;
  }

  const cursosNumericos = cursos.every((curso) => typeof curso === 'number');

  const cursoRecords = await prisma.curso.findMany({
    where: cursosNumericos
      ? { id: { in: cursos as number[] } }
      : { nombre: { in: cursos as string[] } },
    select: { id: true },
  });

  if (cursoRecords.length !== cursos.length) {
    res.status(400).json({ message: 'Algunos cursos no existen' });
    return;
  }

  const promocion = await prisma.promocion.create({
    data: {
      nombre: titulo,
      periodo: '',
      activa: true,
    },
  });

  await prisma.promocionCurso.createMany({
    data: cursoRecords.map((c) => ({
      promocionId: promocion.id,
      cursoId: c.id,
    })),
  });

  res.status(201).json({ id: promocion.id });
}

export async function updatePromotion(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { titulo, cursos } = req.body as { titulo: string; cursos: number[] };
  const promotionId = Number(id);

  if (!titulo || !Array.isArray(cursos) || cursos.length === 0) {
    res.status(400).json({ message: 'Datos incompletos' });
    return;
  }

  const uniqueCourseIds = Array.from(new Set(cursos.map(Number))).filter(Boolean);
  const cursoRecords = await prisma.curso.findMany({
    where: { id: { in: uniqueCourseIds } },
    select: { id: true },
  });

  if (cursoRecords.length !== uniqueCourseIds.length) {
    res.status(400).json({ message: 'Algunos cursos no existen' });
    return;
  }

  try {
    await prisma.$transaction([
      prisma.promocion.update({
        where: { id: promotionId },
        data: {
          nombre: titulo,
        },
      }),
      prisma.promocionCurso.deleteMany({
        where: { promocionId: promotionId },
      }),
      prisma.promocionCurso.createMany({
        data: uniqueCourseIds.map((cursoId) => ({
          promocionId: promotionId,
          cursoId,
        })),
      }),
    ]);

    res.json({ id: promotionId });
  } catch {
    res.status(404).json({ message: 'Promoción no encontrada' });
  }
}

export async function updatePromotionStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { activa } = req.body as { activa?: boolean };

  if (typeof activa !== 'boolean') {
    res.status(400).json({ message: 'Estado requerido' });
    return;
  }

  try {
    const promocion = await prisma.promocion.update({
      where: { id: Number(id) },
      data: { activa },
    });

    res.json({
      id: promocion.id,
      titulo: promocion.nombre,
      periodo: promocion.periodo,
      activa: promocion.activa,
    });
  } catch {
    res.status(404).json({ message: 'Promoción no encontrada' });
  }
}

export async function listAreas(_req: Request, res: Response): Promise<void> {
  const rows = await prisma.area.findMany({
    orderBy: { id: 'asc' },
    include: { cursos: true },
  });

  res.json(
    rows.map((row) => ({
      id: row.id,
      nombre: row.nombre,
      color: row.color,
      cursos: row.cursos.map((curso) => ({ id: curso.id, nombre: curso.nombre })),
    })),
  );
}

export async function createArea(req: Request, res: Response): Promise<void> {
  const { nombre, color } = req.body as { nombre: string; color: string };

  if (!nombre || !color) {
    res.status(400).json({ message: 'Nombre y color requeridos' });
    return;
  }

  const area = await prisma.area.create({
    data: { nombre, color },
  });

  res.status(201).json(area);
}

export async function updateArea(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { nombre, color } = req.body as { nombre: string; color: string };

  if (!nombre || !color) {
    res.status(400).json({ message: 'Nombre y color requeridos' });
    return;
  }

  try {
    const area = await prisma.area.update({
      where: { id: Number(id) },
      data: { nombre, color },
    });
    res.json(area);
  } catch {
    res.status(404).json({ message: 'Área no encontrada' });
  }
}

export async function deleteArea(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    await prisma.area.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch {
    res.status(404).json({ message: 'Área no encontrada' });
  }
}

export async function createCurso(req: Request, res: Response): Promise<void> {
  const { areaId, nombre } = req.body as { areaId: number; nombre: string };

  if (!areaId || !nombre) {
    res.status(400).json({ message: 'areaId y nombre requeridos' });
    return;
  }

  try {
    const curso = await prisma.curso.create({
      data: { nombre, areaId },
    });
    res.status(201).json(curso);
  } catch {
    res.status(400).json({ message: 'Error al crear curso' });
  }
}

export async function updateCurso(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { nombre } = req.body as { nombre: string };

  if (!nombre) {
    res.status(400).json({ message: 'Nombre requerido' });
    return;
  }

  try {
    const curso = await prisma.curso.update({
      where: { id: Number(id) },
      data: { nombre },
    });
    res.json(curso);
  } catch {
    res.status(404).json({ message: 'Curso no encontrado' });
  }
}

export async function deleteCurso(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const cursoId = Number(id);

  try {
    const inscripciones = await prisma.inscripcionCurso.count({
      where: { cursoId },
    });

    if (inscripciones > 0) {
      res.status(400).json({
        message: 'No se puede eliminar un curso con inscripciones registradas',
      });
      return;
    }

    await prisma.$transaction([
      prisma.promocionCurso.deleteMany({ where: { cursoId } }),
      prisma.curso.delete({ where: { id: cursoId } }),
    ]);

    res.status(204).send();
  } catch {
    res.status(404).json({ message: 'Curso no encontrado' });
  }
}
