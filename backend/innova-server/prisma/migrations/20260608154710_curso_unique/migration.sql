/*
  Warnings:

  - A unique constraint covering the columns `[nombre,areaId]` on the table `Curso` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Curso_nombre_areaId_key" ON "Curso"("nombre", "areaId");
