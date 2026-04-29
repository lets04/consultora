/*
  Warnings:

  - You are about to drop the column `estado` on the `Estudiante` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Estudiante" DROP COLUMN "estado";

-- AlterTable
ALTER TABLE "Inscripcion" ADD COLUMN     "userId" INTEGER,
ALTER COLUMN "tipo" DROP NOT NULL,
ALTER COLUMN "modalidad" DROP NOT NULL;

-- DropEnum
DROP TYPE "EstadoEstudiante";

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
