import "dotenv/config";
import bcrypt from "bcrypt";
import pg from "pg";

import { PrismaClient } from "./generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "hodsvce@gmail.com";
  const password = "hodsvce@123";

  const passwordHash = await bcrypt.hash(password, 12);

  const hod = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "HOD",
    },
    create: {
      name: "HOD",
      email,
      passwordHash,
      role: "HOD",
      dept_name: "Administration",
    },
  });

  console.log("HOD account is ready:", hod.email);
}

main()
  .catch((error) => {
    console.error("HOD seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
