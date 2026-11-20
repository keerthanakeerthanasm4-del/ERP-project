-- CreateTable
CREATE TABLE "ProjectLeadAssignmentHistory" (
    "id" SERIAL NOT NULL,
    "assignedUserId" INTEGER,
    "assignedName" TEXT NOT NULL,
    "assignedEmail" TEXT NOT NULL,
    "department" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relievedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectLeadAssignmentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectLeadAssignmentHistory_assignedUserId_idx" ON "ProjectLeadAssignmentHistory"("assignedUserId");

-- CreateIndex
CREATE INDEX "ProjectLeadAssignmentHistory_assignedAt_idx" ON "ProjectLeadAssignmentHistory"("assignedAt");

-- AddForeignKey
ALTER TABLE "ProjectLeadAssignmentHistory" ADD CONSTRAINT "ProjectLeadAssignmentHistory_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
