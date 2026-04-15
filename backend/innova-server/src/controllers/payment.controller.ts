import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { Student as StudentDto } from "../models/student.model.js";
import { formatDateEs } from "../utils/dateFormat.js";

function getPagoStatus(
  montoTotal: number,
  montoPagado: number,
): "pagado" | "parcial" | "pendiente" {
  if (montoPagado >= montoTotal) return "pagado";
  if (montoPagado > 0) return "parcial";
  return "pendiente";
}

function mapInscripcionToStudent(item: {
  id: number;
  estudiante: { nombres: string; apellidos: string; ci: string };
  cursos: Array<{ curso: { nombre: string } }>;
  creadoEn: Date;
  montoTotal: number;
  montoPagado: number;
  estado: string;
}) {
  const total = item.montoTotal;
  const pagado = item.montoPagado;
  const saldo = total - pagado;

  return {
    id: item.id,
    estudiante: `${item.estudiante.nombres} ${item.estudiante.apellidos}`,
    curso: item.cursos[0]?.curso.nombre ?? "Sin curso",
    fecha: formatDateEs(item.creadoEn),
    tipo: "",
    modalidad: "",

    total,
    pagado,
    saldo,
    estadoPago: getPagoStatus(total, pagado),
  };
}

function isPagoFiltro(v: string): v is "pagado" | "parcial" | "pendiente" {
  return v === "pagado" || v === "parcial" || v === "pendiente";
}

export async function getSummary(_req: Request, res: Response): Promise<void> {
  const inscriptions = await prisma.inscripcion.findMany({
    select: { montoTotal: true, montoPagado: true },
  });
  const pendientes = inscriptions.filter((i) => i.montoPagado === 0).length;
  const parciales = inscriptions.filter(
    (i) => i.montoPagado > 0 && i.montoPagado < i.montoTotal,
  ).length;
  const pagados = inscriptions.filter(
    (i) => i.montoPagado >= i.montoTotal,
  ).length;
  res.json({ pendientes, parciales, pagados });
}

export async function listByFiltro(req: Request, res: Response): Promise<void> {
  const param = Array.isArray(req.params.filtro)
    ? req.params.filtro[0]
    : req.params.filtro;
  const raw = String(param ?? "").toLowerCase();
  if (!isPagoFiltro(raw)) {
    res.json({
      filtro: param ?? "",
      items: [],
      mensaje: "Filtro no reconocido. Usa pagado, parcial o pendiente.",
    });
    return;
  }

  const inscriptions = await prisma.inscripcion.findMany({
    orderBy: { creadoEn: "desc" },
    include: {
      estudiante: true,
      promocion: true,
      cursos: { include: { curso: true } },
    },
  });

  const filtered = inscriptions.filter(
    (insc) => getPagoStatus(insc.montoTotal, insc.montoPagado) === raw,
  );
  res.json({
    filtro: raw,
    items: filtered.map(mapInscripcionToStudent),
    mensaje: "",
  });
}

export async function createPayment(
  req: Request,
  res: Response,
): Promise<void> {
  const { inscripcionId, monto, tipoPago, numeroComprobante } = req.body;

  if (!inscripcionId || monto == null || !tipoPago) {
    res.status(400).json({ message: "Datos de pago incompletos" });
    return;
  }

  const inscripcion = await prisma.inscripcion.findUnique({
    where: { id: inscripcionId },
  });

  if (!inscripcion) {
    res.status(404).json({ message: "Inscripción no encontrada" });
    return;
  }

  if (monto <= 0) {
    res.status(400).json({ message: "El monto debe ser mayor a 0" });
    return;
  }

  const total = inscripcion.montoTotal;
  const pagado = inscripcion.montoPagado;
  const saldo = total - pagado;

  if (pagado >= total) {
    res.status(400).json({ message: "La inscripción ya está completamente pagada" });
    return;
  }

  if (monto > saldo) {
    res.status(400).json({ message: "El monto excede el saldo pendiente" });
    return;
  }
  const pago = await prisma.pago.create({
    data: {
      inscripcionId,
      monto,
      tipoPago,
      numeroComprobante,
    },
  });


  await prisma.inscripcion.update({
    where: { id: inscripcionId },
    data: {
      montoPagado: {
        increment: monto,
      },
    },
  });

  res.status(201).json(pago);
}
