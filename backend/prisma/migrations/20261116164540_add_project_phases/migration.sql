-- CreateTable
CREATE TABLE "ProjectPhase" (
    "phase_id" SERIAL NOT NULL,
    "phase_name" TEXT NOT NULL,
    "phase_order" INTEGER NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "project_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectPhase_pkey" PRIMARY KEY ("phase_id")
);

-- CreateIndex
CREATE INDEX "ProjectPhase_project_id_idx" ON "ProjectPhase"("project_id");

-- AddForeignKey
ALTER TABLE "ProjectPhase" ADD CONSTRAINT "ProjectPhase_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;
