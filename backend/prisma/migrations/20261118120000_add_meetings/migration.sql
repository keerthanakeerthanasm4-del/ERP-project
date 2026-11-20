CREATE TABLE "Meeting" (
    "meeting_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "project_id" TEXT,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("meeting_id")
);

CREATE INDEX "Meeting_date_startTime_idx" ON "Meeting"("date", "startTime");
CREATE INDEX "Meeting_project_id_idx" ON "Meeting"("project_id");

ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_project_id_fkey"
FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE SET NULL ON UPDATE CASCADE;
