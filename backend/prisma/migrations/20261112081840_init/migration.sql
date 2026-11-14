-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "usn" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "ph_no" TEXT,
    "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dept_name" TEXT,

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

    CONSTRAINT "Project_pkey" PRIMARY KEY ("project_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_usn_key" ON "User"("usn");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
