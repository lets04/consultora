import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { formatDateEs } from "../utils/dateFormat.js";

export async function listInscriptions(
  _req: Request,
  res: Response,
): Promise<void> {
  const rows = await prisma.inscripcion.findMany({
    orderBy: { creadoEn: "desc" },
    include: {
      estudiante: true,
      promocion: true,
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

      const cursos = r.cursos.map((c) => c.curso.nombre);
      const cursosTexto =
        cursos.length > 2
          ? `${cursos.slice(0, 2).join(", ")} +${cursos.length - 2} más`
          : cursos.join(", ");
      return {
        id: r.id,
        estudiante: `${r.estudiante.nombres} ${r.estudiante.apellidos}`,
        curso:
          r.tipo === "promocion"
            ? `${r.promocion?.nombre ?? "Promoción"}: ${cursosTexto}`
            : cursosTexto || "Sin curso",
        tipo: r.tipo,
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

export async function createInscription(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.auth?.userId;

  const {
    studentCi,
    tipo,
    cursoId,
    promocionId,
    modalidad,
    montoTotal,
    cursosSeleccionados,
  } = req.body as {
    studentCi: string;
    tipo: "individual" | "promocion";
    cursoId?: number;
    promocionId?: number;
    modalidad: "certificado" | "examen";
    montoTotal: number;
    cursosSeleccionados?: number[];
  };

  if (!studentCi || !tipo || !modalidad || montoTotal == null) {
    res.status(400).json({ message: "Datos incompletos" });
    return;
  }

  const estudiante = await prisma.estudiante.findUnique({
    where: { ci: studentCi },
  });

  if (!estudiante) {
    res.status(404).json({ message: "Estudiante no encontrado" });
    return;
  }

  if (tipo === "promocion") {
    if (!promocionId) {
      res.status(400).json({ message: "Promoción requerida" });
      return;
    }

    const promocion = await prisma.promocion.findUnique({
      where: { id: promocionId },
      include: { cursos: { include: { curso: true } } },
    });

    if (!promocion) {
      res.status(404).json({ message: "Promoción no encontrada" });
      return;
    }

    if (!promocion.activa) {
      res.status(400).json({ message: "La promoción está desactivada" });
      return;
    }

    if (promocion.cursos.length === 0) {
      res
        .status(400)
        .json({ message: "La promoción no tiene cursos asignados" });
      return;
    }

    const inscripcion = await prisma.inscripcion.create({
      data: {
        estudianteId: estudiante.id,
        userId,
        tipo: "promocion",
        promocionId,
        modalidad,
        estado: "activo",
        montoTotal,
        montoPagado: 0,
      },
    });

    const cursosFinales: number[] =
      cursosSeleccionados && cursosSeleccionados.length > 0
        ? cursosSeleccionados
        : promocion.cursos.map((pc) => pc.curso.id);

    await prisma.inscripcionCurso.createMany({
      data: cursosFinales.map((cursoId: number) => ({
        inscripcionId: inscripcion.id,
        cursoId,
      })),
    });

    res.status(201).json({ id: inscripcion.id });
    return;
  }

  if (tipo === "individual") {
    if (!cursoId) {
      res.status(400).json({ message: "Curso requerido" });
      return;
    }

    const curso = await prisma.curso.findUnique({ where: { id: cursoId } });
    if (!curso) {
      res.status(404).json({ message: "Curso no encontrado" });
      return;
    }

    const inscripcion = await prisma.inscripcion.create({
      data: {
        estudianteId: estudiante.id,
        userId,
        tipo: "individual",
        modalidad,
        estado: "activo",
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

  res.status(400).json({ message: "Tipo de inscripción inválido" });
}

export async function updateNota(
  req: Request,
  res: Response,
): Promise<void> {
  const { id, nota } = req.body as { id: number; nota: number };

  if (id == null || nota == null || nota < 0 || nota > 100) {
    res.status(400).json({ message: "Datos inválidos" });
    return;
  }

  try {
    await prisma.inscripcionCurso.update({
      where: { id },
      data: { nota },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar nota" });
  }
}

// Endpoint para que el gerente vea inscripciones agrupadas por admin
export async function listInscriptionsByAdmin(
  _req: Request,
  res: Response,
): Promise<void> {
  const rows = await prisma.inscripcion.findMany({
    orderBy: { creadoEn: "desc" },
    include: {
      estudiante: true,
      user: {
        select: { id: true, email: true },
      },
      promocion: true,
      cursos: {
        include: { curso: true },
      },
    },
  });

  type AdminInscripcion = {
    id: number;
    estudianteCi: string;
    estudiante: string;
    curso: string;
    tipo: string | null;
    modalidad: string;
    fecha: string;
    total: number;
    pagado: number;
    saldo: number;
    estadoPago: "pendiente" | "parcial" | "pagado";
  };

  // Agrupar por admin
  const groupedByAdmin = rows.reduce<Record<string, AdminInscripcion[]>>((acc, r) => {
    const adminEmail = r.user?.email ?? "Sin asignar";
    if (!acc[adminEmail]) {
      acc[adminEmail] = [];
    }

    const total = r.montoTotal;
    const pagado = r.montoPagado;
    const saldo = total - pagado;

    let estadoPago: "pendiente" | "parcial" | "pagado" = "pendiente";
    if (pagado >= total) estadoPago = "pagado";
    else if (pagado > 0) estadoPago = "parcial";

    const cursos = r.cursos.map((c) => c.curso.nombre);
    const cursosTexto =
      cursos.length > 2
        ? `${cursos.slice(0, 2).join(", ")} +${cursos.length - 2} más`
        : cursos.join(", ");

    acc[adminEmail].push({
      id: r.id,
      estudianteCi: r.estudiante.ci,
      estudiante: `${r.estudiante.nombres} ${r.estudiante.apellidos}`,
      curso:
        r.tipo === "promocion"
          ? `${r.promocion?.nombre ?? "Promoción"}: ${cursosTexto}`
          : cursosTexto || "Sin curso",
      tipo: r.tipo,
      modalidad: r.modalidad === "certificado" ? "Certificado" : "Examen",
      fecha: formatDateEs(r.creadoEn),
      total,
      pagado,
      saldo,
      estadoPago,
    });
    return acc;
  }, {});

  // Calcular estadísticas por admin
  const stats = Object.entries(groupedByAdmin).map(([adminEmail, inscripciones]) => ({
    adminEmail,
    totalInscripciones: inscripciones.length,
    totalMonto: inscripciones.reduce((sum, i) => sum + i.total, 0),
    totalPagado: inscripciones.reduce((sum, i) => sum + i.pagado, 0),
    pendiente: inscripciones.filter((i) => i.estadoPago === "pendiente").length,
    parcial: inscripciones.filter((i) => i.estadoPago === "parcial").length,
    pagado: inscripciones.filter((i) => i.estadoPago === "pagado").length,
    inscripciones,
  }));

  res.json(stats);
}
