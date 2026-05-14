/*
  Warnings:

  - You are about to drop the column `registroMinisterial` on the `Estudiante` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Estudiante" DROP COLUMN "registroMinisterial";

-- CreateTable
CREATE TABLE "Empresa" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nombre" TEXT NOT NULL,
    "nit" TEXT,
    "seprec" TEXT,
    "registroMinisterial" TEXT,
    "logoUrl" TEXT,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);
