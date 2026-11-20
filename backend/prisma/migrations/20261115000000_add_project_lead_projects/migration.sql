CREATE TABLE IF NOT EXISTS "Project" (
  "project_id" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "description" TEXT,
  "start_date" TIMESTAMP(3),
  "deadline" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "lead_user_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("project_id"),
  CONSTRAINT "Project_lead_user_id_fkey" FOREIGN KEY ("lead_user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
