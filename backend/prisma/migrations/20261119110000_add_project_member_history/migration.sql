CREATE TABLE "ProjectMemberHistory" (
    "id" SERIAL NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" "ProjectMemberRole" NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMemberHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProjectMemberHistory_project_id_removed_at_idx"
ON "ProjectMemberHistory"("project_id", "removed_at");

ALTER TABLE "ProjectMemberHistory"
ADD CONSTRAINT "ProjectMemberHistory_project_id_fkey"
FOREIGN KEY ("project_id") REFERENCES "Project"("project_id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectMemberHistory"
ADD CONSTRAINT "ProjectMemberHistory_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "User"("user_id")
ON DELETE CASCADE ON UPDATE CASCADE;
