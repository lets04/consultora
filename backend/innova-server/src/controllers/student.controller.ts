import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { Student } from "../models/student.model.js";
import { formatDateEs } from "../utils/dateFormat.js";

function getPagoStatus(
  montoTotal: number,
  montoPagado: number,
): "pagado" | "parcial" | "pendiente" {
  if (montoPagado >= montoTotal) return "pagado";
  if (montoPagado > 0) return "parcial";
  return "pendiente";
}

function mapEstudianteToDto(estudiante: {
  id: number;
  nombres: string;
  apellidos: string;
  ci: string;
  creadoEn: Date;
  inscripciones: Array<{
    creadoEn: Date;
    montoTotal: number;
    montoPagado: number;
    estado: string;
    user?: { email: string } | null;
    cursos: Array<{ curso: { nombre: string } }>;
  }>;
}): Student {
  const latestInscripcion = estudiante.inscripciones
    .slice()
    .sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime())[0];

  return {
    id: estudiante.id,
    nombre: `${estudiante.nombres} ${estudiante.apellidos}`,
    ci: estudiante.ci,
    curso: latestInscripcion?.cursos[0]?.curso.nombre ?? "Sin curso",
    inscripcion: latestInscripcion
      ? formatDateEs(latestInscripcion.creadoEn)
      : "N/A",
    pago: latestInscripcion
      ? getPagoStatus(
          latestInscripcion.montoTotal,
          latestInscripcion.montoPagado,
        )
      : "pendiente",
    registro: formatDateEs(estudiante.creadoEn),
    adminEmail: latestInscripcion?.user?.email,
  };
}

function mapEstudianteToDetailDto(estudiante: {
  id: number;
  nombres: string;
  apellidos: string;
  ci: string;
  prefijo: string | null;
  profesion: string | null;
  telefono: string | null;
  email: string | null;
  departamento: string | null;
  inscripciones: Array<{
    id: number;
    creadoEn: Date;
    montoTotal: number;
    montoPagado: number;
    tipo: string | null;
    modalidad: string | null;
    estado: string;
    promocion?: { nombre: string } | null;
    cursos: Array<{
      id: number;
      nota: number | null;
      curso: {
        nombre: string;
        area: { nombre: string };
      };
    }>;
    pagos: Array<{
      monto: number;
      fecha: Date;
      tipoPago: string;
      numeroComprobante: string | null;
    }>;
  }>;
}) {
  const latestInscripcion = estudiante.inscripciones
    .slice()
    .sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime())[0];

  const cursos = estudiante.inscripciones.flatMap((inscripcion) =>
    inscripcion.cursos.map((item) => ({
      id: item.id,
      nombre: item.curso.nombre,
      area: item.curso.area.nombre,
      modalidad: inscripcion.modalidad ?? "certificado",
      estado: inscripcion.estado,
      inicio: formatDateEs(inscripcion.creadoEn),
      nota: item.nota ?? 0,
      tipo: inscripcion.tipo === "promocion" ? "promocion" : "curso",
      nombrePromocion: inscripcion.promocion?.nombre ?? undefined,
    })),
  );

  return {
    id: estudiante.id,
    nombre: `${estudiante.nombres} ${estudiante.apellidos}`,
    ci: estudiante.ci,
    prefijo: estudiante.prefijo ?? undefined,
    profesion: estudiante.profesion ?? undefined,
    tipoInscripcion: latestInscripcion?.tipo,
    promocionNombre: latestInscripcion?.promocion?.nombre,

    curso:
      latestInscripcion?.tipo === "promocion"
        ? (latestInscripcion?.promocion?.nombre ?? "Promoción")
        : (latestInscripcion?.cursos[0]?.curso.nombre ?? "Sin curso"),
    inscripcion: latestInscripcion
      ? formatDateEs(latestInscripcion.creadoEn)
      : "N/A",
    pago: latestInscripcion
      ? getPagoStatus(
          latestInscripcion.montoTotal,
          latestInscripcion.montoPagado,
        )
      : "pendiente",
    telefono: estudiante.telefono ?? "",
    email: estudiante.email ?? "",
    departamento: estudiante.departamento ?? "",
    cursos,
    pagos:
      latestInscripcion?.pagos.map((p) => ({
        monto: p.monto,
        fecha: formatDateEs(p.fecha),
        tipoPago: p.tipoPago,
        numeroComprobante: p.numeroComprobante,
      })) ?? [],
  };
}

