import 'dotenv/config';
import {
  PrismaClient,
  Role,
  TipoInscripcion,
  Modalidad,
  TipoPago,
} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 🧹 LIMPIEZA
  await prisma.certificado.deleteMany();
  await prisma.pago.deleteMany();
  await prisma.inscripcionCurso.deleteMany();
  await prisma.inscripcion.deleteMany();
  await prisma.promocionCurso.deleteMany();
  await prisma.promocion.deleteMany();
  await prisma.curso.deleteMany();
  await prisma.area.deleteMany();
  await prisma.estudiante.deleteMany();
  await prisma.user.deleteMany();

  const hash = (plain: string) => bcrypt.hash(plain, 10);

  // 👤 USERS
  await prisma.user.createMany({
    data: [
      { email: 'admin', password: await hash('admin123'), role: Role.administrador },
      { email: 'gerente', password: await hash('gerente123'), role: Role.gerente },
    ],
  });

  // 📚 ÁREAS + CURSOS
  const areasData = [
    {
      nombre: 'Leyes en Salud',
      color: '#ef4444',
      cursos: [
        'LEY Nº 1152 - SUS',
        'LEY Nº 475',
        'POLITICAS SAFCI',
        'LEY Nº 3131',
        'LEY Nº 1737',
        'PRIMEROS AUXILIOS',
        'URGENCIAS Y EMERGENCIAS MEDICAS',
        'NORMAS DE BIOSEGURIDAD',
        'REGLAMENTO GENERAL DE HOSPITALES',
        'RNVE 2.0',
        'BIOSEGURIDAD Y MANEJO DE RESIDUOS SOLIDOS',
        'MANEJO DE EXPEDIENTE CLINICO',
        'COD. SEGURIDAD SOCIAL',
        'NORMATIVA DE SEGUROS PUBLICOS',
        'PROTOCOLOS DE ATENCION DEL SEGURO UNICO DE SALUD',
        'BIOSEGURIDAD HOSPITALARIA',
        'AUXILIAR DE FARMACIA',
        'MANEJO DE PACIENTES COVID',
        'FISIOTERAPIA PARA PACIENTES COVID',
        'ATENCION PREHOSPITALARIA',
      ],
    },
    {
      nombre: 'Programas en Salud',
      color: '#22c55e',
      cursos: [
        'SALMI',
        'SOAPS',
        'SIAL',
        'SNIS – VE',
        'PAI',
        'DENGUE',
        'RABIA',
        'FIEBRE AMARILLA',
        'CHIKUNGUNYA',
        'CADENA FRIA',
        'ZIKA',
        'TUBERCULOSIS',
        'INFLUENZA',
        'COQUELUCHE',
        'VIH',
        'SARAMPION',
      ],
    },
    {
      nombre: 'Sistemas en Salud',
      color: '#3b82f6',
      cursos: ['SICE', 'SIAF', 'SICOFS', 'SIP'],
    },
    {
      nombre: 'Gestión Pública',
      color: '#f59e0b',
      cursos: [
        'D.S. 23318 – A',
        'D.S. 0181 SABS',
        'LEY Nº 1178 SAFCO',
        'LEY Nº 004 M.Q.S.C.',
        'POLITICAS PUBLICAS',
        'LEY Nº 548',
        'LEY Nº 348',
        'LEY Nº 045',
        'LEY Nº 243',
        'D.S. 3981',
        'LEY Nº 1990',
        'LEY Nº 2492',
        'LEY Nº 843',
        'LEY Nº 393',
        'LEY Nº 160',
        'LEY Nº 1834',
        'LEY Nº 2297',
        'LEY Nº 1488',
        'LEY Nº 2027',
        'LEY Nº 070',
        'LEY Nº 603',
        'LEY Nº 223',
        'PREVENCION DE LA VIOLENCIA',
        'LEGAL TECH JUDICIAL',
        'RELACIONES HUMANAS',
      ],
    },
    {
      nombre: 'Ofimática',
      color: '#6366f1',
      cursos: [
        'WINDOWS',
        'WORD',
        'INTERNET',
        'EXCEL',
        'POWER POINT',
        'PUBLISHER',
      ],
    },
    {
      nombre: 'Idiomas',
      color: '#ec4899',
      cursos: ['QUECHUA', 'AYMARA', 'INGLES'],
    },
    {
      nombre: 'Otros',
      color: '#64748b',
      cursos: ['ORATORIA Y LIDERAZGO', 'CLASES VACACIONAL'],
    },
    {
      nombre: 'Área Financiera',
      color: '#14b8a6',
      cursos: [
        'DETECCION DE BILLETES FALSOS',
        'CAJEROS',
        'ATENCION AL CLIENTE',
        'OFICIAL DE CREDITOS',
      ],
    },
  ];

  const cursosCreados: any[] = [];

  for (const area of areasData) {
    const createdArea = await prisma.area.create({
      data: {
        nombre: area.nombre,
        color: area.color,
      },
    });

    for (const cursoNombre of area.cursos) {
      const curso = await prisma.curso.create({
        data: {
          nombre: cursoNombre,
          areaId: createdArea.id,
        },
      });

      cursosCreados.push(curso);
    }
  }

  // 🎯 PROMOCIÓN MARATÓN (SIN PRECIO)
  const promocion = await prisma.promocion.create({
    data: {
      nombre: 'MARATÓN DE SALUD',
      periodo: '03 al 05 de Abril - 18:00',
      activa: true,
    },
  });

  // 🔥 TODOS LOS CURSOS A LA PROMO
  await prisma.promocionCurso.createMany({
    data: cursosCreados.map((c) => ({
      promocionId: promocion.id,
      cursoId: c.id,
    })),
  });

  // 👨‍🎓 ESTUDIANTE
  const estudiante = await prisma.estudiante.create({
    data: {
      ci: '1234567',
      nombres: 'Juan',
      apellidos: 'Perez',
      telefono: '77777777',
      email: 'juan@test.com',
    },
  });

  // 📝 INSCRIPCIÓN (AQUÍ SE DEFINE EL PRECIO REAL)
  const inscripcion = await prisma.inscripcion.create({
    data: {
      estudianteId: estudiante.id,
      tipo: TipoInscripcion.promocion,
      promocionId: promocion.id,
      modalidad: Modalidad.certificado,
      montoTotal: 300, // 💰 SOLO AQUÍ HAY PRECIO
    },
  });

  // 📚 SE LE ASIGNAN TODOS LOS CURSOS
  await prisma.inscripcionCurso.createMany({
    data: cursosCreados.map((c) => ({
      inscripcionId: inscripcion.id,
      cursoId: c.id,
    })),
  });

  // 💰 PAGO
  await prisma.pago.create({
    data: {
      inscripcionId: inscripcion.id,
      monto: 150,
      tipoPago: TipoPago.efectivo,
    },
  });

  console.log('✅ SEED COMPLETO');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });