import 'dotenv/config';
import {
  PrismaClient,
  Role,
  TipoInscripcion,
  Modalidad,
} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 🧹 CLEAN
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

  const hash = (p: string) => bcrypt.hash(p, 10);

  // 👤 USERS
  await prisma.user.createMany({
    data: [
      { email: 'admin', password: await hash('admin123'), role: Role.administrador },
      { email: 'gerente', password: await hash('gerente123'), role: Role.gerente },
    ],
  });

  // 📚 DATA REAL (desde tu documento)
  const areasData = [
    {
      nombre: 'Leyes en Salud',
      color: '#ef4444',
      cursos: [
        'LEY Nº 1152 - SUS','LEY Nº 475','POLITICAS SAFCI','LEY Nº 3131','LEY Nº 1737',
        'PRIMEROS AUXILIOS','URGENCIAS Y EMERGENCIAS MEDICAS','NORMAS DE BIOSEGURIDAD',
        'REGLAMENTO GENERAL DE HOSPITALES','RNVE 2.0',
        'BIOSEGURIDAD Y MANEJO DE RESIDUOS SOLIDOS','MANEJO DE EXPEDIENTE CLINICO',
        'COD. SEGURIDAD SOCIAL','NORMATIVA DE SEGUROS PUBLICOS',
        'PROTOCOLOS DE ATENCION DEL SEGURO UNICO DE SALUD',
        'BIOSEGURIDAD HOSPITALARIA','AUXILIAR DE FARMACIA',
        'MANEJO DE PACIENTES COVID','FISIOTERAPIA PARA PACIENTES COVID',
        'ATENCION PREHOSPITALARIA'
      ],
    },
    {
      nombre: 'Programas en Salud',
      color: '#22c55e',
      cursos: [
        'SALMI','SOAPS','SIAL','SNIS – VE','PAI','DENGUE','RABIA',
        'FIEBRE AMARILLA','CHIKUNGUNYA','CADENA FRIA','ZIKA',
        'TUBERCULOSIS','INFLUENZA','COQUELUCHE','VIH','SARAMPION'
      ],
    },
    {
      nombre: 'Sistemas en Salud',
      color: '#3b82f6',
      cursos: ['SICE','SIAF','SICOFS','SIP'],
    },
    {
      nombre: 'Gestión Pública',
      color: '#f59e0b',
      cursos: [
        'D.S. 23318 – A','D.S. 0181 SABS','LEY Nº 1178 SAFCO',
        'LEY Nº 004 M.Q.S.C.','POLITICAS PUBLICAS','LEY Nº 548',
        'LEY Nº 348','LEY Nº 045','LEY Nº 243','D.S. 3981',
        'LEY Nº 1990','LEY Nº 2492','LEY Nº 843','LEY Nº 393',
        'LEY Nº 160','LEY Nº 1834','LEY Nº 2297','LEY Nº 1488',
        'LEY Nº 2027','LEY Nº 070','LEY Nº 603','LEY Nº 223',
        'PREVENCION DE LA VIOLENCIA','LEGAL TECH JUDICIAL','RELACIONES HUMANAS'
      ],
    },
    {
      nombre: 'Ofimática',
      color: '#6366f1',
      cursos: ['WINDOWS','WORD','INTERNET','EXCEL','POWER POINT','PUBLISHER'],
    },
    {
      nombre: 'Idiomas',
      color: '#ec4899',
      cursos: ['QUECHUA','AYMARA','INGLES'],
    },
    {
      nombre: 'Otros',
      color: '#64748b',
      cursos: ['ORATORIA Y LIDERAZGO','CLASES VACACIONAL'],
    },
    {
      nombre: 'Área Financiera',
      color: '#14b8a6',
      cursos: [
        'DETECCION DE BILLETES FALSOS',
        'CAJEROS',
        'ATENCION AL CLIENTE',
        'OFICIAL DE CREDITOS'
      ],
    },
  ];

  const cursosMap: Record<string, number> = {};

  for (const area of areasData) {
    const a = await prisma.area.create({
      data: { nombre: area.nombre, color: area.color },
    });

    for (const c of area.cursos) {
      if (cursosMap[c]) continue; // evita duplicados

      const curso = await prisma.curso.create({
        data: { nombre: c, areaId: a.id },
      });

      cursosMap[c] = curso.id;
    }
  }

  // 🧠 HELPERS
  const crearPromo = (nombre: string, periodo: string, cursos: string[]) =>
    prisma.promocion.create({
      data: {
        nombre,
        periodo,
        activa: true,
        cursos: {
          create: cursos.map((c) => ({ cursoId: cursosMap[c] })),
        },
      },
    });

  const crearInscripcion = async ({
    estudianteId,
    tipo,
    promocionId,
    cursos,
    monto,
  }: any) => {
    const ins = await prisma.inscripcion.create({
      data: {
        estudianteId,
        tipo,
        promocionId,
        modalidad: Modalidad.certificado,
        montoTotal: monto,
      },
    });

    await prisma.inscripcionCurso.createMany({
      data: cursos.map((c: string) => ({
        inscripcionId: ins.id,
        cursoId: cursosMap[c],
      })),
    });
  };

  // 🎯 PROMOS
  const promo1Cursos = [
    'LEY Nº 1152 - SUS','LEY Nº 475','PRIMEROS AUXILIOS',
    'BIOSEGURIDAD HOSPITALARIA','LEY Nº 004 M.Q.S.C.'
  ];

  const promo2Cursos = [
    'WORD','EXCEL','INTERNET','POWER POINT','WINDOWS'
  ];

  const promo3Cursos = [
    'DENGUE','ZIKA','TUBERCULOSIS','VIH','SARAMPION'
  ];

  const promo1 = await crearPromo('MARATÓN DE SALUD', 'Abril', promo1Cursos);
  const promo2 = await crearPromo('OFIMÁTICA PRO', 'Abril', promo2Cursos);
  const promo3 = await crearPromo('ENFERMEDADES FRECUENTES', 'Mayo', promo3Cursos);

  // 👨‍🎓 ESTUDIANTES
  const [e1,e2,e3,e4,e5] = await Promise.all([
    prisma.estudiante.create({ data: { ci:'111', nombres:'Luis', apellidos:'Lopez' } }),
    prisma.estudiante.create({ data: { ci:'222', nombres:'Maria', apellidos:'Perez' } }),
    prisma.estudiante.create({ data: { ci:'333', nombres:'Carlos', apellidos:'Gomez' } }),
    prisma.estudiante.create({ data: { ci:'444', nombres:'Ana', apellidos:'Rojas' } }),
    prisma.estudiante.create({ data: { ci:'555', nombres:'Pedro', apellidos:'Mamani' } }),
  ]);

  // 🎓 INSCRIPCIONES
  await crearInscripcion({
    estudianteId: e1.id,
    tipo: TipoInscripcion.promocion,
    promocionId: promo1.id,
    cursos: promo1Cursos,
    monto: 300,
  });

  await crearInscripcion({
    estudianteId: e2.id,
    tipo: TipoInscripcion.promocion,
    promocionId: promo1.id,
    cursos: promo1Cursos.slice(0,4),
    monto: 250,
  });

  await crearInscripcion({
    estudianteId: e3.id,
    tipo: TipoInscripcion.promocion,
    promocionId: promo2.id,
    cursos: promo2Cursos.slice(0,3),
    monto: 200,
  });

  await crearInscripcion({
    estudianteId: e4.id,
    tipo: TipoInscripcion.promocion,
    promocionId: promo3.id,
    cursos: promo3Cursos.slice(0,2),
    monto: 180,
  });

  await crearInscripcion({
    estudianteId: e5.id,
    tipo: TipoInscripcion.individual,
    cursos: ['INTERNET'],
    monto: 80,
  });

  console.log('SEED COMPLETO');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });