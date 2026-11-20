-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ProjectMemberRole" AS ENUM ('TEAM_LEAD', 'TECH_LEAD', 'TEAM_MEMBER');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "usn" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dept_name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Project" (
    "project_id" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectLeadId" INTEGER,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" SERIAL NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" "ProjectMemberRole" NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMemberHistory" (
    "id" SERIAL NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" "ProjectMemberRole" NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMemberHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "DepartmentProjectLeadAssignment" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "assignedUserId" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepartmentProjectLeadAssignment_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "HODProfile" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT 'HOD Name',
    "designation" TEXT NOT NULL DEFAULT 'Head of Department',
    "employeeId" TEXT NOT NULL DEFAULT 'SVCE-HOD-001',
    "joiningDate" TIMESTAMP(3) NOT NULL DEFAULT '2020-07-01 00:00:00 +00:00',
    "email" TEXT NOT NULL DEFAULT 'hod@svce.ac.in',
    "phone" TEXT NOT NULL DEFAULT '+91 XXXXX XXXXX',
    "department" TEXT NOT NULL DEFAULT 'Computer Science and Engineering',
    "institution" TEXT NOT NULL DEFAULT 'Sri Venkateshwara College of Engineering',
    "location" TEXT NOT NULL DEFAULT 'Bengaluru, Karnataka',
    "profileImage" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HODProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_usn_key" ON "User"("usn");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_project_id_user_id_key" ON "ProjectMember"("project_id", "user_id");

-- CreateIndex
CREATE INDEX "ProjectMemberHistory_project_id_removed_at_idx" ON "ProjectMemberHistory"("project_id", "removed_at");

-- CreateIndex
CREATE INDEX "Meeting_date_startTime_idx" ON "Meeting"("date", "startTime");

-- CreateIndex
CREATE INDEX "Meeting_project_id_idx" ON "Meeting"("project_id");

-- CreateIndex
CREATE INDEX "ProjectPhase_project_id_idx" ON "ProjectPhase"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentProjectLeadAssignment_assignedUserId_key" ON "DepartmentProjectLeadAssignment"("assignedUserId");

-- CreateIndex
CREATE INDEX "ProjectLeadAssignmentHistory_assignedUserId_idx" ON "ProjectLeadAssignmentHistory"("assignedUserId");

-- CreateIndex
CREATE INDEX "ProjectLeadAssignmentHistory_assignedAt_idx" ON "ProjectLeadAssignmentHistory"("assignedAt");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectLeadId_fkey" FOREIGN KEY ("projectLeadId") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMemberHistory" ADD CONSTRAINT "ProjectMemberHistory_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMemberHistory" ADD CONSTRAINT "ProjectMemberHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPhase" ADD CONSTRAINT "ProjectPhase_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentProjectLeadAssignment" ADD CONSTRAINT "DepartmentProjectLeadAssignment_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLeadAssignmentHistory" ADD CONSTRAINT "ProjectLeadAssignmentHistory_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

