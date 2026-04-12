-- CreateEnum
CREATE TYPE "Role" AS ENUM ('administrador', 'gerente');

-- CreateEnum
CREATE TYPE "EstadoEstudiante" AS ENUM ('activo', 'inactivo', 'suspendido');

-- CreateEnum
CREATE TYPE "TipoInscripcion" AS ENUM ('promocion', 'individual');

-- CreateEnum
CREATE TYPE "Modalidad" AS ENUM ('certificado', 'examen');

-- CreateEnum
CREATE TYPE "EstadoInscripcion" AS ENUM ('activo', 'completado', 'retirado');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('efectivo', 'transferencia');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estudiante" (
    "id" SERIAL NOT NULL,
    "ci" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "prefijo" TEXT,
    "profesion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "departamento" TEXT,
    "estado" "EstadoEstudiante" NOT NULL DEFAULT 'activo',
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estudiante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#2F5FD0',

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curso" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "areaId" INTEGER NOT NULL,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promocion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promocion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromocionCurso" (
    "promocionId" INTEGER NOT NULL,
    "cursoId" INTEGER NOT NULL,

    CONSTRAINT "PromocionCurso_pkey" PRIMARY KEY ("promocionId","cursoId")
);

-- CreateTable
CREATE TABLE "Inscripcion" (
    "id" SERIAL NOT NULL,
    "estudianteId" INTEGER NOT NULL,
    "tipo" "TipoInscripcion" NOT NULL,
    "promocionId" INTEGER,
    "modalidad" "Modalidad" NOT NULL,
    "estado" "EstadoInscripcion" NOT NULL DEFAULT 'activo',
    "montoTotal" DOUBLE PRECISION NOT NULL,
    "montoPagado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InscripcionCurso" (
    "id" SERIAL NOT NULL,
    "inscripcionId" INTEGER NOT NULL,
    "cursoId" INTEGER NOT NULL,
    "nota" DOUBLE PRECISION,
    "completado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InscripcionCurso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" SERIAL NOT NULL,
    "inscripcionId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipoPago" "TipoPago" NOT NULL,
    "numeroComprobante" TEXT,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificado" (
    "id" SERIAL NOT NULL,
    "inscripcionId" INTEGER NOT NULL,
    "inscripcionCursoId" INTEGER,
    "fechaEmision" TIMESTAMP(3) NOT NULL,
    "codigo" TEXT,

    CONSTRAINT "Certificado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Estudiante_ci_key" ON "Estudiante"("ci");

-- CreateIndex
CREATE UNIQUE INDEX "Area_nombre_key" ON "Area"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "InscripcionCurso_inscripcionId_cursoId_key" ON "InscripcionCurso"("inscripcionId", "cursoId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificado_inscripcionCursoId_key" ON "Certificado"("inscripcionCursoId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificado_codigo_key" ON "Certificado"("codigo");

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromocionCurso" ADD CONSTRAINT "PromocionCurso_promocionId_fkey" FOREIGN KEY ("promocionId") REFERENCES "Promocion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromocionCurso" ADD CONSTRAINT "PromocionCurso_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_promocionId_fkey" FOREIGN KEY ("promocionId") REFERENCES "Promocion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscripcionCurso" ADD CONSTRAINT "InscripcionCurso_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES "Inscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscripcionCurso" ADD CONSTRAINT "InscripcionCurso_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES "Inscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificado" ADD CONSTRAINT "Certificado_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES "Inscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificado" ADD CONSTRAINT "Certificado_inscripcionCursoId_fkey" FOREIGN KEY ("inscripcionCursoId") REFERENCES "InscripcionCurso"("id") ON DELETE SET NULL ON UPDATE CASCADE;
