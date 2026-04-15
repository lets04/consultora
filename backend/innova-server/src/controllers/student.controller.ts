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
  estado: string;
  inscripciones: Array<{
    creadoEn: Date;
    montoTotal: number;
    montoPagado: number;
    estado: string;
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
    estado: estudiante.estado,
  };
}

function mapEstudianteToDetailDto(estudiante: {
  id: number;
  nombres: string;
  apellidos: string;
  ci: string;
  estado: string;
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
    cursos: Array<{ curso: { nombre: string; area: { nombre: string } } }>;
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

  return {
    id: estudiante.id,
    nombre: `${estudiante.nombres} ${estudiante.apellidos}`,
    ci: estudiante.ci,
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
    estado: estudiante.estado,
    telefono: estudiante.telefono ?? "",
    email: estudiante.email ?? "",
    departamento: estudiante.departamento ?? "",
    cursos:
      latestInscripcion?.cursos.map((item) => ({
        nombre: item.curso.nombre,
        area: item.curso.area.nombre,
        modalidad: latestInscripcion.modalidad ?? "certificado",
        estado: latestInscripcion.estado,
        inicio: formatDateEs(latestInscripcion.creadoEn),
      })) ?? [],
    pagos:
      latestInscripcion?.pagos.map((p) => ({
        monto: p.monto,
        fecha: formatDateEs(p.fecha),
        tipoPago: p.tipoPago,
        numeroComprobante: p.numeroComprobante,
      })) ?? [],
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
        include: { cursos: { include: { curso: true } } },
      },
    },
  });
  res.json(rows.map(mapEstudianteToDto));
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
      estado: "activo",
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

  const { nombres, apellidos, telefono, email, profesion, departamento } =
    req.body;

  try {
    const actualizado = await prisma.estudiante.update({
      where: { ci },
      data: {
        nombres,
        apellidos,
        telefono,
        email,
        profesion,
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
    await prisma.estudiante.delete({
      where: { ci },
    });

    res.json({ message: "Estudiante eliminado" });
  } catch {
    res.status(404).json({ message: "No encontrado" });
  }
}
