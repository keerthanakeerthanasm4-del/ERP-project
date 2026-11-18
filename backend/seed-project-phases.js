import "dotenv/config";

import { PrismaClient } from "./generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const defaultPhases = [
  "Planning",
  "Design",
  "Development",
  "Testing",
  "Deployment",
];

async function seedProjectPhases() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        phases: true,
      },
    });

    for (const project of projects) {
      if (project.phases.length === 0) {
        await prisma.projectPhase.createMany({
          data: defaultPhases.map((phase, index) => ({
            phase_name: phase,
            phase_order: index + 1,
            is_completed: false,
            project_id: project.project_id,
          })),
        });

        console.log(`Default phases added: ${project.project_name}`);
      } else {
        console.log(`Phases already exist: ${project.project_name}`);
      }
    }

    console.log("Project phases seeding completed!");
  } catch (error) {
    console.error("Project phases seeding failed:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seedProjectPhases();