function mapEstudianteToPortalDto(estudiante: {
  id: number;
  ci: string;
  nombres: string;
  apellidos: string;
  prefijo: string | null;
  profesion: string | null;
  telefono: string | null;
  email: string | null;
  departamento: string | null;
  inscripciones: Array<{
    id: number;
    tipo: string | null;
    modalidad: string | null;
    montoTotal: number;
    montoPagado: number;
    creadoEn: Date;
    promocion: { nombre: string } | null;
    cursos: Array<{
      id: number;
      nota: number | null;
      curso: {
        nombre: string;
        area: { nombre: string };
      };
    }>;
  }>;
}) {
  const cursosPagados = estudiante.inscripciones
    .filter((inscripcion) => inscripcion.montoPagado >= inscripcion.montoTotal)
    .flatMap((inscripcion) =>
      inscripcion.cursos.map((item) => ({
        id: item.id,
        nombre: item.curso.nombre,
        area: item.curso.area.nombre,
        tipo: inscripcion.tipo === "promocion" ? "promocion" : "curso",
        promocionNombre: inscripcion.promocion?.nombre ?? undefined,
        modalidad: (inscripcion.modalidad ?? "certificado") as
          | "certificado"
          | "examen",
        fechaInscripcion: formatDateEs(inscripcion.creadoEn),
        nota:
          inscripcion.modalidad === "examen" && item.nota != null
            ? item.nota
            : undefined,
      })),
    );

  return {
    id: estudiante.id,
    ci: estudiante.ci,
    nombreCompleto: `${estudiante.nombres} ${estudiante.apellidos}`,
    prefijo: estudiante.prefijo ?? undefined,
    profesion: estudiante.profesion ?? undefined,
    telefono: estudiante.telefono ?? undefined,
    email: estudiante.email ?? undefined,
    departamento: estudiante.departamento ?? undefined,
    cursos: cursosPagados,
  };
}

export async function listStudents(
  _req: Request,
  res: Response,
): Promise<void> {
  const rows = await prisma.estudiante.findMany({
    orderBy: { nombres: "asc" },
    include: {
      inscripciones: {
        orderBy: { creadoEn: "desc" },
        include: {
          user: { select: { email: true } },
          cursos: { include: { curso: true } },
        },
      },
    },
  });
  res.json(rows.map(mapEstudianteToDto));
}

export async function listCompletedStudents(
  req: Request,
  res: Response,
): Promise<void> {
  const modalidadQuery = String(req.query.modalidad ?? "").trim().toLowerCase();
  const modalidadFilter =
    modalidadQuery === "examen" || modalidadQuery === "certificado"
      ? modalidadQuery
      : undefined;

  const students = await prisma.estudiante.findMany({
    orderBy: { nombres: "asc" },
    include: {
      inscripciones: {
        orderBy: { creadoEn: "desc" },
        include: {
          cursos: { include: { curso: true } },
          promocion: true,
        },
      },
    },
  });

  const result = students
    .map((estudiante) => {
      const completedInscripciones = estudiante.inscripciones.filter(
        (inscripcion) =>
          inscripcion.montoPagado >= inscripcion.montoTotal &&
          (!modalidadFilter || inscripcion.modalidad === modalidadFilter),
      );

      if (completedInscripciones.length === 0) return null;

      const inscription = completedInscripciones[0];
      const cursos = inscription.cursos.map((item) => item.curso.nombre);
      const cursosTexto =
        cursos.length > 2
          ? `${cursos.slice(0, 2).join(", ")} +${cursos.length - 2} más`
          : cursos.join(", ") || "Sin curso";

      return {
        id: estudiante.id,
        nombre: `${estudiante.nombres} ${estudiante.apellidos}`,
        ci: estudiante.ci,
        registro: formatDateEs(estudiante.creadoEn),
        modalidad: (inscription.modalidad ?? "certificado") as
          | "certificado"
          | "examen",
        curso: cursosTexto,
      };
    })
    .filter(Boolean);

  res.json(result);
}

