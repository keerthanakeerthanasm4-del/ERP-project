-- CreateTable
CREATE TABLE "DepartmentProjectLeadAssignment" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "assignedUserId" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepartmentProjectLeadAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentProjectLeadAssignment_assignedUserId_key" ON "DepartmentProjectLeadAssignment"("assignedUserId");

-- AddForeignKey
ALTER TABLE "DepartmentProjectLeadAssignment" ADD CONSTRAINT "DepartmentProjectLeadAssignment_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
