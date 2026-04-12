import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { formatDateEs } from '../utils/dateFormat.js';

export async function listInscriptions(_req: Request, res: Response): Promise<void> {
  const rows = await prisma.inscripcion.findMany({
    orderBy: { creadoEn: 'desc' },
    include: {
      estudiante: true,
      cursos: {
        include: { curso: true },
      },
    },
  });

  res.json(
  rows.map((r) => {
    const total = r.montoTotal;
    const pagado = r.montoPagado;
    const saldo = total - pagado;

    let estadoPago: "pendiente" | "parcial" | "pagado" = "pendiente";
    if (pagado >= total) estadoPago = "pagado";
    else if (pagado > 0) estadoPago = "parcial";

    return {
      id: r.id,
      estudiante: `${r.estudiante.nombres} ${r.estudiante.apellidos}`,
      curso: r.cursos[0]?.curso.nombre ?? "Sin curso",
      tipo: r.tipo === "promocion" ? "Promoción" : "Individual",
      modalidad: r.modalidad === "certificado" ? "Certificado" : "Examen",
      fecha: formatDateEs(r.creadoEn),

      total,
      pagado,
      saldo,
      estadoPago,
    };
  }),
);
}

export async function createInscription(req: Request, res: Response): Promise<void> {
  const {
    studentCi,
    tipo,
    cursoId,
    promocionId,
    modalidad,
    montoTotal,
  } = req.body as {
    studentCi: string;
    tipo: 'individual' | 'promocion';
    cursoId?: number;
    promocionId?: number;
    modalidad: 'certificado' | 'examen';
    montoTotal: number;
  };

  if (!studentCi || !tipo || !modalidad || montoTotal == null) {
    res.status(400).json({ message: 'Datos incompletos' });
    return;
  }

  const estudiante = await prisma.estudiante.findUnique({
    where: { ci: studentCi },
  });

  if (!estudiante) {
    res.status(404).json({ message: 'Estudiante no encontrado' });
    return;
  }

  if (tipo === 'promocion') {
    if (!promocionId) {
      res.status(400).json({ message: 'Promoción requerida' });
      return;
    }

    const promocion = await prisma.promocion.findUnique({
      where: { id: promocionId },
      include: { cursos: { include: { curso: true } } },
    });

    if (!promocion) {
      res.status(404).json({ message: 'Promoción no encontrada' });
      return;
    }

    if (promocion.cursos.length === 0) {
      res.status(400).json({ message: 'La promoción no tiene cursos asignados' });
      return;
    }

    const inscripcion = await prisma.inscripcion.create({
      data: {
        estudianteId: estudiante.id,
        tipo: 'promocion',
        promocionId,
        modalidad,
        estado: 'activo',
        montoTotal,
        montoPagado: 0,
      },
    });

    await prisma.inscripcionCurso.createMany({
      data: promocion.cursos.map((pc) => ({
        inscripcionId: inscripcion.id,
        cursoId: pc.curso.id,
      })),
    });

    res.status(201).json({ id: inscripcion.id });
    return;
  }

  if (tipo === 'individual') {
    if (!cursoId) {
      res.status(400).json({ message: 'Curso requerido' });
      return;
    }

    const curso = await prisma.curso.findUnique({ where: { id: cursoId } });
    if (!curso) {
      res.status(404).json({ message: 'Curso no encontrado' });
      return;
    }

    const inscripcion = await prisma.inscripcion.create({
      data: {
        estudianteId: estudiante.id,
        tipo: 'individual',
        modalidad,
        estado: 'activo',
        montoTotal,
        montoPagado: 0,
      },
    });

    await prisma.inscripcionCurso.create({
      data: {
        inscripcionId: inscripcion.id,
        cursoId: curso.id,
      },
    });

    res.status(201).json({ id: inscripcion.id });
    return;
  }

  res.status(400).json({ message: 'Tipo de inscripción inválido' });
}
