ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "usn" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_usn_key" ON "User"("usn");
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'STUDENT';
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "projectLeadId" INTEGER;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$ BEGIN
  ALTER TABLE "Project" ADD CONSTRAINT "Project_projectLeadId_fkey"
    FOREIGN KEY ("projectLeadId") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Project' AND column_name = 'lead_user_id'
  ) THEN
    EXECUTE 'UPDATE "Project" SET "projectLeadId" = "lead_user_id" WHERE "projectLeadId" IS NULL';
  END IF;
END $$;

DO $$ BEGIN
  CREATE TYPE "ProjectMemberRole" AS ENUM ('TEAM_LEAD', 'TECH_LEAD', 'TEAM_MEMBER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "ProjectMember" (
  "id" SERIAL NOT NULL,
  "project_id" TEXT NOT NULL,
  "user_id" INTEGER NOT NULL,
  "role" "ProjectMemberRole" NOT NULL,
  "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProjectMember_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProjectMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProjectMember_project_id_user_id_key" UNIQUE ("project_id", "user_id")
);