export async function getStudentByCi(
  req: Request,
  res: Response,
): Promise<void> {
  const ci = String(
    Array.isArray(req.params.ci) ? req.params.ci[0] : req.params.ci,
  );
  const estudiante = await prisma.estudiante.findUnique({
    where: { ci },
    include: {
      inscripciones: {
        orderBy: { creadoEn: "desc" },
        include: {
          cursos: { include: { curso: { include: { area: true } } } },
          pagos: true,
          promocion: true,
        },
      },
    },
  });

  if (!estudiante) {
    res.status(404).json({ message: "No encontrado" });
    return;
  }
  res.json(mapEstudianteToDetailDto(estudiante));
}

export async function getStudentPortalByCi(
  req: Request,
  res: Response,
): Promise<void> {
  const ci = String(
    Array.isArray(req.params.ci) ? req.params.ci[0] : req.params.ci,
  ).trim();

  if (!ci) {
    res.status(400).json({ message: "CI requerido" });
    return;
  }

  const estudiante = await prisma.estudiante.findUnique({
    where: { ci },
    include: {
      inscripciones: {
        orderBy: { creadoEn: "desc" },
        include: {
          promocion: true,
          cursos: { include: { curso: { include: { area: true } } } },
        },
      },
    },
  });

  if (!estudiante) {
    res.status(404).json({ message: "Estudiante no encontrado" });
    return;
  }

  res.json(mapEstudianteToPortalDto(estudiante));
}
export async function createStudent(
  req: Request,
  res: Response,
): Promise<void> {
  const {
    ci,
    nombres,
    apellidos,
    prefijo,
    profesion,
    telefono,
    email,
    departamento,
  } = req.body;

  if (!ci || !nombres || !apellidos) {
    res
      .status(400)
      .json({ message: "CI, nombres y apellidos son obligatorios" });
    return;
  }

  const exists = await prisma.estudiante.findUnique({
    where: { ci },
  });

  if (exists) {
    res.status(400).json({ message: "El estudiante ya existe" });
    return;
  }

  const nuevo = await prisma.estudiante.create({
    data: {
      ci,
      nombres,
      apellidos,
      prefijo,
      profesion,
      telefono,
      email,
      departamento,
    },
  });

  res.status(201).json({ estudiante: nuevo });
}

export async function updateStudent(
  req: Request,
  res: Response,
): Promise<void> {
  const ci = String(req.params.ci);

  const { nombres, apellidos, prefijo, profesion, telefono, email, departamento } =
    req.body;

  try {
    const actualizado = await prisma.estudiante.update({
      where: { ci },
      data: {
        nombres,
        apellidos,
        prefijo,
        profesion,
        telefono,
        email,
        departamento,
      },
    });

    res.json(actualizado);
  } catch {
    res.status(404).json({ message: "Estudiante no encontrado" });
  }
}

export async function deleteStudent(
  req: Request,
  res: Response,
): Promise<void> {
  const ci = String(req.params.ci);

  try {
    // Primero obtener el estudiante y sus inscripciones
    const estudiante = await prisma.estudiante.findUnique({
      where: { ci },
      include: {
        inscripciones: { select: { id: true } },
      },
    });

    if (!estudiante) {
      res.status(404).json({ message: "Estudiante no encontrado" });
      return;
    }

    // Eliminar inscripciones en cascada
    for (const inscripcion of estudiante.inscripciones) {
      // Eliminar pagos relacionados
      await prisma.pago.deleteMany({
        where: { inscripcionId: inscripcion.id },
      });
      // Eliminar cursos inscritos
      await prisma.inscripcionCurso.deleteMany({
        where: { inscripcionId: inscripcion.id },
      });
      // Eliminar certificados
      await prisma.certificado.deleteMany({
        where: { inscripcionId: inscripcion.id },
      });
      // Eliminar la inscripción
      await prisma.inscripcion.delete({
        where: { id: inscripcion.id },
      });
    }

    // Finalmente eliminar el estudiante
    await prisma.estudiante.delete({
      where: { ci },
    });

    res.json({ message: "Estudiante eliminado" });
  } catch (error) {
    console.error('Error al eliminar estudiante:', error);
    res.status(500).json({ message: "Error al eliminar estudiante" });
  }
}
