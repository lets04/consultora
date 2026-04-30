import type { PrismaClient } from '@prisma/client';

function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getPagoStatus(montoTotal: number, montoPagado: number): 'pagado' | 'parcial' | 'pendiente' {
  if (montoPagado >= montoTotal) return 'pagado';
  if (montoPagado > 0) return 'parcial';
  return 'pendiente';
}

export async function buildAdminDashboard(prisma: PrismaClient) {
  const [totalEstudiantes, inscripcionesRecientes, pagosMes, inscripcionesMes] = await Promise.all([
    prisma.estudiante.count(),
    prisma.inscripcion.findMany({
      orderBy: { creadoEn: 'desc' },
      take: 3,
      include: {
        estudiante: true,
        cursos: { include: { curso: true } },
      },
    }),
    prisma.pago.aggregate({
      _sum: { monto: true },
      where: { fecha: { gte: startOfCurrentMonth() } },
    }),
    prisma.inscripcion.findMany({
      where: { creadoEn: { gte: startOfCurrentMonth() } },
      select: { montoTotal: true, montoPagado: true },
    }),
  ]);

  const categorized = inscripcionesMes.reduce(
    (acc, item) => {
      const status = getPagoStatus(item.montoTotal, item.montoPagado);
      if (status === 'pagado') acc.pagados += 1;
      if (status === 'parcial') acc.parciales += 1;
      if (status === 'pendiente') acc.pendientes += 1;
      acc.pendienteBs += Math.max(item.montoTotal - item.montoPagado, 0);
      if (status === 'parcial') acc.parcialBs += Math.max(item.montoTotal - item.montoPagado, 0);
      return acc;
    },
    { pagados: 0, parciales: 0, pendientes: 0, pendienteBs: 0, parcialBs: 0 },
  );

  return {
    totalEstudiantes,
    pagoPendiente: categorized.pendientes,
    nuevosMes: inscripcionesMes.length,
    cobradoMes: Number(pagosMes._sum.monto ?? 0),
    pendienteBs: categorized.pendienteBs,
    parcialBs: categorized.parcialBs,
    inscripcionesRecientes: inscripcionesRecientes.map((item) => ({
      nombre: `${item.estudiante.nombres} ${item.estudiante.apellidos}`,
      curso: item.cursos[0]?.curso.nombre ?? 'Sin curso',
      pago: getPagoStatus(item.montoTotal, item.montoPagado),
    })),
  };
}

export async function buildGerenteDashboard(prisma: PrismaClient) {
  const [
    totalEstudiantes,
    promocionesActivas,
    promocionesInactivas,
    totalPromociones,
    cursosPromocion,
    estudiantesConPromocion,
    totalCursos,
    totalReg,
    pagoPend,
    inscAct,
    nuevosMes,
  ] =
    await Promise.all([
      prisma.estudiante.count(),
      prisma.promocion.count({ where: { activa: true } }),
      prisma.promocion.count({ where: { activa: false } }),
      prisma.promocion.count(),
      prisma.promocionCurso.count({
        where: { promocion: { activa: true } },
      }),
      prisma.inscripcion.findMany({
        where: { tipo: 'promocion' },
        distinct: ['estudianteId'],
        select: { estudianteId: true },
      }),
      prisma.curso.count(),
      prisma.estudiante.count(),
      prisma.inscripcion.count({ where: { montoPagado: 0 } }),
      prisma.inscripcion.count({ where: { estado: 'activo' } }),
      prisma.inscripcion.count({ where: { creadoEn: { gte: startOfCurrentMonth() } } }),
    ]);

  return {
    estudiantesActivos: totalEstudiantes,
    promocionesActivas,
    promocionesInactivas,
    totalPromociones,
    cursosPromocion,
    estudiantesPromocion: estudiantesConPromocion.length,
    porcentajeEstudiantesPromocion:
      totalEstudiantes > 0 ? Math.round((estudiantesConPromocion.length / totalEstudiantes) * 100) : 0,
    cursosCatalogo: totalCursos,
    resumenEstudiantes: {
      totalRegistrados: totalReg,
      pagoPendiente: pagoPend,
      inscripcionesActivas: inscAct,
      nuevosMes,
    },
  };
}
