-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "projectLeadId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'STUDENT';

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectLeadId_fkey" FOREIGN KEY ("projectLeadId") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
