
///<reference types="node" />
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Empresa
  await prisma.empresa.upsert({
    where: { id: 1 },
    update: {
      nombre: "Consultora Innova",
      seprec: "700810038",
      nit: "700536037",
    },
    create: {
      id: 1,
      nombre: "Consultora Innova",
      seprec: "700810038",
      nit: "700536037",
    },
  });

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
  for (const areaData of areasData) {
    const area = await prisma.area.upsert({
      where: {
        nombre: areaData.nombre,
      },
      update: {
        color: areaData.color,
      },
      create: {
        nombre: areaData.nombre,
        color: areaData.color,
      },
    });

    for (const cursoNombre of areaData.cursos) {
      await prisma.curso.upsert({
        where: {
          nombre_areaId: {
            nombre: cursoNombre,
            areaId: area.id,
          },
        },
        update: {},
        create: {
          nombre: cursoNombre,
          areaId: area.id,
        },
      });
    }
  }

  console.log("Empresa, áreas y cursos cargados correctamente");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });