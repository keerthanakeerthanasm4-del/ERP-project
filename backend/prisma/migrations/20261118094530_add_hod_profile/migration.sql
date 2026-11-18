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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HODProfile_pkey" PRIMARY KEY ("id")
);
