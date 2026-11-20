-- Project table; the original User table is created by the 20260916100652_init baseline.
CREATE TABLE "Project" (
  "project_id" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "description" TEXT,
  "start_date" TIMESTAMP(3),
  "deadline" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  CONSTRAINT "Project_pkey" PRIMARY KEY ("project_id")
);
